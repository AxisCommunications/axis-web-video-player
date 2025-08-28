import {
	type CredentialsProvider,
	CustomDPopProvider,
} from "@axiscommunications/axis-vaas-video-player";

export async function startDPoP(): Promise<CredentialsProvider> {
	const keyPair = await CustomDPopProvider.generateKeyPair();

	return new CustomDPopProvider({
		keyPair,
		resource: import.meta.env.VITE_DPOP_RESOURCE_ARN,
		onGetBoundToken,
	});
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
