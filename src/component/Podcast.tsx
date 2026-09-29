"use client";

import React, {
	use,
	useState,
	useRef,
	useEffect,
	useCallback,
	Suspense,
} from "react";
import {FaBackward, FaForward, FaPause, FaPlay, FaSpinner} from "react-icons/fa6";

export interface PodcastItem {
	_id?: string;
	id?: string;
	headline: string;
	subtitle?: string;
	length?: number | string;
	podcast: string;
	thumbnail: string;
	releaseDate?: string;
	contentText?: string;
}

export interface PodcastProps {
	podcast: PodcastItem;
}

export interface AsyncPodcastProps {
	apiUrl?: string;
}

export function getPodcastAssetUrl(fileName: string): string {
	return `http://localhost:3001/assets/podcast/${fileName}`;
}

function formatTime(totalSeconds: number): string {
	if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}` ;
}

const BAR_COUNT = 50;

export function Podcast({
	                        podcast,
                        }: PodcastProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const progressBarRef = useRef<HTMLDivElement | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isScrubbing, setIsScrubbing] = useState(false);

	const audioSrc = getPodcastAssetUrl(podcast.podcast);
	const thumbnailSrc = getPodcastAssetUrl(podcast.thumbnail);

	const togglePlay = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) {
			console.warn("Audio element reference is not available");
			return;
		}

		setErrorMessage(null);

		audio.muted = false;
		audio.volume = 1;
		setDuration(audio.duration);

		if (audio.paused) {
			setIsLoading(true);
			const playPromise = audio.play();
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						setIsPlaying(true);
						setIsLoading(false);
					})
					.catch((err) => {
						console.warn("Audio play rejected:", err);
						setIsLoading(false);
						setIsPlaying(false);
						if (err.name !== "AbortError") {
							setErrorMessage("Kunne ikke afspille lyden. Prøv at klikke igen.");
						}
					});
			}
		} else {
			audio.pause();
			setIsPlaying(false);
		}
	}, []);

	const handleRewind = () => {
		const audio = audioRef.current;
		if (audio) {
			const targetTime = Math.max(0, audio.currentTime - 10);
			audio.currentTime = targetTime;
			setCurrentTime(targetTime);
		} else {
			setCurrentTime((prev) => Math.max(0, prev - 10));
		}
	};

	const handleForward = () => {
		const audio = audioRef.current;
		const maxDuration = duration > 0 ? duration : (audio?.duration || 0);
		if (audio) {
			const targetTime = maxDuration > 0
				? Math.min(maxDuration, audio.currentTime + 10)
				: audio.currentTime + 10;
			audio.currentTime = targetTime;
			setCurrentTime(targetTime);
		} else {
			setCurrentTime((prev) => (maxDuration > 0 ? Math.min(maxDuration, prev + 10) : prev + 10));
		}
	};

	const handleSeekFromClientX = useCallback(
		(clientX: number) => {
			const barElem = progressBarRef.current;
			if (!barElem) return;

			const rect = barElem.getBoundingClientRect();
			const clickX = clientX - rect.left;
			const ratio = Math.max(0, Math.min(1, clickX / rect.width));
			const newTime = ratio * duration;

			setCurrentTime(newTime);
			if (audioRef.current && !isNaN(newTime) && isFinite(newTime)) {
				try {
					audioRef.current.currentTime = newTime;
				} catch (err) {
					console.warn("Could not seek currentTime yet:", err);
				}
			}
		},
		[duration]
	);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		setIsScrubbing(true);
		handleSeekFromClientX(e.clientX);
	};

	useEffect(() => {
		if (!isScrubbing) return;

		const onMouseMove = (e: MouseEvent) => {
			handleSeekFromClientX(e.clientX);
		};

		const onMouseUp = () => {
			setIsScrubbing(false);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);

		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, [isScrubbing, handleSeekFromClientX]);

	const currentRatio = duration > 0 ? currentTime / duration : 0;
	const activeBarCount = Math.round(currentRatio * BAR_COUNT);

	return (
		<article
			className={`w-full bg-white border border-[#E0E0E0] p-4 md:p-5 select-none`}
		>
			{audioSrc && (
				<audio
					ref={audioRef}
					src={audioSrc}
					crossOrigin={"anonymous"}
					preload={"auto"}
					playsInline
					onPlay={() => {
						setIsPlaying(true);
						setErrorMessage(null);
					}}
					onPause={() => {
						setIsPlaying(false);
					}}
					onWaiting={() => {
						setIsLoading(true);
					}}
					onPlaying={() => {
						setIsPlaying(true);
						setIsLoading(false);
					}}
					onCanPlay={() => {
						setIsLoading(false);
					}}
					onLoadedMetadata={(e) => {
						const dur = e.currentTarget.duration;
						console.log("Duration:", dur);
						if (dur && !isNaN(dur) && isFinite(dur)) {
							setDuration(dur);
						}
						setIsLoading(false);
					}}
					onTimeUpdate={(e) => {
						if (!isScrubbing) {
							setCurrentTime(e.currentTarget.currentTime);
						}
					}}
					onEnded={() => {
						setIsPlaying(false);
					}}
					onError={(e) => {
						const err = e.currentTarget.error;
						console.error("Audio playback error event:", err);
						setIsPlaying(false);
						setIsLoading(false);
						setErrorMessage("Der var en fejl ved afspilning af lydfilen");
					}}
				>
					<source src={audioSrc} type="audio/mpeg"/>
				</audio>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
				<div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5">
					{/* Square Thumbnail */}
					<div
						className="w-full sm:w-[135px] h-[135px] flex-shrink-0 bg-neutral-100 overflow-hidden self-center sm:self-start">
						{thumbnailSrc ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={thumbnailSrc}
								alt={podcast.headline || "Podcast cover"}
								className="w-full h-full object-cover block"
								onError={(e) => {
									e.currentTarget.style.display = "none";
									const fallback = e.currentTarget.nextElementSibling;
									if (fallback) fallback.classList.remove("hidden");
								}}
							/>
						) : null}
						<div
							className={`w-full h-full bg-[#f3f3f3] flex flex-col items-center justify-center text-neutral-400 p-2 text-center ${
								thumbnailSrc ? "hidden" : "flex"
							}`}
						>
							<svg className="w-8 h-8 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"
							     strokeWidth="1.5">
								<rect x="2" y="2" width="20" height="20" rx="2"/>
								<path d="M7 17l9.2-9.2M17 17V8M8 8h9"/>
							</svg>
							<span className="text-[10px] uppercase font-semibold">Podcast</span>
						</div>
					</div>

					<div className="flex-1 flex flex-col justify-between min-w-0">
						<div className="pt-0.5">
							<h3 className="font-bold text-[17px] sm:text-menu text-black leading-snug truncate">
								{podcast.headline}
							</h3>
							<p className="text-[13px] text-[#999999] leading-snug mt-0.5 truncate">
								{podcast.subtitle}
							</p>
						</div>

						<div className="flex items-center justify-center gap-2.5 my-2 relative">
							{/* Rewind 10s */}
							<button
								type="button"
								onClick={handleRewind}
								aria-label="Skip backward 10 seconds"
								title="Spol 10 sekunder tilbage"
								className="p-1 text-black hover:text-category active:scale-95 transition-all cursor-pointer"
							>
								<FaBackward/>
							</button>

							<button
								type="button"
								onClick={togglePlay}
								aria-label={isPlaying ? "Pause podcast" : "Play podcast"}
								className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#757575] flex items-center justify-center hover:border-black active:scale-90 transition-all bg-white cursor-pointer shadow-xs ${
									isLoading ? "ring-2 ring-category animate-pulse" : ""
								}`}
							>
								{isLoading ? (
									<FaSpinner/>
								) : isPlaying ? (
									<FaPause/>
								) : (
									<FaPlay/>
								)}
							</button>

							{/* Forward 10s */}
							<button
								type="button"
								onClick={handleForward}
								aria-label="Skip forward 10 seconds"
								title="Spol 10 sekunder frem"
								className="p-1 text-black hover:text-category active:scale-95 transition-all cursor-pointer"
							>
								<FaForward/>
							</button>
						</div>

						{errorMessage && (
							<p className="text-[11px] text-red-600 text-center -mt-1 mb-1 font-medium">
								{errorMessage}
							</p>
						)}

						<div className="w-full pb-0.5">
							<div
								className="flex justify-between items-center text-[12px] font-semibold text-black mb-1 select-none">
								<span>{formatTime(currentTime)}</span>
								<span>{formatTime(duration)}</span>
							</div>

							<div
								ref={progressBarRef}
								role="slider"
								aria-label="Audio timeline scrubber"
								aria-valuemin={0}
								aria-valuemax={Math.round(duration)}
								aria-valuenow={Math.round(currentTime)}
								onMouseDown={handleMouseDown}
								className="relative flex items-end justify-between h-5 cursor-pointer group py-1"
							>
								{Array.from({length: BAR_COUNT}).map((_, i) => {
									const isPlayed = i < activeBarCount;
									const isCurrent = i === activeBarCount;

									return (
										<div
											key={i}
											style={{
												height: isCurrent ? "18px" : "14px",
											}}
											className={`w-[2.2px] transition-colors rounded-[0.5px] ${
												isPlayed || isCurrent
													? "bg-[#e89700]"
													: "bg-[#999999] group-hover:bg-[#808080]"
											}`}
										/>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				<div
					className="lg:col-span-5 text-[#6e6e6e] text-[13.5px] sm:text-[14px] leading-relaxed font-normal select-text">
					<p className="line-clamp-6">{podcast.contentText}</p>
				</div>
			</div>
		</article>
	);
}

export function PodcastSkeleton({className = ""}: { className?: string }) {
	return (
		<div
			aria-label="Loading podcast..."
			className={`w-full bg-white border border-[#E0E0E0] p-4 md:p-5 select-none animate-pulse ${className}`}
		>
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
				{/* Left Column Skeleton */}
				<div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5">
					<div className="w-full sm:w-[135px] h-[135px] bg-neutral-200 flex-shrink-0"/>

					<div className="flex-1 flex flex-col justify-between min-w-0">
						<div>
							<div className="h-5 bg-neutral-200 rounded w-3/4 mb-2"/>
							<div className="h-3.5 bg-neutral-100 rounded w-1/2"/>
						</div>

						<div className="flex items-center justify-center gap-3 my-2">
							<div className="w-4 h-4 bg-neutral-200 rounded"/>
							<div className="w-8 h-8 rounded-full bg-neutral-200"/>
							<div className="w-4 h-4 bg-neutral-200 rounded"/>
						</div>

						<div className="w-full">
							<div className="flex justify-between items-center mb-1">
								<div className="h-3 w-8 bg-neutral-200 rounded"/>
								<div className="h-3 w-8 bg-neutral-200 rounded"/>
							</div>
							<div className="flex items-end justify-between h-5 py-1">
								{Array.from({length: BAR_COUNT}).map((_, i) => (
									<div
										key={i}
										style={{height: "14px"}}
										className="w-[2.2px] bg-neutral-200 rounded-[0.5px]"
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Right Column Skeleton */}
				<div className="lg:col-span-5 space-y-2">
					<div className="h-3.5 bg-neutral-200 rounded w-full"/>
					<div className="h-3.5 bg-neutral-200 rounded w-11/12"/>
					<div className="h-3.5 bg-neutral-200 rounded w-4/5"/>
					<div className="h-3.5 bg-neutral-100 rounded w-full"/>
					<div className="h-3.5 bg-neutral-100 rounded w-3/4"/>
				</div>
			</div>
		</div>
	);
}

const promiseCache = new Map<string, Promise<PodcastItem>>();

export function getPodcastPromise(url: string): Promise<PodcastItem> {
	if (!promiseCache.has(url)) {
		const p = fetch(url, {cache: "no-store"})
			.then(async (res) => {
				if (!res.ok) {
					throw new Error(`Failed to load podcast data (${res.status}): ${res.statusText}`);
				}
				return await res.json();
			}).catch((err) => {
				throw err;
			});
		promiseCache.set(url, p);
	}
	return promiseCache.get(url)!;
}

function AsyncPodcastDataConsumer({
	                                  apiUrl = "http://localhost:3001/podcast/682242eae96e5317c911c72c",
                                  }: { apiUrl?: string; }) {
	const promise = getPodcastPromise(apiUrl);
	const data = use(promise);

	return (
		<Podcast
			podcast={data}
		/>
	);
}

export default function AsyncPodcast({
	                                     apiUrl = "http://localhost:3001/podcast/682242eae96e5317c911c72c"
                                     }: AsyncPodcastProps) {
	return (
		<Suspense fallback={<PodcastSkeleton/>}>
			<AsyncPodcastDataConsumer
				apiUrl={apiUrl}
			/>
		</Suspense>
	);
}
