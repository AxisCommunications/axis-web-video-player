/**
 * Authentication response using a bearer token.
 */
export interface GetAuthBearer {
	type: "Bearer";
	accessToken: string;
}

/**
 * Authentication response using DPoP bound token.
 */
export interface GetAuthDPoP {
	type: "DPoP";
	boundToken: string;
	proof: string;
}

/**
 * A credentials provider that provides authentication for requests.
 */
export interface CredentialsProvider {
	/**
	 * Get authentication for the request.
	 * @param uri matches the htu claim in DPoP.
	 * @param method matches the htm claim in DPoP.
	 */
	getAuth(uri: string, method: string): Promise<GetAuthBearer | GetAuthDPoP>;
}
