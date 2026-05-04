/**
 * Copyright (C) Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import {
	LiveVideoRequestParamObject,
	PlaybackVideoRequestParamObject,
	WebRtcContext,
	type WebRtcError,
	WebRtcErrorCode,
} from "@axiscommunications/webrtcvideo";
import type { SignalingConnection } from "../signaling";
import { WebRtcLiveStreamContext } from "./WebRtcLiveStreamContext";
import type { StreamDetails } from "./stream-details";
import { WebRtcContextError } from "./WebRtcContextError";
import { CloudStorageRecordingDetails, type RecordingDetails } from "./recording-details";
import { PlaybackContext } from "./PlaybackContext";
import { convertPurpose, convertToken, type TokenRequestCallback } from "../../auth";
import { convertDewarpParameters, type DewarpParameters } from "./DigitalPtz";

/**
 * Options for the WebRtcClient.
 */
export interface WebRtcClientOptions {
	/**
	 * A connection to a signaling server
	 */
	signalingConnection: SignalingConnection;
	/**
	 * A function that will be called when an authorization token is needed
	 */
	tokenRequestCallback: TokenRequestCallback;
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

	/**
	 * Options for Digital PTZ
	 */
	digitalPtz?: DigitalPtzOptions;
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

	/**
	 * Options for Digital PTZ
	 */
	digitalPtz?: DigitalPtzOptions;
}

/**
 * Options for Digital PTZ
 */
export interface DigitalPtzOptions {
	/**
	 * Whether to enable digital PTZ
	 */
	enabled: boolean;
	/**
	 * Parameters for image dewarping
	 */
	dewarpParameters?: DewarpParameters;
}

declare global {
	interface HTMLElement {
		_axisWebVideoPlayer?: WebRtcContext;
	}
}

/**
 * Client that handles WebRTC communication with a specific target.
 */
export class WebRtcClient {
	constructor(private options: WebRtcClientOptions) {}

	/**
	 * Starts a live stream using WebRTC.
	 *
	 * Note: If audio is requested it will start playback with mute=true and volume=0.0
	 *
	 * @returns The context for the live stream.
	 */
	async startLiveStream(options: LiveStreamOptions): Promise<WebRtcLiveStreamContext> {
		if (!this.options.targetId) {
			throw new WebRtcContextError(
				"ConfigurationError",
				"targetId is mandatory for live streaming",
			);
		}
		const context = await this.setupContext(options.videoElement);

		const request = new LiveVideoRequestParamObject(this.options.targetId);
		request.setStreamDetails(options.streamDetails.build());

		request.setOrgId(this.options.orgId);
		request.setVideoReceive(options.streamDetails.withVideoReceive);
		request.setAudioReceive(options.streamDetails.withAudioReceive);
		request.setAudioSend(options.streamDetails.withAudioSend);

		if (options.digitalPtz?.enabled) {
			request.setUseVirtualPtz(true);
			const dewarpParameters = options.digitalPtz?.dewarpParameters;
			if (dewarpParameters) {
				const internalDewarpParameters = convertDewarpParameters(dewarpParameters);
				request.setDewarpParameters(
					internalDewarpParameters.radialDistortion,
					internalDewarpParameters.opticalCenter,
					internalDewarpParameters.mountOrientation,
				);
			}
		}

		// Create wrapper for the context to register listeners before the request is sent.
		const liveContext = new WebRtcLiveStreamContext(context, {
			digitalPtz: options.digitalPtz?.enabled ?? false,
		});

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
	async startPlayback<T extends RecordingDetails>(
		options: PlaybackOptions<T>,
	): Promise<PlaybackContext<T>> {
		if (
			!this.options.targetId &&
			!(options.recordingDetails instanceof CloudStorageRecordingDetails)
		) {
			throw new WebRtcContextError(
				"ConfigurationError",
				"targetId is mandatory for the requested playback type",
			);
		}
		const context = await this.setupContext(options.videoElement);

		const request = new PlaybackVideoRequestParamObject(
			options.recordingDetails.build(this.options.targetId),
		);
		request.setOrgId(this.options.orgId);
		request.setAutoplay(options.autoPlay);
		if (options.offset) {
			request.setOffset(options.offset);
		}

		if (options.digitalPtz?.enabled) {
			request.setUseVirtualPtz(true);
			const dewarpParameters = options.digitalPtz?.dewarpParameters;
			if (dewarpParameters) {
				const internalDewarpParameters = convertDewarpParameters(dewarpParameters);
				request.setDewarpParameters(
					internalDewarpParameters.radialDistortion,
					internalDewarpParameters.opticalCenter,
					internalDewarpParameters.mountOrientation,
				);
			}
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
		const signalingHandler = this.options.signalingConnection.getSignalingHandler();
		const context = new WebRtcContext(signalingHandler, videoElement, true);
		await context.setDeviceTokenCallback(async (_url, _method, purposes) => {
			const token = await this.options.tokenRequestCallback({
				purposes: purposes.map(convertPurpose),
			});
			return convertToken(token);
		});
		// Bind reference to the video element so it keeps the context alive as long as it's present.
		videoElement._axisWebVideoPlayer = context;
		return context;
	}
}
