import { SignalingHandler, type WebRtcError } from "@axiscommunications/webrtcvideo";
import { type TokenRequestCallback, convertToken } from "../../auth";
import { WebRtcContextError, type WebRtcContextErrorCallback } from "../webrtc";

const DEFAULT_SIGNALING_SERVER_URL = "wss://signaling.prod.webrtc.connect.axis.com/client";

/**
 * Sets up a connection to the signaling server.
 */
export class SignalingClient {
	private errorCallback: WebRtcContextErrorCallback | undefined;
	private url = DEFAULT_SIGNALING_SERVER_URL;

	/**
	 * @param tokenRequestCallback The callback to be called when a token for the signaling server is needed.
	 */
	constructor(private tokenRequestCallback: TokenRequestCallback) {}

	/**
	 * Sets up an error callback function
	 * @param callback The callback function
	 */
	setErrorCallback(callback: WebRtcContextErrorCallback) {
		this.errorCallback = callback;
	}

	/**
	 * Sets a signaling server URL. Only needed if not using the Axis default.
	 * @param url URL to a signaling server.
	 */
	setUrl(url: string) {
		this.url = url;
	}

	/**
	 * Connects to the signaling server.
	 * Only one connection at a time should be active. The returned object can be reused
	 * for each device connection.
	 * @returns The signaling connection.
	 */
	async connect(): Promise<SignalingConnection> {
		const signalingHandler = new SignalingHandler();

		if (this.errorCallback) {
			const weakErrorCallback = new WeakRef(this.errorCallback);
			await signalingHandler.setErrorHandler(async (error) => {
				const errorCallback = weakErrorCallback.deref();
				if (!errorCallback) {
					return;
				}

				errorCallback(WebRtcContextError.fromWebRtcError(error));
			});
		}

		try {
			await signalingHandler.connect(this.url, async () => {
				// TODO: Handle purposes when webrtcvideo supports them
				const token = await this.tokenRequestCallback({ purposes: [] });
				return convertToken(token);
			});
		} catch (error) {
			const webRtcError = error as WebRtcError;
			throw new WebRtcContextError("SignalingConnectionFailed", webRtcError.message);
		}

		return new SignalingConnection(signalingHandler);
	}
}

/**
 * A connection to a signaling server
 */
export class SignalingConnection {
	constructor(private signalingHandler: SignalingHandler) {}

	/**
	 * @internal
	 */
	getSignalingHandler(): SignalingHandler {
		return this.signalingHandler;
	}
}
