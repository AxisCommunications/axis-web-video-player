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
