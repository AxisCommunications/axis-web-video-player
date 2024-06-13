import type { WebRtcContext as LkpWebRtcContext, ErrorCallback, WebRtcError } from "@axteams-one/webrtcvideo";
import { SignalingClient } from "../signaling";
import { WebRtcContextError } from "./WebRtcContextError";

/**
 * Context for a WebRTC communication.
 */
export class WebRtcContext {
	constructor(private context: LkpWebRtcContext) {
		const errorCallback = this.createErrorCallback((error) => {
			console.error("Context error:", error.toString());
		});
		this.registerErrorCallback(errorCallback);
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
	setVolumeLevel(volume: number): Promise<void> {
		return this.context.setVolumeLevel(volume);
	}

	/**
	 * @returns The current volume level between 0.0 and 1.0.
	 */
	getVolumeLevel(): Promise<number> {
		return this.context.getVolumeLevel();
	}

	/**
	 * Set the mute state of incoming audio (from the remote device).
	 * @param state true for muted, false for unmuted.
	 */
	setMuteState(state: boolean): Promise<void> {
		return this.context.setMuted(state);
	}

	/**
	 * @returns Returns the current mute state, true for muted, false for unmuted.
	 */
	getMuteState(): Promise<boolean> {
		return this.context.getMuted();
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
