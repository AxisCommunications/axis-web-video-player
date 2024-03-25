import { UserManager, type UserManagerSettings } from "oidc-client-ts";
import type { CredentialsProvider, GetAuthBearer } from "./CredentialsProvider";

/**
 * Options for the OIDC provider.
 */
export interface OidcProviderOptions {
	/**
	 * The client identifier as registered with the OIDC.
	 */
	clientId: string;

	/**
	 * The URL of the OIDC provider.
	 */
	endpoint: string;

	/**
	 * The redirect URI of the client to receive a sign in response from the OIDC provider.
	 */
	redirectUri: string;

	/**
	 * The redirect URI of the client to receive a sign out response from the OIDC provider.
	 */
	signOutRedirectUri?: string;
}

/**
 * A credentials provider that uses the OpenID Connect protocol to authenticate users.
 */
export class OidcProvider implements CredentialsProvider {
	private userManager: UserManager;

	constructor(private options: OidcProviderOptions) {
		const userManagerSettings = this.createUserManagerSettingsFromOptions();
		this.userManager = new UserManager(userManagerSettings);
	}

	private createUserManagerSettingsFromOptions(): UserManagerSettings {
		return {
			authority: this.options.endpoint,
			client_id: this.options.clientId,
			redirect_uri: this.options.redirectUri,
			post_logout_redirect_uri: this.options.signOutRedirectUri,
		};
	}

	/**
	 * Gets an access token.
	 * @returns The access token and its authorization type.
	 */
	async getAuth(): Promise<GetAuthBearer> {
		const user = await this.userManager.getUser();
		if (!user) {
			throw new Error("No user found. This is probably because you are not signed in.");
		}
		return { type: "Bearer", accessToken: user.access_token };
	}

	/**
	 * If the user is signed in or not.
	 */
	async isSignedIn(): Promise<boolean> {
		const user = await this.userManager.getUser();
		return !!user && !user.expired;
	}

	/**
	 * Signs in the user using a redirect in the browser to the OIDC provider.
	 */
	async signInRedirect(): Promise<void> {
		await this.userManager.signinRedirect();
	}

	/**
	 * Signs in the user using a popup window to the OIDC provider.
	 */
	async signInPopup(): Promise<void> {
		await this.userManager.signinPopup();
	}

	/**
	 * Handle the sign in response (callback) from the OIDC provider.
	 */
	async handleSignInCallback(): Promise<void> {
		await this.userManager.signinCallback();
	}

	/**
	 * Handle the sign out response (callback) from the OIDC provider.
	 */
	async handleSignOutCallback(): Promise<void> {
		await this.userManager.signinSilentCallback();
	}

	/**
	 * Signs out the user.
	 */
	async signOut(): Promise<void> {
		if (!this.options.signOutRedirectUri) {
			throw new Error("No signOutRedirectUri specified in the options.");
		}

		const end_session_endpoint = await this.userManager.metadataService.getEndSessionEndpoint();

		// If the end_session_endpoint is not available, assume logout endpoint on origin.
		if (!end_session_endpoint) {
			const tokenEndpoint = await this.userManager.metadataService.getTokenEndpoint();
			if (!tokenEndpoint) {
				throw new Error("No end_session_endpoint or token_endpoint found in metadata.");
			}

			const origin = new URL(tokenEndpoint).origin;

			const userManagerSettings = this.createUserManagerSettingsFromOptions();
			userManagerSettings.metadataSeed = {
				...userManagerSettings.metadataSeed,
				end_session_endpoint: `${origin}/logout?client_id=${
					this.options.clientId
				}&logout_uri=${encodeURIComponent(this.options.signOutRedirectUri)}`,
			};

			this.userManager = new UserManager(userManagerSettings);
		}

		return this.userManager.signoutSilent();
	}
}
