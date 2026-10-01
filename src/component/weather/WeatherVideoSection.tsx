"use client";

import React from "react";
import { VideoItem } from "@/api";
import { VideoComponent } from "@/component/landingpage/VideoSection";

interface WeatherVideoSectionProps {
	videos: VideoItem[];
}

export default function WeatherVideoSection({ videos }: WeatherVideoSectionProps) {
	if (!videos || videos.length === 0) {
		return null;
	}

	return (
		<section className="w-full">
			<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3 sm:mb-4">
				Video
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
				{videos.map((video, index) => (
					<article
						key={`${video._id}-${index}`}
						className="flex flex-col group cursor-pointer"
					>
						<VideoComponent video={video} />

						<div className="mt-2.5 sm:mt-3">
							<h3 className="font-bold text-sm sm:text-base md:text-lg text-black group-hover:text-category transition-colors line-clamp-2">
								{video.headline}
							</h3>
							<p className="text-xs sm:text-sm text-neutral-600 mt-1 line-clamp-2 sm:line-clamp-3">
								{video.content}
							</p>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
