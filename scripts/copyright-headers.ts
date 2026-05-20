#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";

const MIN_YEAR = 2026;

const LEGACY_COPYRIGHT_HEADER = `/**
 * Copyright (C) Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

`;

const COPYRIGHT_HEADER_REGEX =
	/^\/\*\*\n \* Copyright \(C\) (\d{4}) Axis Communications AB, Lund, Sweden\n \*\n \* Use of this source code is governed by an MIT-style\n \* license that can be found in the LICENSE.md file or at\n \* https:\/\/opensource.org\/licenses\/MIT\.\n \*\/\n\n/;

const EXCLUDES = ["vite.config.ts", "vite-env.d.ts"];

enum Mode {
	Check = 0,
	Fix = 1,
}

const args = process.argv.slice(2);

function printUsage(): never {
	console.error("Usage: tsx copyright-headers.ts <check | fix> <startPath> [startPath2 ...]");
	process.exit(1);
}

const modeFlag = args[0];
let mode: Mode;
if (modeFlag === "check") {
	mode = Mode.Check;
} else if (modeFlag === "fix") {
	mode = Mode.Fix;
} else {
	printUsage();
}

const startPaths = args.slice(1);
if (startPaths.length === 0) {
	printUsage();
}

function getCurrentYear(): number {
	return new Date().getFullYear();
}

function getCopyrightHeader(year: number): string {
	return `/**
 * Copyright (C) ${year} Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

`;
}

function collectTsFiles(dir: string): string[] {
	const results: string[] = [];

	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch (err) {
		console.error(`Cannot read directory: ${dir}: ${err}`);
		process.exit(1);
	}

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory() && entry.name !== "node_modules") {
			results.push(...collectTsFiles(fullPath));
		} else if (
			entry.isFile() &&
			entry.name.endsWith(".ts") &&
			!EXCLUDES.includes(path.basename(entry.name))
		) {
			results.push(fullPath);
		}
	}

	return results;
}

function checkHeader(filePath: string): boolean {
	const content = fs.readFileSync(filePath, "utf8");
	const match = content.match(COPYRIGHT_HEADER_REGEX);
	if (!match) {
		console.error(`Missing copyright header: ${filePath}`);
		return false;
	}

	const year = Number(match[1]);
	const currentYear = getCurrentYear();
	if (year < MIN_YEAR || year > currentYear) {
		console.error(
			`Invalid copyright year in ${filePath}: ${year}. Expected between ${MIN_YEAR} and ${currentYear}.`,
		);
		return false;
	}

	return true;
}

function addHeader(filePath: string): void {
	const content = fs.readFileSync(filePath, "utf8");
	const currentYear = getCurrentYear();
	const expectedHeader = getCopyrightHeader(currentYear);

	if (content.startsWith(expectedHeader)) {
		return;
	}

	let updatedContent: string;
	const match = content.match(COPYRIGHT_HEADER_REGEX);
	if (match) {
		updatedContent = expectedHeader + content.slice(match[0].length);
	} else if (content.startsWith(LEGACY_COPYRIGHT_HEADER)) {
		updatedContent = expectedHeader + content.slice(LEGACY_COPYRIGHT_HEADER.length);
	} else {
		updatedContent = expectedHeader + content;
	}

	if (updatedContent !== content) {
		fs.writeFileSync(filePath, updatedContent, "utf8");
		console.log(`Updated copyright header in ${filePath}`);
	}
}

const allFiles: string[] = [];

for (const startPath of startPaths) {
	const resolvedPath = path.resolve(startPath);

	if (!fs.existsSync(resolvedPath)) {
		console.error(`Path does not exist: ${resolvedPath}`);
		process.exit(1);
	}

	const stat = fs.statSync(resolvedPath);
	if (stat.isDirectory()) {
		allFiles.push(...collectTsFiles(resolvedPath));
	} else if (stat.isFile() && resolvedPath.endsWith(".ts")) {
		allFiles.push(resolvedPath);
	}
}

if (allFiles.length === 0) {
	console.log("No .ts files found.");
	process.exit(0);
}

let hasError = false;

for (const file of allFiles) {
	if (mode === Mode.Check) {
		if (!checkHeader(file)) {
			hasError = true;
		}
	} else if (mode === Mode.Fix) {
		addHeader(file);
	}
}

if (mode === Mode.Check && hasError) {
	console.error("\nCheck failed: one or more files are missing the expected copyright header.");
	process.exit(1);
}
