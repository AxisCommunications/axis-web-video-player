import type {
	WebRtcContext as InnerWebRtcContext,
	ErrorCallback,
	WebRtcError,
	WebRtcEvent,
	PtzPreset as InnerPtzPreset,
} from "@axteams-one/webrtcvideo";
import { SignalingClient } from "../signaling";
import { WebRtcContextError } from "./WebRtcContextError";

/**
 * Context for a WebRTC communication.
 */
export class WebRtcContext {
	private ptz: Ptz;

	constructor(private context: InnerWebRtcContext) {
		const errorCallback = this.createErrorCallback((error) => {
			console.error("Context error:", error.toString());
		});
		this.registerErrorCallback(errorCallback);

		this.ptz = new Ptz();
		const eventCallback = (event: WebRtcEvent) => {
			this.ptz.onEvent(event);
		};
		context.setEventHandler(eventCallback);
	}

	/**
	 * @param callback The callback to be called when an error occurs.
	 */
	setErrorCallback(callback: WebRtcContextErrorCallback): void {
		this.registerErrorCallback(this.createErrorCallback(callback));
	}

	/**
	 * Disconnects the context.
	 */
	disconnect(): void {
		this.context.disconnect();
	}

	/**
	 * Set volume of played audio.
	 *
	 * Note: This does not affect the mute setting
	 * @param volume Volume as float between 0.0 and 1.0.
	 */
	async setVolumeLevel(volume: number): Promise<void> {
		await this.context.setVolumeLevel(volume);
	}

	/**
	 * @returns The current volume level between 0.0 and 1.0.
	 */
	async getVolumeLevel(): Promise<number> {
		return await this.context.getVolumeLevel();
	}

	/**
	 * Set the mute state of incoming audio (from the remote device).
	 * @param state true for muted, false for unmuted.
	 */
	async setMuteState(state: boolean): Promise<void> {
		await this.context.setMuted(state);
	}

	/**
	 * @returns Returns the current mute state, true for muted, false for unmuted.
	 */
	async getMuteState(): Promise<boolean> {
		return await this.context.getMuted();
	}

	/**
	 * Zooms by the provided number of steps relative to the current position.
	 * @param steps The number of steps to zoom. Positive numbers zoom in, negative numbers zoom out. Range -9999...9999.
	 */
	async zoomRelative(steps: number): Promise<void> {
		await this.ptz.waitForPtzReady();
		try {
			await this.context.ptzRelativeZoom(steps);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Zooms continuously with the provided velocity.
	 * @param velocity The zoom velocity. Positive numbers zoom in, negative numbers zoom out. 0 stops the zooming. Range -100...100.
	 */
	async zoomContinuous(velocity: number): Promise<void> {
		await this.ptz.waitForPtzReady();
		try {
			await this.context.ptzContinuousZoom(velocity);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Centers the view on the provided coordinates.
	 * The coordinates are in pixels, relative to the video container HTML element.
	 * The offsetX/offsetY parameters from a click event handler on the video container element can be used unmodified.
	 * @param x x coordinate.
	 * @param y y coordinate.
	 */
	async center(x: number, y: number): Promise<void> {
		await this.ptz.waitForPtzReady();
		try {
			await this.context.ptzCenter(x, y);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Fetches the configured PTZ presets.
	 * @returns The list of configured PTZ presets.
	 */
	async getPtzPresets(): Promise<PtzPreset[]> {
		await this.ptz.waitForPtzReady();
		try {
			const presets = await this.context.ptzGetPresets();
			return presets.map((preset: InnerPtzPreset) => {
				return new PtzPreset(preset.name, preset.id);
			});
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Jumps to a PTZ preset.
	 * @param preset A PTZ preset received from {@link getPtzPresets}.
	 */
	async gotoPtzPreset(preset: PtzPreset): Promise<void> {
		await this.ptz.waitForPtzReady();
		try {
			await this.context.ptzGotoPreset(preset.id());
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	private createErrorCallback(userCallback: WebRtcContextErrorCallback): ErrorCallback {
		return (error: WebRtcError) => {
			const contextError = WebRtcContextError.fromWebRtcError(error);
			userCallback(contextError);
		};
	}

	private registerErrorCallback(callback: ErrorCallback) {
		SignalingClient.Instance.registerCallback(callback);
		this.context.setErrorHandler(callback);
	}
}

/**
 * Callback function for context errors.
 */
export type WebRtcContextErrorCallback = (error: WebRtcContextError) => void;

/**
 * A PTZ preset
 */
export class PtzPreset {
	/**
	 * @internal
	 */
	constructor(
		public name: string,
		private _id: number,
	) {}

	/**
	 * @internal
	 */
	id(): number {
		return this._id;
	}
}

enum PtzState {
	Init = 0,
	Ready = 1,
	Error = 2,
}

const PTZ_TIMEOUT_MS = 5000;

class Ptz {
	private state: PtzState;
	private promiseMap: PromiseMap = new PromiseMap();

	constructor() {
		this.state = PtzState.Init;
	}

	async waitForPtzReady(): Promise<void> {
		if (this.state === PtzState.Ready) {
			return;
		}
		if (this.state === PtzState.Error) {
			throw new WebRtcContextError("PtzFailed", "PTZ initialization failed");
		}

		const promise = new Promise((resolve, reject) => {
			const id = this.promiseMap.register(resolve, reject);
			setTimeout(() => {
				if (this.state === PtzState.Init) {
					this.promiseMap.reject(id, "PTZ initialization timed out");
				}
			}, PTZ_TIMEOUT_MS);
		});

		await promise;
	}

	private setState(state: PtzState) {
		if (state !== this.state) {
			this.state = state;
			this.onStateChanged(state);
		}
	}

	onEvent(event: WebRtcEvent) {
		switch (event.eventType) {
			case "PtzReady":
				this.setState(PtzState.Ready);
				break;
			case "PtzInitFailed":
				this.setState(PtzState.Error);
				break;
		}
	}

	private onStateChanged(newState: PtzState) {
		if (newState === PtzState.Ready) {
			this.promiseMap.resolveAll();
		} else if (newState === PtzState.Error) {
			this.promiseMap.rejectAll("PTZ initialization failed");
		}
	}
}

class PromiseMap {
	private counter = 0;
	private map: Map<number, [(value: unknown) => void, (reason: unknown) => void]> = new Map();

	register(resolve: (value: unknown) => void, reject: (reason: unknown) => void): number {
		const id = this.counter;
		this.map.set(id, [resolve, reject]);
		this.counter += 1;
		return id;
	}

	reject(id: number, reason: string) {
		const callbacks = this.map.get(id);
		if (callbacks) {
			callbacks[1](new WebRtcContextError("PtzFailed", reason));
			this.map.delete(id);
		}
	}

	resolveAll() {
		for (const [_id, [resolve, _reject]] of this.map) {
			resolve(undefined);
		}
		this.map.clear();
	}

	rejectAll(reason: string) {
		for (const [_id, [_resolve, reject]] of this.map) {
			reject(new WebRtcContextError("PtzFailed", reason));
		}
		this.map.clear();
	}
}
