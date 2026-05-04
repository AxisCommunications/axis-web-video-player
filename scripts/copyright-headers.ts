#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";

const COPYRIGHT_HEADER = `/**
 * Copyright (C) Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

`;

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
	if (!content.startsWith(COPYRIGHT_HEADER)) {
		console.error(`Missing copyright header: ${filePath}`);
		return false;
	}
	return true;
}

function addHeader(filePath: string): void {
	const content = fs.readFileSync(filePath, "utf8");
	if (content.startsWith(COPYRIGHT_HEADER)) {
		return;
	}
	fs.writeFileSync(filePath, COPYRIGHT_HEADER + content, "utf8");
	console.log(`Added copyright header header to ${filePath}`);
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
