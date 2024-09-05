import init from "@axiscommunications/webrtcvideo";

let gResolve: ((_: unknown) => void) | null = null;

export let vaasIsInited = false;

const initPromise = new Promise((resolve) => {
	gResolve = resolve;
}).then(async () => {
	await init();
	vaasIsInited = true;
});

/**
 * Initializes the VaaS library.
 * This function must be called and its promise resolved before using any other
 * VaaS library function.
 */
export function vaasInit(): Promise<void> {
	if (gResolve) {
		gResolve(null);
		gResolve = null;
	}
	return initPromise;
}
