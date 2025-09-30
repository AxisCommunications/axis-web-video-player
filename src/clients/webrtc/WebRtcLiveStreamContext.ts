import type {
	WebRtcError,
	PtzPreset as InnerPtzPreset,
	WebRtcEvent,
	WebRtcContext as InnerWebRtcContext,
} from "@axiscommunications/webrtcvideo/";
import { WebRtcContext } from "./WebRtcContext";
import { WebRtcContextError } from "./WebRtcContextError";
import { Ptz, PtzPreset } from "./Ptz";

/**
 * Context for a live stream WebRTC communication.
 */
export class WebRtcLiveStreamContext extends WebRtcContext {
	private ptz: Ptz;

	/**
	 * @internal
	 */
	constructor(context: InnerWebRtcContext) {
		super(context);

		this.ptz = new Ptz();
		// Create a weak reference to the ptz object so that it doesn't keep the context alive.
		const weakPtz = new WeakRef(this.ptz);
		const eventCallback = (event: WebRtcEvent) => {
			weakPtz.deref()?.onEvent(event);
		};
		this.context.setEventHandler(eventCallback);
	}

	/**
	 * Zooms by the provided number of steps relative to the current position.
	 * @param steps The number of steps to zoom. Positive numbers zoom in, negative numbers zoom out. Range -9999...9999.
	 */
	async zoomRelative(steps: number): Promise<void> {
		await this.ptz.waitForPtzReady();
		try {
			await this.context.ptzRelativeZoom(steps);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Zooms continuously with the provided velocity.
	 * @param velocity The zoom velocity. Positive numbers zoom in, negative numbers zoom out. 0 stops the zooming. Range -100...100.
	 */
	async zoomContinuous(velocity: number): Promise<void> {
		await this.ptz.waitForPtzReady();
		try {
			await this.context.ptzContinuousZoom(velocity);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Centers the view on the provided coordinates.
	 * The coordinates are in pixels, relative to the video container HTML element.
	 * The offsetX/offsetY parameters from a click event handler on the video container element can be used unmodified.
	 * @param x x coordinate.
	 * @param y y coordinate.
	 */
	async center(x: number, y: number): Promise<void> {
		await this.ptz.waitForPtzReady();
		try {
			await this.context.ptzCenter(x, y);
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Fetches the configured PTZ presets.
	 * @returns The list of configured PTZ presets.
	 */
	async getPtzPresets(): Promise<PtzPreset[]> {
		await this.ptz.waitForPtzReady();
		try {
			const presets = await this.context.ptzGetPresets();
			return presets.map((preset: InnerPtzPreset) => {
				return new PtzPreset(preset.name, preset.id);
			});
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}

	/**
	 * Jumps to a PTZ preset.
	 * @param preset A PTZ preset received from {@link WebRtcLiveStreamContext.getPtzPresets}.
	 */
	async gotoPtzPreset(preset: PtzPreset): Promise<void> {
		await this.ptz.waitForPtzReady();
		try {
			await this.context.ptzGotoPreset(preset.id());
		} catch (error) {
			throw WebRtcContextError.fromWebRtcError(error as WebRtcError);
		}
	}
}
