import { startDPoP } from "./dpop";
import { startOidc } from "./oidc";
import * as AxisWebVideoPlayer from "@axiscommunications/axis-web-video-player";
import { startLiveStream } from "./live";
import type { CredentialsProvider } from "@axiscommunications/axis-web-video-player";
import { startPlayback } from "./playback";

console.log("Auth type", import.meta.env.VITE_AUTH);

// This is only needed if we want to use other environments than production
AxisWebVideoPlayer.config.update({
	signalingServer: {
		url: import.meta.env.VITE_VIDEO_SIGNALING_URL,
	},
	dPop: {
		accessEndpoint: import.meta.env.VITE_DPOP_HTU,
	},
});

type CredentialsProviderType = "DPOP" | "OIDC";

async function createCredentialsProvider(
	type: CredentialsProviderType,
): Promise<CredentialsProvider> {
	switch (type) {
		case "DPOP":
			return await startDPoP();
		case "OIDC": {
			return await startOidc();
		}
		default:
			throw new Error("Invalid auth type");
	}
}

AxisWebVideoPlayer.axisWebVideoInit().then(async () => {
	const videoContainer = document.querySelector<HTMLDivElement>("#video-container");
	const videoElement = document.querySelector<HTMLDivElement>("#video");
	if (!videoContainer || !videoElement) {
		throw new Error("Could not find element in DOM");
	}
	const credentialsProvider = await createCredentialsProvider(import.meta.env.VITE_AUTH);
	videoContainer.style.display = "flex";
	switch (import.meta.env.VITE_EXAMPLE_TYPE) {
		case "live":
			startLiveStream(credentialsProvider, videoElement);
			break;
		case "playback": {
			const playbackControls = document.querySelector<HTMLDivElement>("#playback-controls");
			if (!playbackControls) {
				throw new Error("Could not find element in DOM");
			}
			playbackControls.style.display = "flex";
			startPlayback(credentialsProvider, videoElement);
			break;
		}
	}
});
