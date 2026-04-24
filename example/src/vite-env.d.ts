/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_VIDEO_ORG_ID: string;
	readonly VITE_VIDEO_TARGET_ID: string;
	readonly VITE_VIDEO_SIGNALING_URL: string;
	readonly VITE_EXAMPLE_TYPE: "live" | "playback";
	readonly VITE_PLAYBACK_RECORDING_ID: string;
	readonly VITE_PLAYBACK_DISK_ID: string;
	readonly VITE_PLAYBACK_START_TIME: string;
	readonly VITE_PLAYBACK_DURATION_SECONDS: number;
}

export interface ImportMeta {
	readonly env: ImportMetaEnv;
}
