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
			const duration = audio.duration;
			cleanup();
			resolve(duration);
		};

		audio.onerror = () => {
			cleanup();
			reject(new Error("Kunne ikke læse metadata fra lydfilen."));
		};
	});
}

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
