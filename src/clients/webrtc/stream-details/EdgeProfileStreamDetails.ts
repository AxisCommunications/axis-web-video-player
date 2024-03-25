import type { AudioReceiveObject, StreamDetails } from "./StreamDetails";

/**
 * Options for the EdgeLiveStreamDetails instance.
 */
export interface EdgeProfileStreamDetailsOptions {
	/**
	 * The profile to use for the stream.
	 */
	streamProfile: string;

	/**
	 * Whether to include audio in the stream.
	 */
	audioReceive?: boolean;
}

/**
 * @internal
 */
export interface EdgeProfileStreamDetailsBuildObject {
	videoReceive: {
		streamProfile: string;
	};
	audioReceive?: AudioReceiveObject;
}

/**
 * Use a named stream profile.
 * A stream profile contains a collection of parameters such as video codecs, resolutions, frame rates and compressions.
 */
export class EdgeProfileStreamDetails implements StreamDetails {
	constructor(private options: EdgeProfileStreamDetailsOptions) {}

	get withAudio(): boolean {
		return this.options.audioReceive ?? false;
	}

	/**
	 * @internal
	 */
	build(): EdgeProfileStreamDetailsBuildObject {
		return {
			videoReceive: {
				streamProfile: this.options.streamProfile,
			},
			audioReceive: this.options.audioReceive ? {} : undefined,
		};
	}
}
