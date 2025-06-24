import type { AcsProStreamDetailsBuildObject } from "./AcsProStreamDetails";
import type { EdgeLiveStreamDetailsBuildObject } from "./EdgeLiveStreamDetails";
import type { EdgeProfileStreamDetailsBuildObject } from "./EdgeProfileStreamDetails";

export interface StreamDetails {
	/**
	 * Builds the stream details object.
	 */
	build(): StreamDetailsBuildObject;

	/**
	 * Whether the stream should include audio.
	 */
	get withAudio(): boolean;
	/**
	 * Optional audio transmission stream
	 */
	get audioTransmitStream(): MediaStream | undefined;
}

// Extend with other stream details types
type StreamDetailsBuildObject =
	| EdgeLiveStreamDetailsBuildObject
	| EdgeProfileStreamDetailsBuildObject
	| AcsProStreamDetailsBuildObject;

// biome-ignore lint/complexity/noBannedTypes: will be expanded later
export type AudioReceiveObject = {};
