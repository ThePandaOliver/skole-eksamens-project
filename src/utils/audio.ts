/**
 * Calculates the duration of an audio file in seconds using the browser's HTML5 Audio API.
 * Uses object URLs and metadata preloading without loading the whole audio buffer into memory.
 */
export function getAudioDuration(file: File | Blob): Promise<number> {
	return new Promise((resolve, reject) => {
		const audio = document.createElement("audio");
		audio.preload = "metadata";
		const objectUrl = URL.createObjectURL(file);
		audio.src = objectUrl;

		const cleanup = () => {
			URL.revokeObjectURL(objectUrl);
			audio.removeAttribute("src");
			audio.load();
		};

		audio.onloadedmetadata = () => {
			// Certain browser engines (e.g. Chromium) might report Infinity until seeking
			if (audio.duration === Infinity) {
				audio.currentTime = Number.MAX_SAFE_INTEGER;
				audio.ontimeupdate = () => {
					audio.ontimeupdate = null;
					const dur = audio.duration;
					cleanup();
					resolve(dur);
				};
			} else {
				const dur = audio.duration;
				cleanup();
				resolve(dur);
			}
		};

		audio.onerror = () => {
			cleanup();
			reject(new Error("Kunne ikke udlæse metadata fra lydfilen."));
		};
	});
}

/**
 * Formats seconds into MM:SS or HH:MM:SS.
 */
export function formatDurationToTime(totalSeconds: number): string {
	if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = Math.floor(totalSeconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
