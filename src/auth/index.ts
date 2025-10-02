import { WebRtcTokenType, type WebRtcToken } from "@axiscommunications/webrtcvideo";

/**
 * Available purposes for a token request.
 */
export type AuthPurpose =
	| "signalserver-connection"
	| "target-signaling"
	| "live"
	| "playback"
	| "ptz";

/**
 * Request information provided to the token request callback.
 */
export interface TokenRequest {
	/**
	 * The purpose(s) for the token request.
	 * If using a solution with scoped tokens, the returned token
	 * must contain permission for all the specified purposes.
	 */
	purposes: AuthPurpose[];
}

/**
 * Callback function for token requests
 */
export type TokenRequestCallback = (request: TokenRequest) => Promise<Token>;

/**
 * A token for use with Bearer authentication.
 */
export interface BearerToken {
	type: "Bearer";
	token: string;
}

/**
 * The type of the returned token from the token request callback.
 */
export type Token = BearerToken;

export const convertToken = (token: Token): WebRtcToken => {
	return {
		tokenType: WebRtcTokenType.Bearer,
		authorization: token.token,
		proof: undefined,
	};
};
