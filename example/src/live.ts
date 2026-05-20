/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import {
	EdgeLiveStreamDetails,
	type SignalingConnection,
	type TokenRequestCallback,
	WebRtcClient,
	type WebRtcContextError,
} from "@axiscommunications/axis-web-video-player";

export async function startLiveStream(
	signalingConnection: SignalingConnection,
	tokenRequestCallback: TokenRequestCallback,
	videoElement: HTMLDivElement,
) {
	const webRtcClient = new WebRtcClient({
		signalingConnection,
		tokenRequestCallback,
		orgId: import.meta.env.VITE_VIDEO_ORG_ID,
		targetId: import.meta.env.VITE_VIDEO_TARGET_ID,
	});

	const streamDetails = new EdgeLiveStreamDetails({
		videoReceive: true,
		videoOptions: {
			framerate: 30,
			height: 720,
			width: 1280,
		},
	});

	try {
		await webRtcClient.startLiveStream({
			streamDetails,
			videoElement,
		});
	} catch (error) {
		const contextError = error as WebRtcContextError;
		switch (contextError.type) {
			case "SignalingConnectionFailed":
				console.error(`Failed to connect to signaling server: ${contextError.message}`);
				break;
			case "TargetConnectionFailed":
				console.error(`Failed to connect to target: ${contextError.message}`);
				break;
			case "TargetNotConnected":
				console.error("The target was not connected");
				break;
			case "TargetConnectionDenied":
				console.error(`Connecting to target not allowed: ${contextError.message}`);
				break;
			case "OperationNotSupportedByTarget":
				console.error(`The target did not support a requested operation: ${contextError.message}`);
				break;
			default:
				console.error(`Error: ${error}`);
				break;
		}
	}
}
