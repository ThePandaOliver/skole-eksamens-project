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
import {getPodcast} from "@/api";
import {cn} from "tailwind-variants";
import Image from "next/image";

export interface PodcastItem {
	_id?: string;
	headline: string;
	subtitle: string;
	length: number;
	podcast: string;
	thumbnail: string;
	releaseDate: string;
	contentText: string;
}

export interface PodcastProps {
	podcasts: PodcastItem | PodcastItem[];
	className?: string;
}

export interface AsyncPodcastProps {
	ids?: string | string[];
	podcasts?: Promise<PodcastItem> | Promise<PodcastItem[]>;
	className?: string;
}

export function getPodcastAssetUrl(fileName: string): string {
	return `http://localhost:3001/assets/podcast/${fileName}`;
}

function formatTime(totalSeconds: number): string {
	if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

const BAR_COUNT = 50;

export function Podcast({
	                        podcasts,
	                        className
                        }: PodcastProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const progressBarRef = useRef<HTMLDivElement | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isScrubbing, setIsScrubbing] = useState(false);

	const audioSrc = getPodcastAssetUrl(podcasts.podcast);
	const thumbnailSrc = getPodcastAssetUrl(podcasts.thumbnail);

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
						setErrorMessage("Kunne ikke afspille lyden. Prøv at klikke igen.");
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
	const activeBarCount = Math.floor(currentRatio * BAR_COUNT);

	return (
		<article
			className={cn(
				"w-full bg-white border-2 border-gray p-4",
				className
			)}
		>
			{/* Audio source */}
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
				{/* Left Column */}
				<div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch gap-4">
					{/* Thumbnail */}
					<div className="relative size-50 shrink-0 bg-neutral-100 overflow-hidden self-center">
						<Image
							src={thumbnailSrc}
							alt={podcasts.headline}
							fill
							className="w-full h-full object-cover block"
						/>
					</div>

					{/* Center Column */}
					<div className="flex-1 flex flex-col min-w-0">
						{/* Title and subtitle */}
						<div className="h-full">
							<h3 className="font-bold text-xl text-black truncate">
								{podcasts.headline}
							</h3>
							<p className="text-base border-gray truncate">
								{podcasts.subtitle}
							</p>
						</div>

						{/* Controls */}
						<div className="flex items-center justify-center gap-2.5 relative">
							{/* Rewind 10s */}
							<button
								type="button"
								onClick={handleRewind}
								title="Spol 10 sekunder tilbage"
								className="p-1 text-black hover:text-category active:scale-95 transition-all cursor-pointer"
							>
								<FaBackward/>
							</button>


							<button
								type="button"
								onClick={togglePlay}
								className={"w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray flex items-center justify-center hover:border-black active:scale-90 transition-all bg-white cursor-pointer shadow-xs"}
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
								title="Spol 10 sekunder frem"
								className="p-1 text-black hover:text-category active:scale-95 transition-all cursor-pointer"
							>
								<FaForward/>
							</button>
						</div>

						{errorMessage && (
							<p className="text-[11px] text-red-600 text-center font-medium">
								{errorMessage}
							</p>
						)}

						{/* Timeline */}
						<div className="w-full pb-0.5">
							<div
								className="flex justify-between items-center text-sm font-semibold text-black mb-1 select-none">
								<span>{formatTime(currentTime)}</span>
								<span>{formatTime(duration)}</span>
							</div>

							<div
								ref={progressBarRef}
								onMouseDown={handleMouseDown}
								className="relative flex items-end justify-between h-5 cursor-pointer group py-1 select-none"
							>
								{Array.from({length: BAR_COUNT}).map((_, i) => {
									const isPlayed = i < activeBarCount;
									const isCurrent = i === activeBarCount;

									return (
										<div
											key={i}
											className={cn(
												"w-1 transition-all",
												isPlayed || isCurrent ? "bg-category" : "bg-gray group-hover:bg-neutral-500",
												isCurrent ? "h-5" : "h-4"
											)}
										/>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div
					className="lg:col-span-5 text-neutral-500 text-sm h-full">
					<p>{podcasts.contentText}</p>
				</div>
			</div>
		</article>
	);
}

export function PodcastSkeleton({className}: { className?: string }) {
	return (
		<div
			className={cn(
				"w-full bg-white border-2 border-gray p-4 select-none animate-pulse",
				className
			)}
		>
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
				{/* Left Column */}
				<div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch gap-4">
					{/* Thumbnail */}
					<div className="size-50 shrink-0 bg-neutral-200"/>

					{/* Center Column */}
					<div className="flex-1 flex flex-col min-w-0">
						{/* Title and subtitle */}
						<div className="h-full">
							<div className="h-5 bg-neutral-200 rounded w-3/4 mb-2"/>
							<div className="h-3.5 bg-neutral-100 rounded w-1/2"/>
						</div>

						<div className="flex items-center justify-center gap-3 my-2">
							<div className="w-4 h-4 bg-neutral-100 rounded"/>
							<div className="w-4 h-4 bg-neutral-200 rounded"/>
							<div className="w-8 h-8 rounded-full bg-neutral-200"/>
							<div className="w-4 h-4 bg-neutral-200 rounded"/>
							<div className="w-4 h-4 bg-neutral-100 rounded"/>
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
										className={"w-1 bg-neutral-200 h-4"}
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div className="lg:col-span-5 space-y-2 h-full">
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

function AsyncPodcastDataConsumer({className, podcast}: { className?: string, podcast: Promise<PodcastItem[]> }) {
	const data = use(podcast);

	return (
		<Podcast
			podcasts={data}
			className={className}
		/>
	);
}

export default function AsyncPodcast({ids, className, podcasts}: AsyncPodcastProps) {
	const podcast = podcasts || ids != undefined ? (
		Array.isArray(ids) ? Promise.all(ids.map(id => getPodcast(id))) : ids !== undefined ? Promise.all([getPodcast(ids[0])]) : undefined
	) : undefined;

	if (!podcast) return null;

	return (
		<Suspense fallback={<PodcastSkeleton/>}>
			<AsyncPodcastDataConsumer podcast={podcast} className={className}/>
		</Suspense>
	);
}
