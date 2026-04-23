/**
 * Copyright (C) Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import type { RecordingDetails } from "./RecordingDetails";

/**
 * Options for the {@link EdgeRecordingDetails}  instance
 */
export interface EdgeRecordingDetailsOptions {
	/**
	 * ID of the recording
	 */
	recordingId: string;
	/**
	 * ID of the disk where the recording is stored
	 */
	diskId: string;
	/**
	 * The start time of the recording in ISO 8601 format
	 */
	startTime: string;
}

/**
 * @internal
 */
export interface EdgeRecordingDetailsBuildObject {
	type: "Device";
	version: "1.0";
	recording: {
		targetId: string;
		id: string;
		diskId: string;
		recordingStatus: string;
		time: string;
		hasVideo: boolean;
		hasAudio: boolean;
	};
}

/**
 * Details for Edge recordings
 */
export class EdgeRecordingDetails implements RecordingDetails {
	constructor(private options: EdgeRecordingDetailsOptions) {}

	/**
	 * @internal
	 */
	build(targetId: string): EdgeRecordingDetailsBuildObject {
		return {
			type: "Device",
			version: "1.0",
			recording: {
				targetId: targetId,
				id: this.options.recordingId,
				diskId: this.options.diskId,
				time: this.options.startTime,
				// These options are never used by the client library.
				// However, the client library defines them as non-optional members,
				// so they have to exist.
				recordingStatus: "",
				hasVideo: true,
				hasAudio: true,
			},
		};
	}
}
