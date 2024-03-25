import { type WebRtcToken, WebRtcTokenType } from "@lkp-rnd/webrtcvideo";
import type { CredentialsProvider } from "../credentials";

/**
 * Options for the credentials client.
 */
export interface CredentialsClientOptions {
	credentialsProvider: CredentialsProvider;
}

/**
 * Abstract class that handle communication with the credentials provider.
 */
export abstract class CredentialsClient {
	constructor(private clientOptions: CredentialsClientOptions) {}

	/**
	 * Handles the token callback and returns the token type to be used in the request.
	 *
	 * @param uri The URI of the request. Used by DPoP to create the proof.
	 * @param method The method of the request. Used by DPoP to create the proof.
	 * @returns The token type and the token to be used in the request.
	 */
	protected onTokenCallback = async (uri: string, method: string): Promise<WebRtcToken> => {
		const auth = await this.clientOptions.credentialsProvider.getAuth(uri, method);

		if (auth.type === "DPoP") {
			return {
				tokenType: WebRtcTokenType.DPoP,
				authorization: auth.boundToken,
				proof: auth.proof,
			};
		}

		return {
			tokenType: WebRtcTokenType.Bearer,
			authorization: auth.accessToken,
			proof: undefined,
		};
	};
}
