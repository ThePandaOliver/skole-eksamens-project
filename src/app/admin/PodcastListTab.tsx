"use client";

import React, {useMemo, useState} from "react";
import {Podcast, PodcastSkeleton} from "@/component/Podcast";
import {deletePodcast, PodcastItem} from "@/utils/api";
import {
	FaMagnifyingGlass,
	FaPen,
	FaPlus,
	FaSpinner,
	FaTrash,
	FaXmark
} from "react-icons/fa6";
import PodcastForm from "@/app/admin/PodcastForm";

interface PodcastListTabProps {
	podcasts: PodcastItem[];
	isLoading: boolean;
	setSuccessMessage: (message: string | null) => void;
	setError: (message: string | null) => void;
	setActiveTab: (tab: "list" | "create") => void;
	refetchPodcasts?: () => Promise<void> | void;
}

export default function PodcastListTab({
	isLoading,
	setSuccessMessage,
	setError,
	podcasts,
	setActiveTab,
	refetchPodcasts
}: PodcastListTabProps) {
	const [searchQuery, setSearchQuery] = useState("");

	// Edit Modal State
	const [editingPodcast, setEditingPodcast] = useState<PodcastItem | null>(null);

	// Delete Confirmation State
	const [podcastToDelete, setPodcastToDelete] = useState<PodcastItem | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleConfirmDelete() {
		if (!podcastToDelete?._id) return;
		try {
			setIsDeleting(true);
			const res = await deletePodcast(podcastToDelete._id);
			setSuccessMessage(res.message || `Podcast "${podcastToDelete.headline}" blev slettet.`);
			setPodcastToDelete(null);
			if (refetchPodcasts) {
				await refetchPodcasts();
			}
		} catch (err: unknown) {
			console.error("Delete podcast failed:", err);
			const errMsg = err instanceof Error ? err.message : "Kunne ikke slette podcasten.";
			setError(`Fejl ved sletning: ${errMsg}`);
		} finally {
			setIsDeleting(false);
		}
	}

	const filteredPodcasts = useMemo(() => {
		let list = [...podcasts];

		const query = searchQuery.toLowerCase();
		if (query) {
			list = list.filter((item) => {
				const headline = (item.headline || "").toLowerCase();
				const info = (item.info || "").toLowerCase();
				return headline.includes(query) || info.includes(query);
			});
		}

		return list;
	}, [podcasts, searchQuery]);

	return (
		<>
			<section className={"space-y-6"}>
				{/* Search Input */}
				<div className={"relative flex-1"}>
					<input
						type={"search"}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={"Søg..."}
						className={"w-full border-2 border-gray focus:border-black p-2.5 pl-9 outline-none text-black font-medium text-sm transition-colors"}
					/>
					<FaMagnifyingGlass
						className={"absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none"}/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className={"absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer text-sm"}
						>
							<FaXmark/>
						</button>
					)}
				</div>

				{/* Podcasts List */}
				{isLoading ? (
					<div className={"space-y-4"}>
						<article
							className={"bg-white border-2 border-gray flex flex-col md:flex-row gap-5 items-start md:items-center"}
						>
							<PodcastSkeleton className={"border-none"}/>

							{/* Actions */}
							<div
								className={"flex flex-row md:flex-col p-4 gap-2 shrink-0 w-full md:w-auto justify-end animate-pulse"}>
								<div
									className={"w-full md:w-30 h-10 bg-neutral-200"}
								>
								</div>

								<div
									className={"w-full md:w-30 h-10 bg-neutral-200"}
								>
								</div>
							</div>
						</article>
					</div>
				) : filteredPodcasts.length === 0 ? (
					<div className={"bg-white border-2 border-gray p-12 text-center space-y-4"}>
						<p className={"text-xl font-bold text-black"}>
							{searchQuery ? "Ingen podcasts matcher din søgning" : "Der er endnu ingen podcasts"}
						</p>
						<p className={"text-neutral-500 text-sm"}>
							{searchQuery
								? `Prøv at søge efter noget andet end "${searchQuery}".`
								: "Opret din første podcast ved at klikke på knappen nedenfor."}
						</p>
						{!searchQuery && (
							<button
								type={"button"}
								onClick={() => setActiveTab("create")}
								className={"bg-category text-white font-bold px-6 py-2.5 text-sm uppercase hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"}
							>
								<FaPlus/>
								<span>Tilføj podcast</span>
							</button>
						)}
					</div>
				) : (
					<div className={"space-y-4"}>
						{filteredPodcasts.map((podcast) => {
							return (
								<article
									key={podcast._id}
									className={"bg-white border-2 border-gray flex flex-col md:flex-row gap-5 items-start md:items-center"}
								>
									<Podcast podcast={podcast} className={"border-none"}/>

									{/* Actions */}
									<div
										className={"flex flex-row md:flex-col p-4 gap-2 shrink-0 w-full md:w-auto justify-end"}>
										<button
											onClick={() => setEditingPodcast(podcast)}
											className={"flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border-2 border-black bg-white hover:bg-black hover:text-white text-black font-bold px-4 py-2 text-sm transition-colors cursor-pointer"}
										>
											<FaPen className={"text-xs"}/>
											<span>Rediger</span>
										</button>

										<button
											onClick={() => setPodcastToDelete(podcast)}
											className={"flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border-2 border-red-600 bg-white hover:bg-red-600 hover:text-white text-red-600 font-bold px-4 py-2 text-sm transition-colors cursor-pointer"}
										>
											<FaTrash className={"text-xs"}/>
											<span>Slet</span>
										</button>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</section>

			{/* Edit Modal */}
			{editingPodcast && (
				<div
					className={"fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"}>
					<div
						className={"bg-white border-4 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl"}>
						<PodcastForm
							podcast={editingPodcast}
							onCancel={() => setEditingPodcast(null)}
							onSuccess={() => setEditingPodcast(null)}
							setSuccessMessage={setSuccessMessage}
							refetchPodcasts={refetchPodcasts}
							isModal
						/>
					</div>
				</div>
			)}

			{/* Delete Confirmation dialog */}
			{podcastToDelete && (
				<div className={"fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"}>
					<div className={"bg-white border-4 border-red-600 w-full max-w-md p-6 space-y-5 shadow-2xl"}>
						<div className={"flex items-center gap-3 text-red-600"}>
							<FaTrash className={"text-2xl"}/>
							<h3 className={"text-xl font-bold text-black"}>
								Slet podcast?
							</h3>
						</div>

						<p className={"text-neutral-700 text-sm"}>
							Er du sikker på, at du vil slette episoden{" "}
							<span className={"font-bold text-black"}>&quot;{podcastToDelete.headline}&quot;</span>?
							Denne handling kan ikke fortrydes, og tilhørende lyd- og billedfiler fjernes fra serveren.
						</p>

						<div className={"flex items-center justify-end gap-3 pt-3 border-t border-gray"}>
							<button
								onClick={() => setPodcastToDelete(null)}
								disabled={isDeleting}
								className={"border-2 border-black px-5 py-2 font-bold text-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"}
							>
								Annuller
							</button>

							<button
								onClick={handleConfirmDelete}
								disabled={isDeleting}
								className={"bg-red-600 text-white font-bold px-5 py-2 text-sm uppercase hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"}
							>
								{isDeleting ? (
									<>
										<FaSpinner className={"animate-spin text-sm"}/>
										<span>Sletter...</span>
									</>
								) : (
									<>
										<FaTrash className={"text-xs"}/>
										<span>Ja, slet podcast</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
