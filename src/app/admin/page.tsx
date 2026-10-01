"use client";
import {FaCircleCheck, FaCircleExclamation, FaPlus, FaXmark} from "react-icons/fa6";
import React, {useEffect, useState} from "react";
import {getAllPodcast, PodcastItem} from "@/api";
import {cn} from "tailwind-variants";
import PodcastCreateTab from "@/app/admin/PodcastCreateTab";
import PodcastListTab from "@/app/admin/PodcastListTab";

export function formatDateForInput(dateString?: string): string {
	if (!dateString) return new Date().toISOString().split("T")[0];
	try {
		const d = new Date(dateString);
		if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
		return d.toISOString().split("T")[0];
	} catch {
		return new Date().toISOString().split("T")[0];
	}
}

export default function AdminPage() {
	const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const [activeTab, setActiveTab] = useState<"list" | "create">("list");

	const refetchPodcasts = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await getAllPodcast();
			setPodcasts(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Failed to load podcasts:", err);
			setError("Kunne ikke hente podcasts.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		refetchPodcasts();
	}, []);

	return (
		<main className="parent-container space-y-8 flex-1">
			{/* Notification Banners */}
			{successMessage && (
				<div
					className={"bg-neutral-900 border-2 border-category text-white p-4 flex items-center justify-between gap-3"}>
					<div className="flex items-center gap-3">
						<FaCircleCheck className="text-category text-xl shrink-0"/>
						<p className="text-sm md:text-base font-semibold">{successMessage}</p>
					</div>
					<button
						onClick={() => setSuccessMessage(null)}
						className="p-1 text-gray hover:text-white transition-colors cursor-pointer"
					>
						<FaXmark className="text-lg"/>
					</button>
				</div>
			)}

			{error && (
				<div
					className="bg-red-50 border-2 border-red-600 text-red-900 p-4 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<FaCircleExclamation className="text-red-600 text-xl shrink-0"/>
						<p className="text-sm md:text-base font-medium">{error}</p>
					</div>
					<button
						onClick={() => setError(null)}
						className="p-1 text-red-600 hover:text-red-900 transition-colors cursor-pointer"
					>
						<FaXmark className="text-lg"/>
					</button>
				</div>
			)}


			{/* Tabs */}
			<section className="flex border-b-2 border-black gap-2">
				<button
					onClick={() => setActiveTab("list")}
					className={cn(
						"px-5 py-3 font-bold text-sm md:text-base transition-colors cursor-pointer",
						activeTab === "list"
							? "bg-black text-white"
							: "bg-neutral-100 text-black hover:bg-neutral-200"
					)}
				>
					Alle podcasts ({podcasts.length})
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("create")}
					className={cn("px-5 py-3 font-bold text-sm md:text-base flex items-center gap-2 transition-colors cursor-pointer",
						activeTab === "create"
							? "bg-category text-white"
							: "bg-neutral-100 text-black hover:bg-neutral-200"
					)}
				>
					<FaPlus className="text-xs"/>
					<span>Tilføj ny podcast</span>
				</button>
			</section>

			{activeTab === "create" && (
				<PodcastCreateTab
					setSuccessMessage={setSuccessMessage}
					setActiveTab={setActiveTab}
					refetchPodcasts={refetchPodcasts}
				/>
			)}

			{activeTab === "list" && (
				<PodcastListTab
					isLoading={isLoading}
					podcasts={podcasts}
					setActiveTab={setActiveTab}
					setError={setError}
					setSuccessMessage={setSuccessMessage}
					refetchPodcasts={refetchPodcasts}
				/>
			)}
		</main>
	);
}
