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
 * Options for the EdgeLiveStreamDetails instance.
 */
export interface EdgeProfileStreamDetailsOptions {
	/**
	 * Whether to include video in the stream.
	 */
	videoReceive?: boolean;
	/**
	 * The profile to use for the stream.
	 */
	streamProfile?: string;
	/**
	 * Whether to include audio in the stream.
	 */
	audioReceive?: boolean;
	/**
	 * Whether to allow sending audio to the target.
	 */
	audioSend?: boolean;
}

/**
 * @internal
 */
export interface EdgeProfileStreamDetailsBuildObject {
	videoReceive?: {
		streamProfile: string;
	};
	audioReceive?: AudioReceiveObject;
	audioSend?: AudioSendObject;
}

/**
 * Use a named stream profile.
 * A stream profile contains a collection of parameters such as video codecs, resolutions, frame rates and compressions.
 */
export class EdgeProfileStreamDetails implements StreamDetails {
	constructor(private options: EdgeProfileStreamDetailsOptions) {}

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
	build(): EdgeProfileStreamDetailsBuildObject {
		let videoReceive: { streamProfile: string } | undefined;
		if (this.withVideoReceive) {
			if (!this.options.streamProfile) {
				throw new WebRtcContextError(
					"ConfigurationError",
					"streamProfile is mandatory when videoReceive is enabled",
				);
			}
			videoReceive = { streamProfile: this.options.streamProfile };
		}

		return {
			videoReceive: videoReceive,
			audioReceive: this.withAudioReceive ? {} : undefined,
			audioSend: this.withAudioSend ? {} : undefined,
		};
	}
}
