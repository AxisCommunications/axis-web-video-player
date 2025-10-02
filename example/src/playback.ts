import {
	EdgeRecordingDetails,
	type PlaybackContext,
	type SignalingConnection,
	type TokenRequestCallback,
	WebRtcClient,
	type WebRtcContextError,
} from "@axiscommunications/axis-web-video-player";

export async function startPlayback(
	signalingConnection: SignalingConnection,
	tokenRequestCallback: TokenRequestCallback,
	videoElement: HTMLDivElement,
) {
	const progressBar = document.querySelector<HTMLInputElement>("#progress-bar");
	const playPauseButton = document.querySelector<HTMLButtonElement>("#play-pause-button");
	if (!progressBar || !playPauseButton) {
		throw new Error("Could not find element in DOM");
	}

	const webRtcClient = new WebRtcClient({
		signalingConnection,
		tokenRequestCallback,
		orgId: import.meta.env.VITE_VIDEO_ORG_ID,
		targetId: import.meta.env.VITE_VIDEO_TARGET_ID,
	});

	const startTimestamp = import.meta.env.VITE_PLAYBACK_START_TIME;
	const recordingDetails = new EdgeRecordingDetails({
		recordingId: import.meta.env.VITE_PLAYBACK_RECORDING_ID,
		diskId: import.meta.env.VITE_PLAYBACK_DISK_ID,
		startTime: startTimestamp,
	});

	const durationMs = import.meta.env.VITE_PLAYBACK_DURATION_SECONDS * 1000;
	const startTimeMs = new Date(startTimestamp).getTime();
	const endTimeMs = startTimeMs + durationMs;

	progressBar.min = startTimeMs.toString();
	progressBar.max = endTimeMs.toString();

	let context: PlaybackContext<EdgeRecordingDetails>;
	try {
		context = await webRtcClient.startPlayback({
			recordingDetails,
			videoElement,
			autoPlay: false,
		});
	} catch (error) {
		const contextError = error as WebRtcContextError;
		switch (contextError.type) {
			case "SignalingConnectionFailed":
				console.error(`Failed to connect to signaling server: ${contextError.message}`);
				break;
			case "TargetConnectionFailed":
				console.error(`Failed to connect to target: ${contextError.message}`);
				break;
			case "TargetNotConnected":
				console.error("The target was not connected");
				break;
			case "TargetConnectionDenied":
				console.error(`Connecting to target not allowed: ${contextError.message}`);
				break;
			case "OperationNotSupportedByTarget":
				console.error(`The target did not support a requested operation: ${contextError.message}`);
				break;
			case "TargetPlaybackError":
				console.error(`The target could not fulfill the playback request: ${contextError.message}`);
				break;
			default:
				console.error(`Error: ${error}`);
				break;
		}
		return;
	}

	progressBar.disabled = false;
	playPauseButton.disabled = false;

	let isPlaying = false;
	context.setPlayerStateChangedCallback((state) => {
		if (state === "playing") {
			isPlaying = true;
			playPauseButton.disabled = false;
			playPauseButton.textContent = "Pause";
		} else if (state === "paused") {
			isPlaying = false;
			playPauseButton.disabled = false;
			playPauseButton.textContent = "Play";
		} else if (state === "ended") {
			isPlaying = false;
			playPauseButton.disabled = true;
		}
	});

	playPauseButton.addEventListener("click", async () => {
		if (isPlaying) {
			await context.pause();
		} else {
			await context.play();
		}
	});

	let capture = false;
	context.setPositionChangedCallback(async (pos) => {
		if (capture) {
			return;
		}

		const posMs = pos.getTime();
		progressBar.value = posMs.toString();
		if (posMs >= endTimeMs) {
			await context.pause();
		}
	});

	progressBar.addEventListener("mousedown", () => {
		capture = true;
		const onMouseUp = () => {
			capture = false;
			progressBar.removeEventListener("mouseup", onMouseUp);
		};
		progressBar.addEventListener("mouseup", onMouseUp);
	});

	progressBar.addEventListener("change", async () => {
		await context.jump(new Date(Number.parseInt(progressBar.value, 10)));
	});
}
