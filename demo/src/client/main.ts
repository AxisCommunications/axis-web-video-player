import "./style.css";
import { startDPoP } from "./dpop";
import { startOidc } from "./oidc";
import * as VaasVideoPlayer from "@axiscommunications/axis-vaas-video-player";

console.log("Auth type", import.meta.env.VITE_AUTH);

// This is only needed if we want to use other environments than production
VaasVideoPlayer.config.update({
	signalingServer: {
		url: import.meta.env.VITE_VIDEO_SIGNALING_URL,
	},
	dPop: {
		accessEndpoint: import.meta.env.VITE_DPOP_HTU,
	},
});

VaasVideoPlayer.vaasInit().then(() => {
	switch (import.meta.env.VITE_AUTH) {
		case "DPOP":
			startDPoP();
			break;
		case "OIDC":
			startOidc();
			break;
		default:
			throw new Error("Invalid auth type");
	}
});
