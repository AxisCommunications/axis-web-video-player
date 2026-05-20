/**
 * Copyright (C) 2026 Axis Communications AB, Lund, Sweden
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE.md file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Initial connection to the signaling server
 */
export type AuthPurposeSignalServerConnection = "SignalServerConnection";
/**
 * Signaling message to a target
 */
export type AuthPurposeTargetSignaling = "TargetSignaling";
/**
 * Live stream
 */
export type AuthPurposeLive = "Live";
/**
 * Playback from a device
 */
export type AuthPurposePlayback = "Playback";
/**
 * PTZ commands
 */
export type AuthPurposePtz = "Ptz";
/**
 * Fetching from Cloud Storage
 */
export type AuthPurposeCloudStorage = "CloudStorage";
/**
 * Initial connection to a device, without a live stream
 */
export type AuthPurposeDeviceConnection = "DeviceConnection";
