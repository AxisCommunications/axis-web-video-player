import { type CredentialsProvider, OidcProvider } from "@axiscommunications/axis-web-video-player";

export async function startOidc(): Promise<CredentialsProvider> {
	const oidcProvider = new OidcProvider({
		clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
		endpoint: import.meta.env.VITE_OIDC_ENDPOINT,
		redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI,
		signOutRedirectUri: import.meta.env.VITE_OIDC_SIGNOUT_REDIRECT_URI,
	});

	if (window.location.pathname === "/login-callback") {
		await oidcProvider.handleSignInCallback();
		return oidcProvider;
	}

	if (window.location.pathname === "/logout-callback") {
		await oidcProvider.handleSignOutCallback();
		return oidcProvider;
	}

	const loginButton = document.querySelector<HTMLButtonElement>("#login-button");
	const logoutButton = document.querySelector<HTMLButtonElement>("#logout-button");
	const loginScreen = document.querySelector<HTMLDivElement>("#login-screen");

	if (!loginButton || !logoutButton || !loginScreen) {
		throw new Error("Could not find element in DOM");
	}

	logoutButton.onclick = async () => {
		await oidcProvider.signOut();
		window.location.reload();
	};

	const signedIn = await oidcProvider.isSignedIn();
	if (signedIn) {
		logoutButton.style.display = "block";
		return oidcProvider;
	}

	loginScreen.style.display = "flex";
	return new Promise((resolve) => {
		loginButton.onclick = async () => {
			await oidcProvider.signInPopup();
			loginScreen.style.display = "none";
			logoutButton.style.display = "block";
			resolve(oidcProvider);
		};
	});
}
