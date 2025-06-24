import type { AudioReceiveObject, StreamDetails } from "./StreamDetails";

/**
 * Options for the AcsProStreamDetails instance.
 */
export interface AcsProStreamDetailsOptions {
	/**
	 * The profile to use for the stream.
	 */
	streamProfile: "low" | "medium" | "high";
	/**
	 * Whether to include audio in the stream.
	 */
	audioReceive?: boolean;
	/**
	 * An optional `MediaStream` containing one or more audio tracks,
	 * for audio transmission to the device, e.g. the stream returned by
	 * `navigator.mediaDevices.getUserMedia({audio: true})`. If not set,
	 * audio will not be transmitted.
	 */
	audioTransmitStream?: MediaStream;
	/**
	 * The ACS video source ID of the stream
	 */
	source: string;
}

/**
 * @internal
 */
export interface AcsProStreamDetailsBuildObject {
	videoReceive: {
		streamProfile: string;
	};
	audioReceive?: AudioReceiveObject;
	source: string;
}

/**
 * Use an ACS stream profile.
 * A stream profile contains a collection of parameters such as video codecs, resolutions, frame rates and compressions.
 */
export class AcsProStreamDetails implements StreamDetails {
	constructor(private options: AcsProStreamDetailsOptions) {}

	get withAudio(): boolean {
		return this.options.audioReceive ?? false;
	}

	get audioTransmitStream(): MediaStream | undefined {
		return this.options.audioTransmitStream;
	}

	/**
	 * @internal
	 */
	build(): AcsProStreamDetailsBuildObject {
		return {
			videoReceive: {
				streamProfile: this.options.streamProfile,
			},
			audioReceive: this.options.audioReceive ? {} : undefined,
			source: this.options.source,
		};
	}
}
