import { UserManager, type UserManagerSettings } from "oidc-client-ts";
import type { Token, TokenRequest } from "@axiscommunications/axis-web-video-player";

export async function setupOidc(): Promise<OidcClient> {
	const oidcClient = new OidcClient({
		clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
		endpoint: import.meta.env.VITE_OIDC_ENDPOINT,
		redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI,
	});

	if (window.location.pathname === "/login-callback") {
		await oidcClient.handleSignInCallback();
		return oidcClient;
	}

	const loginButton = document.querySelector<HTMLButtonElement>("#login-button");
	const loginScreen = document.querySelector<HTMLDivElement>("#login-screen");

	if (!loginButton || !loginScreen) {
		throw new Error("Could not find element in DOM");
	}

	const signedIn = await oidcClient.isSignedIn();
	if (signedIn) {
		return oidcClient;
	}

	loginScreen.style.display = "flex";
	return new Promise((resolve) => {
		loginButton.onclick = async () => {
			await oidcClient.signInPopup();
			loginScreen.style.display = "none";
			resolve(oidcClient);
		};
	});
}

export interface OidcClientOptions {
	clientId: string;
	endpoint: string;
	redirectUri: string;
}

export class OidcClient {
	private userManager: UserManager;

	constructor(private options: OidcClientOptions) {
		const userManagerSettings = this.createUserManagerSettingsFromOptions();
		this.userManager = new UserManager(userManagerSettings);
	}

	private createUserManagerSettingsFromOptions(): UserManagerSettings {
		return {
			authority: this.options.endpoint,
			client_id: this.options.clientId,
			redirect_uri: this.options.redirectUri,
		};
	}

	createOnTokenRequest(): (request: TokenRequest) => Promise<Token> {
		return async (_request) => {
			// We can ignore purposes as the token returned by this flow isn't scoped
			const user = await this.userManager.getUser();

			if (!user) {
				throw new Error("No user found. This is probably because you are not signed in.");
			}
			return { type: "Bearer", token: user.access_token };
		};
	}

	async isSignedIn(): Promise<boolean> {
		const user = await this.userManager.getUser();
		return !!user && !user.expired;
	}

	async signInPopup(): Promise<void> {
		await this.userManager.signinPopup();
	}

	async handleSignInCallback(): Promise<void> {
		await this.userManager.signinCallback();
	}
}
