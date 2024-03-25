import {
	type CredentialsProvider,
	EdgeLiveStreamDetails,
	WebRtcClient,
} from "@axiscommunications/vaas-sdk";

export async function startLiveStream(
	credentialsProvider: CredentialsProvider,
	videoElement: HTMLDivElement,
) {
	const webRtcClient = new WebRtcClient({
		credentialsProvider,
		orgId: import.meta.env.VITE_VIDEO_ORG_ID,
		targetId: import.meta.env.VITE_VIDEO_TARGET_ID,
	});

	const streamDetails = new EdgeLiveStreamDetails({
		framerate: 30,
		height: 720,
		width: 1280,
	});

	await webRtcClient.startLiveStream({
		streamDetails,
		videoElement,
	});
}
