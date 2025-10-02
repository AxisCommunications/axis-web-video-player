/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_OIDC_CLIENT_ID: string;
	readonly VITE_OIDC_ENDPOINT: string;
	readonly VITE_OIDC_REDIRECT_URI: string;
	readonly VITE_VIDEO_ORG_ID: string;
	readonly VITE_VIDEO_TARGET_ID: string;
	readonly VITE_VIDEO_SIGNALING_URL: string;
	readonly VITE_EXAMPLE_TYPE: "live" | "playback";
	readonly VITE_PLAYBACK_RECORDING_ID: string;
	readonly VITE_PLAYBACK_DISK_ID: string;
	readonly VITE_PLAYBACK_START_TIME: string;
	readonly VITE_PLAYBACK_DURATION_SECONDS: number;
}

// biome-ignore lint/correctness/noUnusedVariables: interface merging
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
