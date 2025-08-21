import {
	LiveVideoRequestParamObject,
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

/**
 * Options for the WebRtcClient.
 */
export interface WebRtcClientOptions extends CredentialsClientOptions {
	/**
	 * Id of the target to connect to.
	 */
	targetId: string;
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

declare global {
	interface HTMLElement {
		_vaasPlayer?: WebRtcContext;
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
		let signalingHandler: SignalingHandler;
		try {
			signalingHandler = await SignalingClient.Instance.connect(this.onTokenCallback);
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

		const context = new WebRtcContext(signalingHandler, videoElement);
		await context.setDeviceTokenCallback(this.onTokenCallback);

		const request = new LiveVideoRequestParamObject(this.options.targetId);
		request.setStreamDetails(streamDetails.build());

		request.setOrgId(this.options.orgId);
		request.setVideoReceive(true);
		request.setAudioReceive(streamDetails.withAudio);
		if (streamDetails.audioTransmitStream) {
			request.setInputStreams([streamDetails.audioTransmitStream]);
		}

		// Bind reference to the video element so it keeps the context alive as long as it's present.
		videoElement._vaasPlayer = context;
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
}
