"use client";

import React, { useState } from "react";
import Image from "next/image";
import { VideoItem, formatRelativeDate, getVideoAssetUrl, API_URL } from "@/api";
import { FaPlay, FaXmark } from "react-icons/fa6";

interface VideoSectionProps {
	videos: VideoItem[];
}

export function getThumbnailUrl(item: VideoItem) {
	return `${API_URL}/assets/images/${item.thumbnail}`;
}

export default function VideoSection({ videos }: VideoSectionProps) {
	if (!videos || videos.length === 0) {
		return null;
	}

	const sideVideos = videos.slice(0, 3);
	const featuredVideo = videos[3];

	return (
		<section className="w-full">
			<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3 sm:mb-4">Video</h2>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
				<div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
					{sideVideos.map((item) => {
						return (
							<article
								key={item._id}
								className="flex flex-row gap-3 cursor-pointer group items-start"
							>
								{/* Thumbnail with play badge */}
								<div className="w-36 sm:w-44 shrink-0">
									<VideoComponent video={item} />
								</div>

								{/* Info */}
								<div className="flex-1 flex flex-col min-w-0 py-0.5">
									<h3 className="font-bold text-xs sm:text-base text-black group-hover:text-category transition-colors line-clamp-2">
										{item.headline}
									</h3>
									<div className="text-xs text-neutral-500 mt-0.5">
										<span className="text-category font-semibold">Nyheder</span>
										<span>
											{" "}| {formatRelativeDate(item.publishedAt)}
										</span>
									</div>
									<p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 sm:line-clamp-3 mt-1">
										{item.content}
									</p>
								</div>
							</article>
						);
					})}
				</div>

				{featuredVideo && (
					<div className="hidden lg:flex lg:col-span-6 flex-col">
						<article className="group cursor-pointer flex flex-col">
							<VideoComponent video={featuredVideo} />

							<div className="mt-3">
								<h3 className="font-bold text-lg text-black group-hover:text-category transition-colors">
									{featuredVideo.headline}
								</h3>
								<div className="text-xs text-neutral-500 mt-1">
									<span className="text-category font-semibold">Nyheder</span>
									<span>
										{" "}| {formatRelativeDate(featuredVideo.publishedAt)}
									</span>
								</div>
								<p className="text-sm text-neutral-600 mt-1">
									{featuredVideo.content}
								</p>
							</div>
						</article>
					</div>
				)}
			</div>
		</section>
	);
}

export function VideoComponent({video}: {video: VideoItem}) {
	const [isOpen, setIsOpen] = useState(false);
	const thumbUrl = getThumbnailUrl(video);

	return (
		<>
			{/* Video Thumbnail */}
			<div
				className="relative w-full aspect-16/10 shrink-0 bg-neutral-100 overflow-hidden cursor-pointer"
				onClick={() => setIsOpen(true)}
			>
				{thumbUrl ? (
					<Image
						src={thumbUrl}
						alt={video.headline}
						fill
						className="object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				) : (
					<div className="w-full h-full bg-neutral-200" />
				)}
				<div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow transition-transform group-hover:scale-110">
						<FaPlay className="text-xs sm:text-sm ml-0.5" />
					</div>
				</div>
			</div>

			{/* Video Modal */}
			{isOpen && (
				<div
					className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
					onClick={() => setIsOpen(false)}
				>
					<div
						className="relative w-full max-w-3xl bg-black rounded-lg overflow-hidden shadow-2xl"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-center justify-between p-3 bg-neutral-900 text-white">
							<h4 className="font-semibold text-sm truncate mr-4">
								{video.headline}
							</h4>
							<button
								onClick={() => setIsOpen(false)}
								className="text-neutral-300 hover:text-white p-1 rounded transition-colors cursor-pointer"
								aria-label="Luk video"
							>
								<FaXmark className="text-lg" />
							</button>
						</div>

						<div className="relative aspect-video w-full bg-black">
							<video
								src={getVideoAssetUrl(video.url)}
								controls
								autoPlay
								playsInline
								className="w-full h-full object-contain"
							>
								Din browser understøtter ikke video-afspilning.
							</video>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
