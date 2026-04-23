/**
 * Copyright (C) Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import { WebRtcContextError } from "../WebRtcContextError";
import type { AudioReceiveObject, AudioSendObject, StreamDetails } from "./StreamDetails";

/**
 * @internal
 */
export interface EdgeLiveStreamDetailsBuildObject {
	videoReceive?: {
		height: number;
		framerate: number;
		width: number;
		channel?: number;
	};
	audioReceive?: AudioReceiveObject;
	audioSend?: AudioSendObject;
}

/**
 * Options for the EdgeLiveStreamDetails instance.
 */
export interface EdgeLiveStreamDetailsOptions {
	/**
	 * Whether to include video in the stream.
	 */
	videoReceive?: boolean;
	/**
	 * Video stream options
	 */
	videoOptions?: EdgeLiveStreamDetailsVideoOptions;
	/**
	 * Whether to include audio in the stream.
	 */
	audioReceive?: boolean;
	/**
	 * Whether to allow sending audio to the target.
	 */
	audioSend?: boolean;
}

export interface EdgeLiveStreamDetailsVideoOptions {
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
	 * The video channel to use.
	 */
	channel?: number;
}

/**
 * Set stream details such as resolution and framerate for an edge live stream.
 */
export class EdgeLiveStreamDetails implements StreamDetails {
	constructor(private options: EdgeLiveStreamDetailsOptions) {}

	/**
	 * @internal
	 */
	get withVideoReceive(): boolean {
		return this.options.videoReceive ?? true;
	}

	/**
	 * @internal
	 */
	get withAudioReceive(): boolean {
		return this.options.audioReceive ?? false;
	}

	/**
	 * @internal
	 */
	get withAudioSend(): boolean {
		return this.options.audioSend ?? false;
	}

	/**
	 * @internal
	 */
	build(): EdgeLiveStreamDetailsBuildObject {
		let videoReceive: EdgeLiveStreamDetailsVideoOptions | undefined;
		if (this.withVideoReceive) {
			if (!this.options.videoOptions) {
				throw new WebRtcContextError(
					"ConfigurationError",
					"videoOptions are mandatory when videoReceive is enabled",
				);
			}
			videoReceive = this.options.videoOptions;
		}
		return {
			videoReceive: videoReceive,
			audioReceive: this.withAudioReceive ? {} : undefined,
			audioSend: this.withAudioSend ? {} : undefined,
		};
	}
}
