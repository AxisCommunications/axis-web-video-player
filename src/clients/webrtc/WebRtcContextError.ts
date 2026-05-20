/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import { type WebRtcError, WebRtcErrorCode } from "@axiscommunications/webrtcvideo";

export class WebRtcContextError extends Error {
	/**
	 * The type of the error
	 */
	readonly type: WebRtcContextErrorType;
	/**
	 * The internal WebRTC library error, if any
	 */
	readonly source?: WebRtcError;

	/**
	 * @internal
	 */
	static fromWebRtcError(error: WebRtcError): WebRtcContextError {
		const type = mapWebRtcErrorCode(error.code);
		return new WebRtcContextError(type, error.message, error);
	}

	constructor(type: WebRtcContextErrorType, message: string, source?: WebRtcError) {
		super(message);
		this.type = type;
		this.source = source;
	}

	toString(): string {
		let internalError = "";
		if (this.source) {
			internalError = ` (internal error: ${this.source})`;
		}
		return `${this.type}: ${this.message}${internalError}`;
	}
}

/**
 * The target is not connected to the signaling server.
 */
export type TargetNotConnected = "TargetNotConnected";
/**
 * The connection to the signaling server failed.
 */
export type SignalingConnectionFailed = "SignalingConnectionFailed";
/**
 * The requested operation timed out.
 */
export type Timeout = "Timeout";
/**
 * The client was not authorized to connect to the target.
 */
export type TargetConnectionDenied = "TargetConnectionDenied";
/**
 * Transmitting audio from the client to the target failed.
 */
export type AudioTransmissionFailed = "AudioTransmissionFailed";
/**
 * The connection to the target was lost because the max number of connected clients was reached.
 */
export type TooManyClientsConnected = "TooManyClientsConnected";
/**
 * The WebRTC connection was unexpectedly closed.
 */
export type WebRtcConnectionUnexpectedlyClosed = "WebRtcConnectionUnexpectedlyClosed";
/**
 * A requested operation (typically audio to/from the target) was not supported.
 */
export type OperationNotSupportedByTarget = "OperationNotSupportedByTarget";
/**
 * The connection to the target failed.
 */
export type TargetConnectionFailed = "TargetConnectionFailed";
/**
 * A PTZ operation failed.
 */
export type PtzFailed = "PtzFailed";
/**
 * An error occured which did not fit into any other category.
 */
export type OtherError = "OtherError";
/**
 * An error occured due to invalid configuration by the library user.
 */
export type ConfigurationError = "ConfigurationError";
/**
 * The target could not fulfil the playback request.
 */
export type TargetPlaybackError = "TargetPlaybackError";

/**
 * The type of error.
 */
export type WebRtcContextErrorType =
	| TargetNotConnected
	| SignalingConnectionFailed
	| Timeout
	| TargetConnectionDenied
	| AudioTransmissionFailed
	| TooManyClientsConnected
	| WebRtcConnectionUnexpectedlyClosed
	| OperationNotSupportedByTarget
	| TargetConnectionFailed
	| PtzFailed
	| OtherError
	| ConfigurationError
	| TargetPlaybackError;

function mapWebRtcErrorCode(errorCode: WebRtcErrorCode): WebRtcContextErrorType {
	switch (errorCode) {
		case WebRtcErrorCode.TargetDisconnected:
		case WebRtcErrorCode.TargetDisabled:
			return "TargetNotConnected";
		case WebRtcErrorCode.OtherSignalingServerError:
		case WebRtcErrorCode.AuthorizationSessionExpired:
			return "SignalingConnectionFailed";
		case WebRtcErrorCode.Timeout:
			return "Timeout";
		case WebRtcErrorCode.UnauthorizedTargetAccess:
			return "TargetConnectionDenied";
		case WebRtcErrorCode.AudioTransmitFailed:
			return "AudioTransmissionFailed";
		case WebRtcErrorCode.TooManyClients:
			return "TooManyClientsConnected";
		case WebRtcErrorCode.WebRtcConnectionClosed:
			return "WebRtcConnectionUnexpectedlyClosed";
		case WebRtcErrorCode.MissingHardwareSupport:
			return "OperationNotSupportedByTarget";
		case WebRtcErrorCode.PtzClientError:
		case WebRtcErrorCode.PtzUnavailable:
		case WebRtcErrorCode.PtzServerErrorOther:
			return "PtzFailed";
		case WebRtcErrorCode.TargetPlaybackError:
			return "TargetPlaybackError";
	}
	return "OtherError";
}
