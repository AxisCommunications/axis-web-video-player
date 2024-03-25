import { jwtDecode } from "jwt-decode";
import type { GetAuthDPoP } from "./CredentialsProvider";
import { BaseDPopProvider, type BaseDPopProviderOptions } from "./BaseDPopProvider";
import { config } from "../config";

/**
 * Options for the custom DPoP provider.
 */
export interface CustomDPopProviderOptions extends BaseDPopProviderOptions {
	/**
	 * Resource identifier used in the `onGetBoundToken` callback.
	 * Should be used as an identifier for which resource and scope that needs a bound token.
	 *
	 * @example
	 * Target id to get a bound token for a specific target.
	 *
	 * @example
	 * Group id that the target belongs to be able to reuse the same bound token for multiple targets.
	 */
	resource: string;

	/**
	 * Callback function to get the bound token.
	 *
	 * @param proof generated DPoP proof to be sent with the request.
	 * @param resource resource identifier that is set in the constructor.
	 * @returns bound token jwt.
	 */
	onGetBoundToken: (proof: string, resource: string) => Promise<string>;
}

/**
 * A DPoP credentials provider that uses a callback to get the bound token.
 */
export class CustomDPopProvider extends BaseDPopProvider {
	constructor(protected options: CustomDPopProviderOptions) {
		super({ ...options });
	}

	async getAuth(uri: string, method: string): Promise<GetAuthDPoP> {
		if (!this.boundToken || this.isExpired()) {
			const tokenProof = await this.createProofJwt(config.dPop.accessEndpoint, "POST");
			this.boundToken = await this.options.onGetBoundToken(tokenProof, this.options.resource);

			const jwt = jwtDecode(this.boundToken);
			this.exp = jwt.exp;
		}

		const proof = await this.createProofJwt(uri, method, this.boundToken);
		return { boundToken: this.boundToken, proof, type: "DPoP" };
	}
}
