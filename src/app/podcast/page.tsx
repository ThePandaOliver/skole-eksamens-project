import AsyncPodcast from "@/component/Podcast";
import {getAllPodcast} from "@/api";

export default function Page() {
	const allPodcasts = getAllPodcast();

	return (
		<section className="parent-container space-y-4">
			<AsyncPodcast ids={"682242eae96e5317c911c72c"}/>
			<AsyncPodcast ids={"682242eae96e5317c911c72c"}/>
			<AsyncPodcast podcasts={allPodcasts}/>
		</section>
	)
}