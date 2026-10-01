"use client";

import React, {Suspense, use, useCallback, useEffect, useRef, useState} from "react";
import {FaBackward, FaChevronLeft, FaChevronRight, FaForward, FaPause, FaPlay, FaSpinner} from "react-icons/fa6";
import {getPodcast, getPodcastAssetUrl, type PodcastItem} from "@/api";
import {cn} from "tailwind-variants";
import Image from "next/image";
import {formatDurationToTime} from "@/utils/audio";

export interface PodcastProps {
	podcast: PodcastItem;
	className?: string;
	showContentText?: boolean;
}

export interface AsyncPodcastProps {
	id?: string;
	podcast?: Promise<PodcastItem>;
	className?: string;
	showContentText?: boolean;
}

const BAR_COUNT = 45;

export function Podcast({
	podcast,
	className,
	showContentText = true,
}: PodcastProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const progressBarRef = useRef<HTMLDivElement | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isScrubbing, setIsScrubbing] = useState(false);

	const isInitialMount = useRef(true);
	const isPlayingRef = useRef(isPlaying);

	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	const audioSrc = podcast?.podcast ? getPodcastAssetUrl(podcast.podcast) : "";
	const thumbnailSrc = podcast?.thumbnail ? getPodcastAssetUrl(podcast.thumbnail) : "";

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		setCurrentTime(0);
		setDuration(0);
		setErrorMessage(null);

		const audio = audioRef.current;
		if (!audio) return;

		audio.currentTime = 0;
		if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
			setDuration(audio.duration);
		}

		if (isPlayingRef.current) {
			setIsLoading(true);
			const playPromise = audio.play();
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						setIsPlaying(true);
						setIsLoading(false);
					})
					.catch((err) => {
						console.warn("Audio switch playback failed:", err);
						setIsLoading(false);
						setIsPlaying(false);
						setErrorMessage("Kunne ikke afspille podcast.");
					});
			}
		}
	}, [podcast]);

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
						setErrorMessage("Kunne ikke afspille podcast.");
					});
			}
		} else {
			audio.pause();
			setIsPlaying(false);
		}
	}, []);

	function handleRewind() {
		const audio = audioRef.current;
		if (audio) {
			const targetTime = Math.max(0, audio.currentTime - 10);
			audio.currentTime = targetTime;
			setCurrentTime(targetTime);
		} else {
			setCurrentTime((prev) => Math.max(0, prev - 10));
		}
	}

	function handleForward() {
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
	}

	const handleSeekFromClientX = useCallback(
		(clientX: number) => {
			const barElement = progressBarRef.current;
			if (!barElement) return;

			const rect = barElement.getBoundingClientRect();
			const clickX = clientX - rect.left;
			const ratio = Math.max(0, Math.min(1, clickX / rect.width));
			const newTime = ratio * duration;

			setCurrentTime(newTime);
			if (audioRef.current) {
				try {
					audioRef.current.currentTime = newTime;
				} catch (err) {
					console.warn("Could not seek currentTime yet:", err);
				}
			}
		},
		[duration]
	);

	function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
		setIsScrubbing(true);
		handleSeekFromClientX(event.clientX);
	}

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

	if (!podcast) {
		return null;
	}

	const currentRatio = duration > 0 ? currentTime / duration : 0;
	const activeBarCount = Math.floor(currentRatio * BAR_COUNT);

	return (
		<article
			className={cn(
				"w-full bg-white border-2 border-gray p-3 sm:p-4",
				className
			)}
		>
			{/* Audio source */}
			{audioSrc && (
				<audio
					ref={audioRef}
					src={audioSrc}
					crossOrigin="anonymous"
					preload="auto"
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
					onLoadedMetadata={(event) => {
						const dur = event.currentTarget.duration;
						if (dur && !isNaN(dur) && isFinite(dur)) {
							setDuration(dur);
						}
						setIsLoading(false);
					}}
					onTimeUpdate={(event) => {
						if (!isScrubbing) {
							setCurrentTime(event.currentTarget.currentTime);
						}
					}}
					onEnded={() => {
						setIsPlaying(false);
						setCurrentTime(0);
					}}
					onError={(event) => {
						const err = event.currentTarget.error;
						console.error("Audio playback error event:", err);
						setIsPlaying(false);
						setIsLoading(false);
						setErrorMessage("Der var en fejl ved afspilning af lydfilen");
					}}
				>
					<source src={audioSrc} type="audio/mpeg" />
				</audio>
			)}

			<div className={cn(
				"flex flex-row items-center sm:items-stretch gap-3 sm:gap-4 w-full"
			)}>
				{/* Thumbnail */}
				<div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0 aspect-square bg-neutral-100 overflow-hidden self-center">
					{thumbnailSrc ? (
						<Image
							src={thumbnailSrc}
							alt={podcast.headline}
							fill
							className="w-full h-full object-cover block"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-xs uppercase p-2 text-center bg-neutral-100">
							Intet billede
						</div>
					)}
				</div>

				{/* Player column */}
				<div className="flex-1 flex flex-col justify-between min-w-0">
					{/* Title & Subtitle */}
					<div>
						<h3 className="font-bold text-base sm:text-lg text-black truncate">
							{podcast.headline}
						</h3>
						<p className="text-xs sm:text-sm text-neutral-500 truncate">
							{podcast.info}
						</p>
					</div>

					{/* Controls */}
					<div className="flex items-center justify-center gap-3 sm:gap-4 my-1 select-none">
						<button
							onClick={handleRewind}
							title="Spol 10 sekunder tilbage"
							className={"text-black hover:text-category active:scale-90 transition-all cursor-pointer p-0.5"}
						>
							<FaBackward className="text-xs sm:text-sm" />
						</button>

						<button
							onClick={togglePlay}
							title={isPlaying ? "Pause" : "Afspil"}
							className={"text-black hover:text-category rounded-full border border-gray size-7 active:scale-90 transition-all cursor-pointer p-0.5 flex items-center justify-center"}
						>
							{isLoading ? (
								<FaSpinner className="animate-spin text-xs sm:text-sm" />
							) : isPlaying ? (
								<FaPause className="text-xs sm:text-sm" />
							) : (
								<FaPlay className="text-xs sm:text-sm ml-0.5" />
							)}
						</button>

						<button
							onClick={handleForward}
							title="Spol 10 sekunder frem"
							className={"text-black hover:text-category active:scale-90 transition-all cursor-pointer p-0.5"}
						>
							<FaForward className="text-xs sm:text-sm" />
						</button>
					</div>

					{errorMessage && (
						<p className="text-xs text-red-600 text-center font-medium">
							{errorMessage}
						</p>
					)}

					{/* Timeline */}
					<div className="w-full">
						<div className="flex justify-between items-center text-[11px] sm:text-xs font-semibold text-black mb-1 select-none">
							<span>{formatDurationToTime(currentTime)}</span>
							<span>{formatDurationToTime(duration)}</span>
						</div>

						<div
							ref={progressBarRef}
							onMouseDown={handleMouseDown}
							className="relative flex items-end justify-between h-4 sm:h-5 cursor-pointer group py-0.5 select-none gap-px sm:gap-0.5"
						>
							{Array.from({length: BAR_COUNT}).map((_, i) => {
								const isPlayed = i < activeBarCount;
								const isCurrent = i === activeBarCount;

								return (
									<div
										key={i}
										className={cn(
											"flex-1 max-w-0.75 transition-all",
											isPlayed || isCurrent ? "bg-category" : "bg-gray group-hover:bg-neutral-500",
											isCurrent ? "h-4 sm:h-5" : "h-3 sm:h-4"
										)}
									/>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}

export function PodcastSkeleton({className, showContentText = true}: {
	className?: string;
	showContentText?: boolean;
}) {
	return (
		<div
			className={cn(
				"w-full bg-white border-2 border-gray p-3 sm:p-4 select-none animate-pulse",
				className
			)}
		>
			<div className={cn(
				"grid gap-4 items-center",
				showContentText ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
			)}>
				<div className={cn(
					"flex flex-row items-center sm:items-stretch gap-3 sm:gap-4",
					showContentText ? "lg:col-span-7" : "w-full"
				)}>
					<div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0 aspect-square bg-neutral-200" />

					<div className="flex-1 flex flex-col justify-between min-w-0">
						<div>
							<div className="h-4 bg-neutral-200 rounded w-3/4 mb-1.5" />
							<div className="h-3 bg-neutral-100 rounded w-1/2" />
						</div>

						<div className="flex items-center justify-end gap-3 my-1">
							<div className="w-3 h-3 bg-neutral-200 rounded" />
							<div className="w-3 h-3 bg-neutral-200 rounded" />
							<div className="w-3 h-3 bg-neutral-200 rounded" />
						</div>

						<div className="w-full">
							<div className="flex justify-between items-center mb-1">
								<div className="h-2.5 w-6 bg-neutral-200 rounded" />
								<div className="h-2.5 w-6 bg-neutral-200 rounded" />
							</div>
							<div className="flex items-end justify-between h-4 py-0.5 gap-[1px]">
								{Array.from({length: BAR_COUNT}).map((_, i) => (
									<div
										key={i}
										className="flex-1 max-w-[3px] bg-neutral-200 h-3"
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				{showContentText && (
					<div className="lg:col-span-5 space-y-2 h-full">
						<div className="h-3 bg-neutral-200 rounded w-full" />
						<div className="h-3 bg-neutral-200 rounded w-11/12" />
						<div className="h-3 bg-neutral-100 rounded w-4/5" />
					</div>
				)}
			</div>
		</div>
	);
}

function AsyncPodcastDataConsumer({className, podcast, showContentText}: {
	className?: string;
	podcast: Promise<PodcastItem>;
	showContentText?: boolean;
}) {
	const data = use(podcast);

	return (
		<Podcast
			podcast={data}
			className={className}
			showContentText={showContentText}
		/>
	);
}

export default function AsyncPodcast({id, className, podcast, showContentText}: AsyncPodcastProps) {
	if (!id && !podcast) return null;
	const podcastPromise = podcast || (id ? getPodcast(id) : undefined);
	if (!podcastPromise) return null;

	return (
		<Suspense fallback={<PodcastSkeleton className={className} showContentText={showContentText} />}>
			<AsyncPodcastDataConsumer podcast={podcastPromise} className={className} showContentText={showContentText} />
		</Suspense>
	);
}
