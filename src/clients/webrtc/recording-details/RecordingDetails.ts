/**
 * Copyright (C) Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import type { AcsProRecordingDetailsBuildObject } from "./AcsProRecordingDetails";
import type { CloudStorageRecordingDetailsBuildObject } from "./CloudStorageRecordingDetails";
import type { EdgeRecordingDetailsBuildObject } from "./EdgeRecordingDetails";

/**
 * Interface for different types of recordings
 */
export interface RecordingDetails {
	/**
	 * @internal
	 * Builds the stream details object.
	 */
	build(targetId?: string): RecordingDetailsBuildObject;
}

type RecordingDetailsBuildObject =
	| EdgeRecordingDetailsBuildObject
	| AcsProRecordingDetailsBuildObject
	| CloudStorageRecordingDetailsBuildObject;
