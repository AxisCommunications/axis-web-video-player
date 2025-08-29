import {
	LiveVideoRequestParamObject,
	PlaybackVideoRequestParamObject,
	type SignalingHandler,
	WebRtcContext,
	type WebRtcError,
	WebRtcErrorCode,
} from "@axiscommunications/webrtcvideo";
import { CredentialsClient, type CredentialsClientOptions } from "../CredentialsClient";
import { SignalingClient } from "../signaling";
import { WebRtcLiveStreamContext } from "./WebRtcLiveStreamContext";
import type { StreamDetails } from "./stream-details";
import { WebRtcContextError } from "./WebRtcContextError";
import { CloudStorageRecordingDetails, type RecordingDetails } from "./recording-details";
import { PlaybackContext } from "./PlaybackContext";

/**
 * Options for the WebRtcClient.
 */
export interface WebRtcClientOptions extends CredentialsClientOptions {
	/**
	 * Id of the target to connect to.
	 * Mandatory except for Cloud Storage playback
	 */
	targetId?: string;
	/**
	 * The organization id that the target belongs to.
	 */
	orgId: string;
}

/**
 * Options for starting a live stream.
 */
export interface LiveStreamOptions {
	/**
	 * Container element for the video.
	 */
	videoElement: HTMLElement;
	/**
	 * Details for the stream.
	 * @example
	 * ```ts
	 *const streamDetails = new EdgeLiveStreamDetails({
	 *   width: 720,
	 *   height: 1280,
	 *   framerate: 30,
	 *   audioReceive: true
	 *});
	 * ```
	 */
	streamDetails: StreamDetails;
}

/**
 * Options for starting playback
 */
export interface PlaybackOptions<T extends RecordingDetails> {
	/**
	 * Container element for the video.
	 */
	videoElement: HTMLElement;
	/**
	 * Recording details. See documentation for each variant
	 * @example
	 * ```ts
	 *const recordingDetails = new EdgeRecordingDetails({
	 *   recordingId: "20250709_163852_5D70_ACCC1ABCD2F",
	 *   diskId: "SD_DISK",
	 *   startTime: "2025-08-26T07:00:00.000Z"
	 *});
	 * ```
	 */
	recordingDetails: T;
	/**
	 * Whether to start playing the recording directly
	 */
	autoPlay: boolean;
	/**
	 * Offset in seconds from the specified recording start to begin playback from
	 */
	offset?: number;
}

declare global {
	interface HTMLElement {
		_axisWebVideoPlayer?: WebRtcContext;
	}
}

/**
 * Client that handles WebRTC communication with a specific target.
 */
export class WebRtcClient extends CredentialsClient {
	constructor(private options: WebRtcClientOptions) {
		super({
			...options,
		});
	}

	/**
	 * Starts a live stream using WebRTC.
	 *
	 * Note: If audio is requested it will start playback with mute=true and volume=0.0
	 *
	 * @returns The context for the live stream.
	 */
	async startLiveStream({
		streamDetails,
		videoElement,
	}: LiveStreamOptions): Promise<WebRtcLiveStreamContext> {
		if (!this.options.targetId) {
			throw new WebRtcContextError(
				"ConfigurationError",
				"targetId is mandatory for live streaming",
			);
		}
		const context = await this.setupContext(videoElement);

		const request = new LiveVideoRequestParamObject(this.options.targetId);
		request.setStreamDetails(streamDetails.build());

		request.setOrgId(this.options.orgId);
		request.setVideoReceive(true);
		request.setAudioReceive(streamDetails.withAudio);
		if (streamDetails.audioTransmitStream) {
			request.setInputStreams([streamDetails.audioTransmitStream]);
		}

		// Create wrapper for the context to register listeners before the request is sent.
		const liveContext = new WebRtcLiveStreamContext(context);

		try {
			await context.requestLive(request);
		} catch (error) {
			const webRtcError = error as WebRtcError;
			if (webRtcError.code === WebRtcErrorCode.Timeout) {
				throw new WebRtcContextError(
					"TargetConnectionFailed",
					"Timeout when connecting to the target",
					webRtcError,
				);
			}
			throw WebRtcContextError.fromWebRtcError(webRtcError);
		}
		return liveContext;
	}

	/**
	 * Starts playback of a recording
	 *
	 * @returns The context for the playback session.
	 */
	async startPlayback<T extends RecordingDetails>({
		recordingDetails,
		videoElement,
		autoPlay,
		offset,
	}: PlaybackOptions<T>): Promise<PlaybackContext<T>> {
		if (!this.options.targetId && !(recordingDetails instanceof CloudStorageRecordingDetails)) {
			throw new WebRtcContextError(
				"ConfigurationError",
				"targetId is mandatory for the requested playback type",
			);
		}
		const context = await this.setupContext(videoElement);

		const request = new PlaybackVideoRequestParamObject(
			recordingDetails.build(this.options.targetId),
		);
		request.setOrgId(this.options.orgId);
		request.setAutoplay(autoPlay);
		if (offset) {
			request.setOffset(offset);
		}

		const playbackContext = new PlaybackContext(context, this.options);

		try {
			await context.requestPlayback(request);
		} catch (error) {
			const webRtcError = error as WebRtcError;
			if (webRtcError.code === WebRtcErrorCode.Timeout) {
				throw new WebRtcContextError(
					"TargetConnectionFailed",
					"Timeout when connecting to the target",
					webRtcError,
				);
			}
			throw WebRtcContextError.fromWebRtcError(webRtcError);
		}

		return playbackContext;
	}

	private async setupContext(videoElement: HTMLElement): Promise<WebRtcContext> {
		const signalingHandler = await this.setupSignalingConnection();
		const context = new WebRtcContext(signalingHandler, videoElement);
		await context.setDeviceTokenCallback(this.onTokenCallback);
		// Bind reference to the video element so it keeps the context alive as long as it's present.
		videoElement._axisWebVideoPlayer = context;
		return context;
	}

	private async setupSignalingConnection(): Promise<SignalingHandler> {
		try {
			return await SignalingClient.Instance.connect(this.onTokenCallback);
		} catch (error) {
			const webRtcError = error as WebRtcError;
			if (webRtcError.code === WebRtcErrorCode.Timeout) {
				throw new WebRtcContextError(
					"SignalingConnectionFailed",
					"Timeout when connecting to signaling server",
					webRtcError,
				);
			}
			throw WebRtcContextError.fromWebRtcError(webRtcError);
		}
	}
}
