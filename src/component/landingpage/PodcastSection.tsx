"use client";

import React, { useState } from "react";
import { Podcast } from "@/component/Podcast";
import { PodcastItem } from "@/utils/api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface PodcastSectionProps {
	podcasts: PodcastItem[];
}

export default function PodcastSection({ podcasts }: PodcastSectionProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	if (!podcasts || podcasts.length === 0) {
		return null;
	}

	const currentPodcast = podcasts[currentIndex % podcasts.length];

	const handlePrev = () => {
		setCurrentIndex((prev) => (prev - 1 + podcasts.length) % podcasts.length);
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev + 1) % podcasts.length);
	};

	return (
		<section className={"w-full"}>
			<h2 className={"text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3 sm:mb-4"}>Podcast</h2>
			<div className={"w-full bg-white border-2 border-gray p-3 sm:p-4"}>
				<Podcast
					podcast={currentPodcast}
					showContentText={false}
					className={"border-0 p-0"}
				/>
				<div className={"flex items-center justify-center gap-3 pt-3"}>
					<button
						type={"button"}
						onClick={handlePrev}
						title={"Forrige podcast"}
						className={"w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black flex items-center justify-center hover:border-category hover:text-category active:scale-90 transition-all cursor-pointer bg-white text-black"}
						aria-label={"Forrige podcast"}
					>
						<FaChevronLeft className={"text-xs"} />
					</button>
					<button
						type={"button"}
						onClick={handleNext}
						title={"Næste podcast"}
						className={"w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-black flex items-center justify-center hover:border-category hover:text-category active:scale-90 transition-all cursor-pointer bg-white text-black"}
						aria-label={"Næste podcast"}
					>
						<FaChevronRight className={"text-xs"} />
					</button>
				</div>
			</div>
		</section>
	);
}
