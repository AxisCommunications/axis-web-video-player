/**
 * Copyright (C) Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import type { RecordingDetails } from "./RecordingDetails";

/**
 * Options for the {@link CloudStorageRecordingDetails}  instance
 */
export interface CloudStorageRecordingDetailsOptions {
	/**
	 * URL to the Cloud Storage playlist for the recording
	 */
	url: string;
	/**
	 * The start time of the recording in ISO 8601 format
	 */
	startTime: string;
}

/**
 * @internal
 */
export interface CloudStorageRecordingDetailsBuildObject {
	type: "CloudStorage";
	version: "1.0";
	recording: {
		url: string;
		start: string;
		stop: string;
		hasVideo: boolean;
		hasAudio: boolean;
	};
}

/**
 * Details for Cloud Storage recordings
 */
export class CloudStorageRecordingDetails implements RecordingDetails {
	constructor(private options: CloudStorageRecordingDetailsOptions) {}

	/**
	 * @internal
	 */
	build(): CloudStorageRecordingDetailsBuildObject {
		return {
			type: "CloudStorage",
			version: "1.0",
			recording: {
				url: this.options.url,
				start: this.options.startTime,
				// These options are never used by the client library.
				// However, the client library defines them as non-optional members,
				// so they have to exist.
				stop: "",
				hasVideo: true,
				hasAudio: true,
			},
		};
	}
}
