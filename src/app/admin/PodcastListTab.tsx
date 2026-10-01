"use client";

import React, {useMemo, useRef, useState} from "react";
import {getPodcastAssetUrl, Podcast, PodcastItem, PodcastSkeleton} from "@/component/Podcast";
import {formatDateForInput} from "@/app/admin/page";
import {deletePodcast, updatePodcast} from "@/api";
import {
	FaCalendarDays,
	FaClock,
	FaImage,
	FaMagnifyingGlass,
	FaPen,
	FaPlus,
	FaSpinner,
	FaTrash,
	FaXmark
} from "react-icons/fa6";
import Image from "next/image";
import {getAudioDuration, formatDurationToTime} from "@/utils/audio";

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
	const [editHeadline, setEditHeadline] = useState("");
	const [editSubtitle, setEditSubtitle] = useState("");
	const [editContent, setEditContent] = useState<string | null>(null);
	const [editLength, setEditLength] = useState<string>("");
	const [editReleaseDate, setEditReleaseDate] = useState<string>("");
	const [editAudioFile, setEditAudioFile] = useState<File | null>(null);
	const [isCalculatingAudio, setIsCalculatingAudio] = useState(false);
	const [detectedAudioDuration, setDetectedAudioDuration] = useState<number | null>(null);
	const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
	const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
	const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
	const [editFormError, setEditFormError] = useState<string | null>(null);
	const editAudioInputRef = useRef<HTMLInputElement | null>(null);
	const editThumbnailInputRef = useRef<HTMLInputElement | null>(null);

	// Delete Confirmation State
	const [podcastToDelete, setPodcastToDelete] = useState<PodcastItem | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleEditAudioChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0] || null;
		setEditAudioFile(file);
		setDetectedAudioDuration(null);

		if (!file) return;

		try {
			setIsCalculatingAudio(true);
			const durationSeconds = await getAudioDuration(file);
			setDetectedAudioDuration(durationSeconds);
			const minutes = Math.max(1, Math.round(durationSeconds / 60));
			setEditLength(minutes.toString());
		} catch (err) {
			console.error("Kunne ikke beregne lydfilens varighed:", err);
		} finally {
			setIsCalculatingAudio(false);
		}
	}

	function handleEditThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			setEditThumbnailFile(file);
			const previewUrl = URL.createObjectURL(file);
			setEditThumbnailPreview(previewUrl);
		} else {
			setEditThumbnailFile(null);
			setEditThumbnailPreview(null);
		}
	}

	function handleOpenEdit(podcast: PodcastItem) {
		setEditingPodcast(podcast);
		setEditHeadline(podcast.headline || "");
		setEditSubtitle(podcast.subtitle || "");
		setEditContent(podcast.contentText || "");
		setEditLength(podcast.length ? podcast.length.toString() : "30");
		setEditReleaseDate(formatDateForInput(podcast.releaseDate));
		setEditAudioFile(null);
		setIsCalculatingAudio(false);
		setDetectedAudioDuration(null);
		setEditThumbnailFile(null);
		setEditThumbnailPreview(null);
		setEditFormError(null);
	}

	const handleCancelEdit = () => {
		setEditingPodcast(null);
		setEditAudioFile(null);
		setIsCalculatingAudio(false);
		setDetectedAudioDuration(null);
		setEditThumbnailFile(null);
		setEditThumbnailPreview(null);
		setEditFormError(null);
	};

	async function handleEditSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		if (!editingPodcast?._id || isCalculatingAudio) return;

		setEditFormError(null);

		if (!editHeadline.trim()) {
			setEditFormError("Angiv venligst en titel.");
			return;
		}
		if (!editSubtitle.trim()) {
			setEditFormError("Angiv venligst en undertekst.");
			return;
		}
		const lengthNum = parseInt(editLength, 10);
		if (isNaN(lengthNum) || lengthNum <= 0) {
			setEditFormError("Kunne ikke fastslå en gyldig varighed for podcasten.");
			return;
		}
		if (!editReleaseDate) {
			setEditFormError("Angiv venligst en udgivelsesdato.");
			return;
		}

		try {
			setIsSubmittingEdit(true);
			const formData = new FormData();
			formData.append("headline", editHeadline.trim());
			formData.append("subtitle", editSubtitle.trim());
			if (editContent) {
				formData.append("contentText", editContent.trim());
			}
			formData.append("length", lengthNum.toString());
			formData.append("releaseDate", editReleaseDate);

			if (editAudioFile) {
				formData.append("podcast", editAudioFile);
			}
			if (editThumbnailFile) {
				formData.append("thumbnail", editThumbnailFile);
			}

			const res = await updatePodcast(editingPodcast._id, formData);
			setSuccessMessage(res.message || `Podcast "${editHeadline}" blev opdateret!`);
			handleCancelEdit();
			if (refetchPodcasts) {
				await refetchPodcasts();
			}
		} catch (err: unknown) {
			console.error("Update podcast failed:", err);
			const errMsg = err instanceof Error ? err.message : "Der opstod en fejl under opdatering.";
			setEditFormError(`Fejl: ${errMsg}`);
		} finally {
			setIsSubmittingEdit(false);
		}
	}

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
				const info = (item.subtitle || item.contentText || "").toLowerCase();
				return headline.includes(query) || info.includes(query);
			});
		}

		return list;
	}, [podcasts, searchQuery]);

	return (
		<>
			<section className="space-y-6">
				{/* Search Input */}
				<div className="relative flex-1">
					<input
						type="search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Søg..."
						className="w-full border-2 border-gray focus:border-black p-2.5 pl-9 outline-none text-black font-medium text-sm transition-colors"
					/>
					<FaMagnifyingGlass
						className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none"/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer text-sm"
						>
							<FaXmark/>
						</button>
					)}
				</div>

				{/* Podcasts List */}
				{isLoading ? (
					<div className="space-y-4">
						<article
							className="bg-white border-2 border-gray flex flex-col md:flex-row gap-5 items-start md:items-center"
						>
							<PodcastSkeleton className={"border-none"}/>

							{/* Actions */}
							<div
								className="flex flex-row md:flex-col p-4 gap-2 shrink-0 w-full md:w-auto justify-end animate-pulse">
								<div
									className="w-full md:w-30 h-10 bg-neutral-200"
								>
								</div>

								<div
									className="w-full md:w-30 h-10 bg-neutral-200"
								>
								</div>
							</div>
						</article>
					</div>
				) : filteredPodcasts.length === 0 ? (
					<div className="bg-white border-2 border-gray p-12 text-center space-y-4">
						<p className="text-xl font-bold text-black">
							{searchQuery ? "Ingen podcasts matcher din søgning" : "Der er endnu ingen podcasts"}
						</p>
						<p className="text-neutral-500 text-sm">
							{searchQuery
								? `Prøv at søge efter noget andet end "${searchQuery}".`
								: "Opret din første podcast ved at klikke på knappen nedenfor."}
						</p>
						{!searchQuery && (
							<button
								type="button"
								onClick={() => setActiveTab("create")}
								className="bg-category text-white font-bold px-6 py-2.5 text-sm uppercase hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
							>
								<FaPlus/>
								<span>Tilføj podcast</span>
							</button>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{filteredPodcasts.map((podcast) => {
							return (
								<article
									key={podcast._id}
									className="bg-white border-2 border-gray flex flex-col md:flex-row gap-5 items-start md:items-center"
								>
									<Podcast podcast={podcast} className={"border-none"}/>

									{/* Actions */}
									<div
										className="flex flex-row md:flex-col p-4 gap-2 shrink-0 w-full md:w-auto justify-end">
										<button
											onClick={() => handleOpenEdit(podcast)}
											className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border-2 border-black bg-white hover:bg-black hover:text-white text-black font-bold px-4 py-2 text-sm transition-colors cursor-pointer"
										>
											<FaPen className="text-xs"/>
											<span>Rediger</span>
										</button>

										<button
											onClick={() => setPodcastToDelete(podcast)}
											className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border-2 border-red-600 bg-white hover:bg-red-600 hover:text-white text-red-600 font-bold px-4 py-2 text-sm transition-colors cursor-pointer"
										>
											<FaTrash className="text-xs"/>
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
					className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
					<div
						className="bg-white border-4 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
						<div className="flex items-center justify-between border-b-2 border-black pb-4">
							<div>
								<h2 className="text-2xl font-bold text-black mt-1">
									Rediger Podcast
								</h2>
							</div>
							<button
								type="button"
								onClick={handleCancelEdit}
								className="p-2 text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
							>
								<FaXmark className="text-2xl"/>
							</button>
						</div>

						{editFormError && (
							<div className="bg-red-50 border border-red-500 text-red-700 p-3 text-sm font-semibold">
								{editFormError}
							</div>
						)}

						<form onSubmit={handleEditSubmit} className="space-y-5">
							{/* Headline */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Titel <span className="text-category">*</span>
								</label>
								<input
									type="text"
									value={editHeadline}
									onChange={(event) => setEditHeadline(event.target.value)}
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"
								/>
							</div>

							{/* Subtitle */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Undertekst <span className="text-category">*</span>
								</label>
								<input
									type="text"
									value={editSubtitle}
									onChange={(event) => setEditSubtitle(event.target.value)}
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"
								/>
							</div>

							{/* Description */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Beskrivelse
								</label>
								<textarea
									rows={4}
									value={editContent || ""}
									onChange={(event) => setEditContent(event.target.value)}
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white resize-y"
								/>
							</div>

							{/* Release Date */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Udgivelsesdato <span className="text-category">*</span>
								</label>
								<input
									type="date"
									value={editReleaseDate}
									onChange={(event) => setEditReleaseDate(event.target.value)}
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"
								/>
							</div>

							{/* Audio file replace */}
							<div className="border-t border-gray pt-4">
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Lydfil
								</label>
								<p className="text-xs text-neutral-500 mb-2">
									Nuværende lydfil: <code
									className="bg-neutral-100 px-1 py-0.5 border border-gray font-mono">{editingPodcast.podcast || "Ingen"}</code>
									<span className="ml-2 font-semibold text-neutral-700">({editLength} min)</span>
								</p>
								<input
									ref={editAudioInputRef}
									type="file"
									accept="audio/*,.mp3,.wav,.ogg,.m4a"
									onChange={handleEditAudioChange}
									className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-bold file:bg-white file:text-black hover:file:bg-black hover:file:text-white cursor-pointer"
								/>
								{isCalculatingAudio && (
									<p className="text-xs font-semibold text-category mt-2 flex items-center gap-1.5">
										<FaSpinner className="animate-spin text-xs"/>
										<span>Beregner lydfilens varighed automatisk...</span>
									</p>
								)}
								{editAudioFile && !isCalculatingAudio && (
									<div className="mt-2 space-y-1">
										<p className="text-xs font-semibold text-category">
											Ny lydfil valgt: {editAudioFile.name} (erstatter den gamle ved gem)
										</p>
										{detectedAudioDuration !== null && (
											<p className="text-xs text-neutral-600">
												Automatisk beregnet: <span className="font-bold text-black">{formatDurationToTime(detectedAudioDuration)}</span> ({editLength} min)
											</p>
										)}
									</div>
								)}
							</div>

							{/* Thumbnail replace */}
							<div className="border-t border-gray pt-4">
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Thumbnail
								</label>
								<div className="flex items-center gap-4 mb-2">
									{editThumbnailPreview ? (
										<div className="relative size-16 border border-gray overflow-hidden">
											<Image
												src={editThumbnailPreview}
												alt="New Preview"
												fill
												className="object-cover"
											/>
										</div>
									) : editingPodcast.thumbnail ? (
										<div className="relative size-16 border border-gray overflow-hidden">
											<Image
												src={getPodcastAssetUrl(editingPodcast.thumbnail)}
												alt="Current Preview"
												fill
												className="object-cover"
											/>
										</div>
									) : (
										<div
											className="size-16 bg-neutral-100 border border-gray flex items-center justify-center text-xs text-neutral-400 font-bold uppercase text-center">
											Ingen
										</div>
									)}
									<div className="flex-1">
										<p className="text-xs text-neutral-500 mb-1">
											Nuværende billede: <code
											className="bg-neutral-100 px-1 py-0.5 border border-gray font-mono">{editingPodcast.thumbnail || "Intet"}</code>
										</p>
										<input
											ref={editThumbnailInputRef}
											type="file"
											accept="image/*,.jpg,.jpeg,.png,.webp"
											onChange={handleEditThumbnailChange}
											className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-bold file:bg-white file:text-black hover:file:bg-black hover:file:text-white cursor-pointer"
										/>
									</div>
								</div>
								{editThumbnailFile && (
									<p className="text-xs font-semibold text-category mt-1">
										Nyt billede valgt: {editThumbnailFile.name} (erstatter det gamle ved gem)
									</p>
								)}
							</div>

							{/* Modal Actions */}
							<div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
								<button
									onClick={handleCancelEdit}
									disabled={isSubmittingEdit || isCalculatingAudio}
									className="border-2 border-black px-6 py-2.5 font-bold text-sm text-black hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
								>
									Annuller
								</button>
								<button
									type="submit"
									disabled={isSubmittingEdit || isCalculatingAudio}
									className="bg-category text-white font-bold px-6 py-2.5 text-sm uppercase hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
								>
									{isSubmittingEdit ? (
										<>
											<FaSpinner className="animate-spin text-sm"/>
											<span>Gemmer ændringer...</span>
										</>
									) : isCalculatingAudio ? (
										<>
											<FaSpinner className="animate-spin text-sm"/>
											<span>Beregner varighed...</span>
										</>
									) : (
										<span>Gem ændringer</span>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation dialog */}
			{podcastToDelete && (
				<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white border-4 border-red-600 w-full max-w-md p-6 space-y-5 shadow-2xl">
						<div className="flex items-center gap-3 text-red-600">
							<FaTrash className="text-2xl"/>
							<h3 className="text-xl font-bold text-black">
								Slet podcast?
							</h3>
						</div>

						<p className="text-neutral-700 text-sm">
							Er du sikker på, at du vil slette episoden{" "}
							<span className="font-bold text-black">&quot;{podcastToDelete.headline}&quot;</span>?
							Denne handling kan ikke fortrydes, og tilhørende lyd- og billedfiler fjernes fra serveren.
						</p>

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-gray">
							<button
								onClick={() => setPodcastToDelete(null)}
								disabled={isDeleting}
								className="border-2 border-black px-5 py-2 font-bold text-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
							>
								Annuller
							</button>

							<button
								onClick={handleConfirmDelete}
								disabled={isDeleting}
								className="bg-red-600 text-white font-bold px-5 py-2 text-sm uppercase hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
							>
								{isDeleting ? (
									<>
										<FaSpinner className="animate-spin text-sm"/>
										<span>Sletter...</span>
									</>
								) : (
									<>
										<FaTrash className="text-xs"/>
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
