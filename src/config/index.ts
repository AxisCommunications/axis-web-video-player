import merge from "lodash.merge";
import type { PartialDeep } from "type-fest";

interface Configuration {
	/**
	 * Configuration for the signaling server.
	 */
	signalingServer: {
		/**
		 * The URL of the signaling server.
		 */
		url: string;
		/**
		 * If the client should automatically try to reconnect if the connection is lost.
		 */
		autoReconnect: boolean;
	};
	/**
	 * Configuration for the DPoP provider.
	 */
	dPop: {
		/**
		 * The URL of the access endpoint.
		 */
		accessEndpoint: string;
	};
}

/**
 * Singleton class for the configuration.
 */
class Config {
	private static _instance: Config | undefined;
	private configuration: Configuration;

	private constructor() {
		this.configuration = {
			signalingServer: {
				url: "wss://signaling.prod.webrtc.connect.axis.com/client",
				autoReconnect: true,
			},
			dPop: {
				accessEndpoint: "https://api.prod.authorizer.connect.axis.com/access",
			},
		};
	}

	static get Instance() {
		if (!Config._instance) {
			Config._instance = new Config();
		}
		return Config._instance;
	}

	/**
	 * @returns The current configuration object together with the update function.
	 */
	getConfig() {
		return {
			...this.configuration,
			update: this.update.bind(this),
		};
	}

	/**
	 * Updates the current configuration object with new options.
	 * @param config The new configuration options. These will be merged with the current configuration.
	 */
	update(config: PartialDeep<Configuration>) {
		merge(this.configuration, config);
	}
}

/**
 * The configuration instance.
 * This should only be used if other than the default values is needed.
 */
export const config = Config.Instance.getConfig();
