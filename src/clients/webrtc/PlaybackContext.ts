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
	async changeRecording({ recordingDetails, autoPlay, offset }: ChangeRecordingOptions<T>) {
		const request = new PlaybackVideoRequestParamObject(
			recordingDetails.build(this.options.targetId),
		);
		request.setOrgId(this.options.orgId);
		request.setAutoplay(autoPlay);
		if (offset) {
			request.setOffset(offset);
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
