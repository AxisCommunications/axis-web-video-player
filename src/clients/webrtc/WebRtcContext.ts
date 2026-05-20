/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import {
	type WebRtcContext as InnerWebRtcContext,
	type ErrorCallback,
	type WebRtcError,
	PlayerState as InnerPlayerState,
} from "@axiscommunications/webrtcvideo";
import { WebRtcContextError } from "./WebRtcContextError";

/**
 * Context for a WebRTC communication.
 */
export class WebRtcContext {
	/**
	 * @internal
	 */
	constructor(protected context: InnerWebRtcContext) {
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
	 * @param callback The callback to be called when the player state changes.
	 */
	async setPlayerStateChangedCallback(callback: PlayerStateChangedCallback): Promise<void> {
		await this.context.setPlayerStateChangeHandler((state) => {
			callback(this.mapPlayerState(state));
		});
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

	private createErrorCallback(userCallback: WebRtcContextErrorCallback): ErrorCallback {
		return (error: WebRtcError) => {
			const contextError = WebRtcContextError.fromWebRtcError(error);
			userCallback(contextError);
		};
	}

	private registerErrorCallback(callback: ErrorCallback) {
		this.context.setErrorHandler(callback);
	}

	private mapPlayerState(state: InnerPlayerState): PlayerState {
		switch (state) {
			case InnerPlayerState.Playing:
				return "playing";
			case InnerPlayerState.Paused:
				return "paused";
			case InnerPlayerState.Ended:
				return "ended";
			case InnerPlayerState.Initializing:
			default:
				return "initializing";
		}
	}
}

/**
 * Callback function for context errors.
 */
export type WebRtcContextErrorCallback = (error: WebRtcContextError) => void;

/**
 * Possible player states
 */
export type PlayerState = "initializing" | "playing" | "paused" | "ended";

/**
 * Callback function for player state changes.
 */
export type PlayerStateChangedCallback = (state: PlayerState) => void;
