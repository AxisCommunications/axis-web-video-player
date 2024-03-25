import "./style.css";
import { startLiveStream } from "./video.ts";
import { CustomDPopProvider } from "@axiscommunications/vaas-sdk";

export async function startDPoP() {
	const keyPair = await CustomDPopProvider.generateKeyPair();

	const dPopProvider = new CustomDPopProvider({
		keyPair,
		resource: import.meta.env.VITE_DPOP_RESOURCE_ARN,
		onGetBoundToken,
	});

	const app = document.querySelector<HTMLDivElement>("#app");

	if (!app) {
		throw new Error("Could not find #app");
	}

	app.innerHTML = `
			<div id="video"></div>
	`;

	const videoElement = document.querySelector<HTMLDivElement>("#video");
	if (!videoElement) {
		throw new Error("Could not find video element");
	}

	await startLiveStream(dPopProvider, videoElement);
}

const onGetBoundToken = async (dPopProof: string, resource: string) => {
	const response = await fetch(import.meta.env.VITE_DPOP_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			dPopProof,
			resource,
		}),
	});

	const body = await response.json();
	return body.boundToken;
};
