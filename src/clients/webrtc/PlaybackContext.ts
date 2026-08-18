/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import {
	PlaybackVideoRequestParamObject,
	type WebRtcError,
	type WebRtcContext as InnerWebRtcContext,
} from "@axiscommunications/webrtcvideo";
import type { RecordingDetails } from "./recording-details";
import type { PlaybackOptions, WebRtcClientOptions } from "./WebRtcClient";
import { WebRtcContext } from "./WebRtcContext";
import { WebRtcContextError } from "./WebRtcContextError";

/**
 * Context for a recording playback session.
 */
export class PlaybackContext<T extends RecordingDetails> extends WebRtcContext {
	/**
	 * @internal
	 */
	constructor(
		context: InnerWebRtcContext,
		private options: WebRtcClientOptions,
	) {
		super(context);
	}

	/**
	 * Start playing.
	 */
	async play() {
		await this.context.play();
	}

	/**
	 * Pause playback.
	 */
	async pause() {
		await this.context.pause();
	}

	/**
	 * Whether the playback is paused.
	 * @returns Whether the playback is paused.
	 */
	async isPaused(): Promise<boolean> {
		return await this.context.isPaused();
	}

	/**
	 * Jump to a different position in the recording.
	 *
	 * Note that `Date` only has millisecond precision.
	 * If the recording start time has microsecond precision (and the microsecond part is non-zero),
	 * converting it right away into Date might lead to attempting to play before the start, resulting in an error.
	 *
	 * @param position The absolute time to start playing from.
	 */
	async jump(position: Date) {
		const bookmark = this.context.getStateBookmark();
		if (!bookmark) {
			return;
		}
		const currentTime = new Date(bookmark.calculateAbsoluteTime());
		const offset = position.getTime() - currentTime.getTime();
		bookmark.addOffset(offset / 1000);

		await this.requestPlayback(bookmark);
	}

	/**
	 * Change to a different recording on the same target.
	 * @param options Options for playback of the new recording.
	 */
	async changeRecording(options: ChangeRecordingOptions<T>) {
		const request = new PlaybackVideoRequestParamObject(
			options.recordingDetails.build(this.options.targetId),
		);
		request.setOrgId(this.options.orgId);
		request.setAutoplay(options.autoPlay);
		if (options.offset) {
			request.setOffset(options.offset);
		}
		await this.requestPlayback(request);
	}

	/**
	 * Sets a callback for when the playback position is updated.
	 * @param callback Callback to be called when the playback position has been updated.
	 */
	async setPositionChangedCallback(callback: PlaybackPositionChangedCallback) {
		await this.context.setPositionChangedHandler((position) => callback(new Date(position)));
	}

	/**
	 * Get the current position of the playback.
	 * @returns The absolute time of the current playback position.
	 */
	async getPosition(): Promise<Date> {
		const position = this.context.getPositionTimeString();
		if (!position) {
			throw new WebRtcContextError("OtherError", "Operation not supported");
		}
		return new Date(position);
	}

	/**
	 * Zooms by the provided number of steps relative to the current position.
	 *
	 * Throws if digital PTZ isn't configured
	 * @param steps The number of steps to zoom. Positive numbers zoom in, negative numbers zoom out. Range -9999...9999.
	 */
	async zoomRelative(steps: number): Promise<void> {
		try {
			await this.context.ptzRelativeZoom(steps);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Zooms continuously with the provided velocity.
	 *
	 * Throws if digital PTZ isn't configured
	 * @param velocity The zoom velocity. Positive numbers zoom in, negative numbers zoom out. 0 stops the zooming. Range -100...100.
	 */
	async zoomContinuous(velocity: number): Promise<void> {
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
	 *
	 * Throws if digital PTZ isn't configured
	 * @param x x coordinate.
	 * @param y y coordinate.
	 */
	async center(x: number, y: number): Promise<void> {
		try {
			await this.context.ptzCenter(x, y);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Moves the camera continuously in the specified pan and tilt directions.
	 * Both speeds must be between -100 and 100, inclusive.
	 * Speeds greater than zero moves right/top and speeds lower than zero moves left/down.
	 * Set a speed to zero to stop movement along that axis.
	 *
	 * Throws if digital PTZ isn't configured
	 * @param verticalSpeed vertical speed
	 * @param horizontalSpeed horizontal speed
	 */
	async panTiltContinuous(verticalSpeed: number, horizontalSpeed: number) {
		try {
			await this.context.ptzContinuousPanTilt(verticalSpeed, horizontalSpeed);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Request a desired playback speed.
	 *
	 * Note: It is possible that the browser does not support the requested speed.
	 * Check the return value to see what the actual playback speed is after this function resolves.
	 * @param speed The desired playback speed
	 * @returns The actual playback speed after the operation
	 */
	async requestPlaybackSpeed(speed: number): Promise<number> {
		return await this.context.setPlaybackSpeed(speed);
	}

	private async requestPlayback(request: PlaybackVideoRequestParamObject) {
		// We need to save these in order to restore
		// them after requestPlayback, since it will reset audio settings
		const muteState = await this.context.getMuted();
		const volumeLevel = await this.context.getVolumeLevel();
		try {
			await this.context.requestPlayback(request);
		} catch (error) {
			const webRtcError = error as WebRtcError;
			throw WebRtcContextError.fromWebRtcError(webRtcError);
		}
		this.context.setMuted(muteState);
		this.context.setVolumeLevel(volumeLevel);
	}
}

/**
 * Callback function for playback position updates.
 * @param position The absolute time of the current playback position.
 */
export type PlaybackPositionChangedCallback = (position: Date) => void;

/**
 * Options for changing the recording in an active playback session.
 */
export type ChangeRecordingOptions<T extends RecordingDetails> = Omit<
	PlaybackOptions<T>,
	"videoElement"
>;
