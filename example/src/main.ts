import { AuthClient } from "./auth";
import * as AxisWebVideoPlayer from "@axiscommunications/axis-web-video-player";
import { startLiveStream } from "./live";
import {
	SignalingClient,
	type SignalingConnection,
} from "@axiscommunications/axis-web-video-player";
import { startPlayback } from "./playback";

async function connectToSignalingServer(authClient: AuthClient): Promise<SignalingConnection> {
	const signalingClient = new SignalingClient(authClient.createOnTokenRequest());
	if (import.meta.env.VITE_VIDEO_SIGNALING_URL) {
		signalingClient.setUrl(import.meta.env.VITE_VIDEO_SIGNALING_URL);
	}
	signalingClient.setErrorCallback((error) => {
		console.log("Signaling server error:", error);
	});
	return await signalingClient.connect();
}

AxisWebVideoPlayer.axisWebVideoInit().then(async () => {
	const videoContainer = document.querySelector<HTMLDivElement>("#video-container");
	const videoElement = document.querySelector<HTMLDivElement>("#video");
	if (!videoContainer || !videoElement) {
		throw new Error("Could not find element in DOM");
	}

	const authClient = new AuthClient();

	const signalingConnection = await connectToSignalingServer(authClient);

	videoContainer.style.display = "flex";

	switch (import.meta.env.VITE_EXAMPLE_TYPE) {
		case "live":
			startLiveStream(signalingConnection, authClient.createOnTokenRequest(), videoElement);
			break;
		case "playback": {
			const playbackControls = document.querySelector<HTMLDivElement>("#playback-controls");
			if (!playbackControls) {
				throw new Error("Could not find element in DOM");
			}
			playbackControls.style.display = "flex";
			startPlayback(signalingConnection, authClient.createOnTokenRequest(), videoElement);
			break;
		}
	}
});
