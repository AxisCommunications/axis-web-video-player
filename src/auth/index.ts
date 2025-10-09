import {
	AuthorizationPurpose,
	WebRtcTokenType,
	type WebRtcToken,
} from "@axiscommunications/webrtcvideo";
import type {
	AuthPurposeCloudStorage,
	AuthPurposeDeviceConnection,
	AuthPurposeLive,
	AuthPurposePlayback,
	AuthPurposePtz,
	AuthPurposeSignalServerConnection,
	AuthPurposeTargetSignaling,
} from "./purposes";

/**
 * Available purposes for a token request.
 */
export type AuthPurpose =
	| AuthPurposeSignalServerConnection
	| AuthPurposeTargetSignaling
	| AuthPurposeLive
	| AuthPurposePlayback
	| AuthPurposePtz
	| AuthPurposeCloudStorage
	| AuthPurposeDeviceConnection;

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

export const convertPurpose = (purpose: AuthorizationPurpose): AuthPurpose => {
	switch (purpose) {
		case AuthorizationPurpose.SignalServerConnection:
			return "SignalServerConnection";
		case AuthorizationPurpose.TargetSignaling:
			return "TargetSignaling";
		case AuthorizationPurpose.Live:
			return "Live";
		case AuthorizationPurpose.Playback:
			return "Playback";
		case AuthorizationPurpose.Ptz:
			return "Ptz";
		case AuthorizationPurpose.CloudStorage:
			return "CloudStorage";
		case AuthorizationPurpose.ConnectToDevice:
			return "DeviceConnection";
		default:
			throw new Error("Unexpected token purpose");
	}
};
