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
	/**
	 * An optional `MediaStream` containing one or more audio tracks,
	 * for audio transmission to the device, e.g. the stream returned by
	 * `navigator.mediaDevices.getUserMedia({audio: true})`. If not set,
	 * audio will not be transmitted.
	 */
	audioTransmitStream?: MediaStream;
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

	get audioTransmitStream(): MediaStream | undefined {
		return this.options.audioTransmitStream;
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
