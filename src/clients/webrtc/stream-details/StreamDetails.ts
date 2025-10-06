import type { AcsProStreamDetailsBuildObject } from "./AcsProStreamDetails";
import type { EdgeLiveStreamDetailsBuildObject } from "./EdgeLiveStreamDetails";
import type { EdgeProfileStreamDetailsBuildObject } from "./EdgeProfileStreamDetails";

/**
 * Interface for different types of live stream targets
 */
export interface StreamDetails {
	/**
	 * Builds the stream details object.
	 */
	build(): StreamDetailsBuildObject;

	/**
	 * Whether the stream should include video.
	 */
	get withVideoReceive(): boolean;
	/**
	 * Whether the stream should include audio.
	 */
	get withAudioReceive(): boolean;
	/**
	 * Whether to allow sending audio to the target.
	 */
	get withAudioSend(): boolean;
}

// Extend with other stream details types
type StreamDetailsBuildObject =
	| EdgeLiveStreamDetailsBuildObject
	| EdgeProfileStreamDetailsBuildObject
	| AcsProStreamDetailsBuildObject;

// Empty objects
export type AudioReceiveObject = Record<string, never>;
export type AudioSendObject = Record<string, never>;
