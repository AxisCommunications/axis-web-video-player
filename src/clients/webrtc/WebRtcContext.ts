import type { WebRtcContext as LkpWebRtcContext, ErrorCallback } from "@lkp-rnd/webrtcvideo";
import { SignalingClient } from "../signaling";

/**
 * Context for a WebRTC communication.
 */
export class WebRtcContext {
	private errorCallback: ErrorCallback;

	constructor(private context: LkpWebRtcContext) {
		this.errorCallback = (error) => {
			console.error("Context error:", error.toString());
		};
		SignalingClient.Instance.registerCallback(this.errorCallback);
		context.setErrorHandler(this.errorCallback);
	}

	/**
	 * @param cb The callback to be called when an error occurs.
	 */
	setErrorCallback(cb: ErrorCallback): void {
		this.errorCallback = cb;
	}

	/**
	 * Disconnects the context.
	 */
	disconnect(): void {
		this.context.disconnect();
	}

	/**
	 * Set volume of played audio.
	 * @param volume Volume as float between 0.0 and 1.0.
	 */
	setVolumeLevel(volume: number): Promise<void> {
		return this.context.setVolumeLevel(volume);
	}

	/**
	 * @returns The current volume level between 0.0 and 1.0.
	 */
	getVolumeLevel(): Promise<number> {
		return this.context.getVolumeLevel();
	}
}
