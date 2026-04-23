/**
 * Copyright (C) Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import type { RecordingDetails } from "./RecordingDetails";

/**
 * Options for the {@link AcsProRecordingDetails} instance
 */
export interface AcsProRecordingDetailsOptions {
	/**
	 * The video source for the recording
	 */
	source: string;
	/**
	 * The start time of the recording in ISO 8601 format
	 */
	startTime: string;
	/**
	 * Quality level of the recording
	 */
	qualityLevel: string;
}

/**
 * @internal
 */
export interface AcsProRecordingDetailsBuildObject {
	type: "ACS";
	version: "1.0";
	recording: {
		targetId: string;
		source: string;
		start: string;
		stop: string;
		hasVideo: boolean;
		hasAudio: boolean;
		qualityLevel: string;
	};
}

/**
 * Details for ACS Pro recordings
 */
export class AcsProRecordingDetails implements RecordingDetails {
	constructor(private options: AcsProRecordingDetailsOptions) {}

	/**
	 * @internal
	 */
	build(targetId: string): AcsProRecordingDetailsBuildObject {
		return {
			type: "ACS",
			version: "1.0",
			recording: {
				targetId: targetId,
				source: this.options.source,
				start: this.options.startTime,
				qualityLevel: this.options.qualityLevel,
				// These options are never used by neither the streamer nor the client library.
				// However, the client library defines them as non-optional members,
				// so they have to exist.
				stop: "",
				hasVideo: true,
				hasAudio: true,
			},
		};
	}
}
