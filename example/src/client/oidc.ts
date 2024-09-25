import "./style.css";
import { startLiveStream } from "./video.ts";
import { OidcProvider } from "@axiscommunications/axis-vaas-video-player";

export async function startOidc() {
	const oidcProvider = new OidcProvider({
		clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
		endpoint: import.meta.env.VITE_OIDC_ENDPOINT,
		redirectUri: import.meta.env.VITE_OIDC_REDIRECT_URI,
		signOutRedirectUri: import.meta.env.VITE_OIDC_SIGNOUT_REDIRECT_URI,
	});

	if (window.location.pathname === "/login-callback") {
		await oidcProvider.handleSignInCallback();
		return;
	}

	if (window.location.pathname === "/logout-callback") {
		await oidcProvider.handleSignOutCallback();
		return;
	}

	const app = document.querySelector<HTMLDivElement>("#app");
	if (!app) {
		throw new Error("Could not find #app");
	}
	app.innerHTML = `
  <div>
		<button id="loginButton" style="display: none;">Login</button>
		<div id="videoContainer" style="position: fixed; top: 0; left: 0; height: 100%; width: 100%; display: none; flex-direction: column;">
			<div style="flex-grow: 1;">
		    <button id="logoutButton" style="display: none;">Logout</button>
				<div id="video" style="position: relative; width: 100%; height: 100%; background-color: black;"></div>
			</div>
		</div>
  </div>
`;

	const videoContainer = document.querySelector<HTMLDivElement>("#videoContainer");
	const videoElement = document.querySelector<HTMLDivElement>("#video");
	const loginButton = document.querySelector<HTMLButtonElement>("#loginButton");
	const logoutButton = document.querySelector<HTMLButtonElement>("#logoutButton");

	if (!videoContainer || !videoElement || !loginButton || !logoutButton) {
		throw new Error("Could not find video container, video element, login or logout button");
	}

	logoutButton.onclick = async () => {
		await oidcProvider.signOut();
		window.location.reload();
	};

	const signedIn = await oidcProvider.isSignedIn();
	if (signedIn) {
		videoContainer.style.display = "flex";
		logoutButton.style.display = "block";
		startLiveStream(oidcProvider, videoElement);
	} else {
		loginButton.style.display = "block";
		loginButton.onclick = async () => {
			await oidcProvider.signInPopup();
			videoContainer.style.display = "flex";
			loginButton.style.display = "none";
			logoutButton.style.display = "block";

			startLiveStream(oidcProvider, videoElement);
		};
	}
}
