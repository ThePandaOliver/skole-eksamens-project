import React from "react";
import {
	getLandingpageArticles,
	getAllArticles,
	getAllVideos,
	getAllPodcast,
} from "@/api";
import HeroArticlesSection from "@/component/landingpage/HeroArticlesSection";
import LatestSection from "@/component/landingpage/LatestSection";
import VideoSection from "@/component/landingpage/VideoSection";
import PodcastSection from "@/component/landingpage/PodcastSection";

export const revalidate = 60;

export default async function Home() {
	const [landingArticles, allArticles, videos, podcasts] = await Promise.all([
		getLandingpageArticles().catch((err) => {
			console.error("Error fetching landingpage articles:", err);
			return [];
		}),
		getAllArticles().catch((err) => {
			console.error("Error fetching all articles:", err);
			return [];
		}),
		getAllVideos().catch((err) => {
			console.error("Error fetching videos:", err);
			return [];
		}),
		getAllPodcast().catch((err) => {
			console.error("Error fetching podcasts:", err);
			return [];
		}),
	]);

	// Filter articles
	const nonLandingArticles = allArticles.filter((a) => !a.isLandingpage);
	const latestArticles =
		nonLandingArticles.length >= 4
			? nonLandingArticles.slice(0, 4)
			: allArticles.slice(0, 4);

	return (
		<main className="parent-container space-y-6 sm:space-y-8 md:space-y-12 flex-1">
			<HeroArticlesSection articles={landingArticles} />
			<LatestSection articles={latestArticles} />
			<VideoSection videos={videos} />
			<PodcastSection podcasts={podcasts} />
		</main>
	);
}
