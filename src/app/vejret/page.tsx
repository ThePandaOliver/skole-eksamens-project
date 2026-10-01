import React from "react";
import { getLandingpageArticles, getAllArticles, getAllVideos } from "@/api";
import HeroArticlesSection from "@/component/landingpage/HeroArticlesSection";
import WeatherSection from "@/component/weather/WeatherSection";
import WeatherVideoSection from "@/component/weather/WeatherVideoSection";
import { getWeatherData, WeatherData } from "@/utils/weather";

export const revalidate = 60;

export default async function VejretPage() {
	let weatherData: WeatherData | null = null;
	let weatherError: string | null = null;

	const [landingArticles, allArticles, allVideos] = await Promise.all([
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
	]);

	try {
		weatherData = await getWeatherData();
	} catch (err: unknown) {
		const message =
			err instanceof Error ? err.message : "Kunne ikke hente vejrdata";
		console.error("Error fetching weather data:", message);
		weatherError = message;
	}

	// Use top 3 articles for HeroArticlesSection as shown in the design
	const baseArticles = landingArticles.length >= 3 ? landingArticles : allArticles;
	const heroArticles = baseArticles.slice(0, 3);

	// Select 2 videos for the weather video section (matching design)
	const environmentalVideos = allVideos.filter((v) =>
		v.headline.toLowerCase().includes("environmental")
	);
	const weatherVideos = (
		environmentalVideos.length >= 2
			? environmentalVideos
			: [...environmentalVideos, ...allVideos]
	).slice(0, 2);

	return (
		<main className={"parent-container space-y-6 sm:space-y-8 md:space-y-12 flex-1"}>
			{/* Top Hero Articles Section */}
			<HeroArticlesSection articles={heroArticles} />

			{/* Responsive Weather Section (shows data or error UI) */}
			<WeatherSection data={weatherData} error={weatherError} />

			{/* Videos Section reusing VideoComponent */}
			<WeatherVideoSection videos={weatherVideos} />
		</main>
	);
}
