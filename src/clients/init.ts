/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import init from "@axiscommunications/webrtcvideo";

let gResolve: ((_: unknown) => void) | null = null;

export let isInited = false;

const initPromise = new Promise((resolve) => {
	gResolve = resolve;
}).then(async () => {
	await init();
	isInited = true;
});

/**
 * Initializes the Axis Web Video library.
 * This function must be called and its promise resolved before using any other
 * Axis Web Video library function.
 */
export function axisWebVideoInit(): Promise<void> {
	if (gResolve) {
		gResolve(null);
		gResolve = null;
	}
	return initPromise;
}
