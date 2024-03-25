import init, {
	SignalingHandler,
	type ErrorCallback,
	WebRtcErrorCode,
	type RequestTokenCallback,
} from "@lkp-rnd/webrtcvideo";
import { config } from "../../config";

/**
 * Singleton class that handles communication to the signaling server.
 */
export class SignalingClient {
	private static _instance: SignalingClient | undefined;
	private signalingHandler: SignalingHandler | undefined;
	private errorCallbacks: ErrorCallback[];
	private isConnected = false;

	private constructor() {
		this.errorCallbacks = [];
	}

	/**
	 * @returns The current instance of the SignalingClient.
	 */
	static get Instance() {
		if (!SignalingClient._instance) {
			SignalingClient._instance = new SignalingClient();
		}
		return SignalingClient._instance;
	}

	/**
	 * Connects to the signaling server. If already connected, the existing connection is returned.
	 *
	 * @param onTokenCallback The callback to be called when a token for the signaling server is needed.
	 * @returns The signaling handler.
	 */
	async connect(onTokenCallback: RequestTokenCallback): Promise<SignalingHandler> {
		if (this.isConnected && this.signalingHandler) {
			return this.signalingHandler;
		}

		await init();

		this.signalingHandler = new SignalingHandler();

		const { url, autoReconnect } = config.signalingServer;
		await this.signalingHandler.setErrorHandler(async (error) => {
			for (const cb of this.errorCallbacks) {
				cb(error);
			}

			// If the error is a signaling server error, we should try to reconnect.
			if (autoReconnect && error.code === WebRtcErrorCode.OtherSignalingServerError) {
				this.isConnected = false;
				await this.connect(onTokenCallback);
			}
		});

		await this.signalingHandler.connect(url, onTokenCallback);
		this.isConnected = true;

		return this.signalingHandler;
	}

	/**
	 * @param cb The callback to be called when an error in the signaling server occurs.
	 */
	registerCallback(cb: ErrorCallback) {
		this.errorCallbacks.push(cb);
	}
}
