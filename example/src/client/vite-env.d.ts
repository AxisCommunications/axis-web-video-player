/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_AUTH: "DPOP" | "OIDC";
	readonly VITE_OIDC_CLIENT_ID: string;
	readonly VITE_OIDC_ENDPOINT: string;
	readonly VITE_OIDC_REDIRECT_URI: string;
	readonly VITE_DPOP_ENDPOINT: string;
	readonly VITE_DPOP_RESOURCE_ARN: string;
	readonly VITE_DPOP_HTU: string;
	readonly VITE_VIDEO_ORG_ID: string;
	readonly VITE_VIDEO_TARGET_ID: string;
	readonly VITE_VIDEO_SIGNALING_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
