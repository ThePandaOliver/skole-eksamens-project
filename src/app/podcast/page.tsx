import {Podcast} from "@/component/Podcast";
import {getAllPodcast} from "@/api";
import Image from "next/image";

export default async function Page() {
	const allPodcasts = await getAllPodcast();

	return (
		<main className={"parent-container space-y-10 flex-1"}>
			<section className={"relative w-full aspect-video"}>
				<Image src={"http://localhost:3001/assets/images/podcast_1.jpg"} alt={"Podcaster"} fill/>
				<div className={"absolute bottom-0 lg:bottom-6 lg:right-6 w-full lg:w-100 lg:h-60 bg-category p-4"}>
					<h1 className={"text-white font-bold text-base sm:text-xl md:text-3xl text-center lg:text-left"}>
						Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut.
					</h1>
				</div>
			</section>
			<section className={"space-y-6"}>
				{
					allPodcasts.map((podcast) => <Podcast key={podcast._id} podcast={podcast}/>)
				}
			</section>
		</main>
	);
}
