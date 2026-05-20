/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

import { MountOrientation, OpticalCenter, RadialDistortion } from "@axiscommunications/webrtcvideo";

/**
 * Parameters for image dewarping
 */
export interface DewarpParameters {
	/**
	 *	Radial distortion coefficients
	 */
	radialDistortion: {
		c1: number;
		c2: number;
		c3: number;
	};
	/**
	 * Optical center coordinates
	 */
	opticalCenter: {
		x: number;
		y: number;
	};
	/**
	 * Camera mount orientation
	 *
	 * ceiling: camera tilt orientation = -90
	 * desk: camera tilt orientation = 90
	 * wall: camera tilt orientation = 0
	 */
	orientation: "ceiling" | "desk" | "wall";
}

export interface InternalDewarpParameters {
	radialDistortion: RadialDistortion;
	opticalCenter: OpticalCenter;
	mountOrientation: MountOrientation;
}

export const convertDewarpParameters = (
	dewarpParameters: DewarpParameters,
): InternalDewarpParameters => {
	const radialDistortion = new RadialDistortion(
		dewarpParameters.radialDistortion.c1,
		dewarpParameters.radialDistortion.c2,
		dewarpParameters.radialDistortion.c3,
	);
	const opticalCenter = new OpticalCenter(
		dewarpParameters.opticalCenter.x,
		dewarpParameters.opticalCenter.y,
	);
	let mountOrientation: MountOrientation;
	switch (dewarpParameters.orientation) {
		case "ceiling":
			mountOrientation = MountOrientation.Ceiling;
			break;
		case "desk":
			mountOrientation = MountOrientation.Desk;
			break;
		case "wall":
		default:
			mountOrientation = MountOrientation.Wall;
			break;
	}
	return {
		radialDistortion,
		opticalCenter,
		mountOrientation,
	};
};
