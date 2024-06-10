import type { AudioReceiveObject, StreamDetails } from "./StreamDetails";

/**
 * @internal
 */
export interface EdgeLiveStreamDetailsBuildObject {
	videoReceive: {
		height: number;
		framerate: number;
		width: number;
		channel?: number;
	};
	audioReceive?: AudioReceiveObject;
}

/**
 * Options for the EdgeLiveStreamDetails instance.
 */
export interface EdgeLiveStreamDetailsOptions {
	/**
	 * Width of the video stream.
	 */
	width: number;
	/**
	 * Height of the video stream.
	 */
	height: number;
	/**
	 * Framerate of the video stream.
	 */
	framerate: number;
	/**
	 * Whether to include audio in the stream.
	 */
	audioReceive?: boolean;
	/**
	 * The video channel to use.
	 */
	channel?: number;
	/**
	 * An optional `MediaStream` containing one or more audio tracks,
	 * for audio transmission to the device, e.g. the stream returned by
	 * `navigator.mediaDevices.getUserMedia({audio: true})`. If not set,
	 * audio will not be transmitted.
	 */
	audioTransmitStream?: MediaStream;
}

/**
 * Set stream details such as resolution and framerate for an edge live stream.
 */
export class EdgeLiveStreamDetails implements StreamDetails {
	constructor(private options: EdgeLiveStreamDetailsOptions) {}

	get withAudio(): boolean {
		return this.options.audioReceive ?? false;
	}

	get audioTransmitStream(): MediaStream | undefined {
		return this.options.audioTransmitStream;
	}

	/**
	 * @internal
	 */
	build(): EdgeLiveStreamDetailsBuildObject {
		return {
			videoReceive: {
				framerate: this.options.framerate,
				height: this.options.height,
				width: this.options.width,
				channel: this.options.channel,
			},
			audioReceive: this.options.audioReceive ? {} : undefined,
		};
	}
}
