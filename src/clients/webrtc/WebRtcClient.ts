import { LiveVideoRequestParamObject, WebRtcContext } from "@axteams-one/webrtcvideo";
import { CredentialsClient, type CredentialsClientOptions } from "../CredentialsClient";
import { SignalingClient } from "../signaling";
import { WebRtcLiveStreamContext } from "./WebRtcLiveStreamContext";
import type { StreamDetails } from "./stream-details";

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
		const signalingHandler = await SignalingClient.Instance.connect(this.onTokenCallback);

		const context = new WebRtcContext(signalingHandler, videoElement);
		await context.setDeviceTokenCallback(this.onTokenCallback);

		const request = new LiveVideoRequestParamObject(this.options.targetId);
		request.setStreamDetails(streamDetails.build());

		request.setOrgId(this.options.orgId);
		request.setVideoReceive(true);
		request.setAudioReceive(streamDetails.withAudio);

		await context.requestLive(request);
		return new WebRtcLiveStreamContext(context);
	}
}
