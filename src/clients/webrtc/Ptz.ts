import type { WebRtcEvent } from "@axiscommunications/webrtcvideo/";
import { WebRtcContextError } from "./WebRtcContextError";

/**
 * A PTZ preset
 */
export class PtzPreset {
	/**
	 * @internal
	 */
	constructor(
		public name: string,
		private _id: number,
	) {}

	/**
	 * @internal
	 */
	id(): number {
		return this._id;
	}
}

enum PtzState {
	Init = 0,
	Ready = 1,
	Error = 2,
}

const PTZ_TIMEOUT_MS = 5000;

class PromiseMap {
	private counter = 0;
	private map: Map<number, [(value: unknown) => void, (reason: unknown) => void]> = new Map();

	register(resolve: (value: unknown) => void, reject: (reason: unknown) => void): number {
		const id = this.counter;
		this.map.set(id, [resolve, reject]);
		this.counter += 1;
		return id;
	}

	reject(id: number, reason: string) {
		const callbacks = this.map.get(id);
		if (callbacks) {
			callbacks[1](new WebRtcContextError("PtzFailed", reason));
			this.map.delete(id);
		}
	}

	resolveAll() {
		for (const [_id, [resolve, _reject]] of this.map) {
			resolve(undefined);
		}
		this.map.clear();
	}

	rejectAll(reason: string) {
		for (const [_id, [_resolve, reject]] of this.map) {
			reject(new WebRtcContextError("PtzFailed", reason));
		}
		this.map.clear();
	}
}

export class Ptz {
	private state: PtzState;
	private promiseMap: PromiseMap = new PromiseMap();

	constructor() {
		this.state = PtzState.Init;
	}

	async waitForPtzReady(): Promise<void> {
		if (this.state === PtzState.Ready) {
			return;
		}
		if (this.state === PtzState.Error) {
			throw new WebRtcContextError("PtzFailed", "PTZ initialization failed");
		}

		const promise = new Promise((resolve, reject) => {
			const id = this.promiseMap.register(resolve, reject);
			setTimeout(() => {
				if (this.state === PtzState.Init) {
					this.promiseMap.reject(id, "PTZ initialization timed out");
				}
			}, PTZ_TIMEOUT_MS);
		});

		await promise;
	}

	setReady() {
		this.setState(PtzState.Ready);
	}

	private setState(state: PtzState) {
		if (state !== this.state) {
			this.state = state;
			this.onStateChanged(state);
		}
	}

	onEvent(event: WebRtcEvent) {
		switch (event.eventType) {
			case "PtzReady":
				this.setState(PtzState.Ready);
				break;
			case "PtzInitFailed":
				this.setState(PtzState.Error);
				break;
		}
	}

	private onStateChanged(newState: PtzState) {
		if (newState === PtzState.Ready) {
			this.promiseMap.resolveAll();
		} else if (newState === PtzState.Error) {
			this.promiseMap.rejectAll("PTZ initialization failed");
		}
	}
}
