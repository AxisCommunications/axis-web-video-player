/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import { WebRtcContextError } from "../WebRtcContextError";
import type { AudioReceiveObject, AudioSendObject, StreamDetails } from "./StreamDetails";

/**
 * Options for the AcsProStreamDetails instance.
 */
export interface AcsProStreamDetailsOptions {
	/**
	 * Whether to include video in the stream.
	 */
	videoReceive?: boolean;
	/**
	 * The profile to use for the stream.
	 */
	streamProfile?: "low" | "medium" | "high";
	/**
	 * Whether to include audio in the stream.
	 */
	audioReceive?: boolean;
	/**
	 * Whether to allow sending audio to the target.
	 */
	audioSend?: boolean;
	/**
	 * The ACS video source ID of the stream
	 */
	source: string;
}

/**
 * @internal
 */
export interface AcsProStreamDetailsBuildObject {
	videoReceive?: {
		streamProfile: string;
	};
	audioReceive?: AudioReceiveObject;
	audioSend?: AudioSendObject;
	source: string;
}

/**
 * Use an ACS stream profile.
 * A stream profile contains a collection of parameters such as video codecs, resolutions, frame rates and compressions.
 */
export class AcsProStreamDetails implements StreamDetails {
	constructor(private options: AcsProStreamDetailsOptions) {}

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
	build(): AcsProStreamDetailsBuildObject {
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
			source: this.options.source,
			audioSend: this.withAudioSend ? {} : undefined,
		};
	}
}
