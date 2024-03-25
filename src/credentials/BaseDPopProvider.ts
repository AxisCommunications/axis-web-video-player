import type { CredentialsProvider, GetAuthDPoP } from "./CredentialsProvider";
import DPoP, { generateKeyPair } from "dpop";

/**
 * Options for the base DPoP provider.
 */
export interface BaseDPopProviderOptions {
	/**
	 * A {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair CryptoKeyPair} to be used for DPoP proof generation.
	 */
	keyPair: CryptoKeyPair;
}

/**
 * Supported JWS `alg` Algorithm identifier.
 */
type JwsAlgorithm = "PS256" | "ES256" | "RS256";

/**
 * An abstract base class for DPoP providers.
 */
export abstract class BaseDPopProvider implements CredentialsProvider {
	protected boundToken: string | undefined;
	protected exp: number | undefined;
	private timeLeftToRefreshTokenInSeconds = 60;

	constructor(protected options: BaseDPopProviderOptions) {}

	/**
	 * Generates a
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair CryptoKeyPair}
	 * for a given JWS `alg` Algorithm identifier.
	 *
	 * @param alg Supported JWS `alg` Algorithm identifier. Defaults to `ES256`.
	 * @returns A new {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair CryptoKeyPair} that can be used for DPoP proof generation.
	 */
	static async generateKeyPair(alg: JwsAlgorithm = "ES256"): Promise<CryptoKeyPair> {
		return generateKeyPair(alg);
	}

	/**
	 * Get bound token and proof for the request.
	 * @param uri matches the htu claim in DPoP.
	 * @param method matches the htm claim in DPoP.
	 */
	abstract getAuth(uri: string, method: string): Promise<GetAuthDPoP>;

	/**
	 * Creates a DPoP Proof JWT. This needs to be created and sent for every request using DPoP authentication.
	 */
	protected async createProofJwt(uri: string, method: string, token?: string): Promise<string> {
		return DPoP(this.options.keyPair, uri, method, undefined, token);
	}

	/**
	 * Checks if the token is expired or about to expire.
	 */
	protected isExpired(): boolean {
		const secondsSinceEpoch = Math.round(Date.now() / 1000);
		return !this.exp || secondsSinceEpoch + this.timeLeftToRefreshTokenInSeconds > this.exp;
	}
}
