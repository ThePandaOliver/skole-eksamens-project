"use client";

import React, {useState, useEffect, useMemo, useRef, useCallback} from "react";
import Link from "next/link";
import Image from "next/image";
import {
	FaPlus,
	FaPen,
	FaTrash,
	FaMagnifyingGlass,
	FaArrowUpRightFromSquare,
	FaSpinner,
	FaCircleCheck,
	FaCircleExclamation,
	FaXmark,
	FaMusic,
	FaImage,
	FaClock,
	FaCalendarDays,
	FaRotateRight,
} from "react-icons/fa6";
import {PodcastItem, getPodcastAssetUrl} from "@/component/Podcast";
import {getAllPodcast, addPodcast, updatePodcast, deletePodcast} from "@/api";

function formatDateForInput(dateString?: string): string {
	if (!dateString) return new Date().toISOString().split("T")[0];
	try {
		const d = new Date(dateString);
		if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
		return d.toISOString().split("T")[0];
	} catch {
		return new Date().toISOString().split("T")[0];
	}
}

function formatDateForDisplay(dateString?: string): string {
	if (!dateString) return "-";
	try {
		const d = new Date(dateString);
		if (isNaN(d.getTime())) return dateString;
		return d.toLocaleDateString("da-DK", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
}

export default function AdminPodcastManager() {
	const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Search & Sorting
	const [searchQuery, setSearchQuery] = useState("");

	// Active tab / section view
	const [activeTab, setActiveTab] = useState<"list" | "create">("list");

	// Create Form State
	const [createHeadline, setCreateHeadline] = useState("");
	const [createInfo, setCreateInfo] = useState("");
	const [createLength, setCreateLength] = useState<string>("30");
	const [createReleaseDate, setCreateReleaseDate] = useState<string>(formatDateForInput());
	const [createAudioFile, setCreateAudioFile] = useState<File | null>(null);
	const [createThumbnailFile, setCreateThumbnailFile] = useState<File | null>(null);
	const [createThumbnailPreview, setCreateThumbnailPreview] = useState<string | null>(null);
	const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
	const [createFormError, setCreateFormError] = useState<string | null>(null);
	const createAudioInputRef = useRef<HTMLInputElement | null>(null);
	const createThumbnailInputRef = useRef<HTMLInputElement | null>(null);

	// Edit Modal State
	const [editingPodcast, setEditingPodcast] = useState<PodcastItem | null>(null);
	const [editHeadline, setEditHeadline] = useState("");
	const [editInfo, setEditInfo] = useState("");
	const [editLength, setEditLength] = useState<string>("");
	const [editReleaseDate, setEditReleaseDate] = useState<string>("");
	const [editAudioFile, setEditAudioFile] = useState<File | null>(null);
	const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
	const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
	const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
	const [editFormError, setEditFormError] = useState<string | null>(null);
	const editAudioInputRef = useRef<HTMLInputElement | null>(null);
	const editThumbnailInputRef = useRef<HTMLInputElement | null>(null);

	// Delete Confirmation State
	const [podcastToDelete, setPodcastToDelete] = useState<PodcastItem | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Load Podcasts for manual refresh or post-actions
	const refreshPodcasts = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await getAllPodcast();
			setPodcasts(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Failed to load podcasts:", err);
			setError("Kunne ikke hente podcasts fra serveren. Kontroller at API-serveren kører på http://localhost:3001.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Initial load
	useEffect(() => {
		let isMounted = true;
		getAllPodcast()
			.then((data) => {
				if (isMounted) {
					setPodcasts(Array.isArray(data) ? data : []);
					setIsLoading(false);
				}
			})
			.catch((err) => {
				if (isMounted) {
					console.error("Failed to load podcasts:", err);
					setError("Kunne ikke hente podcasts fra serveren. Kontroller at API-serveren kører på http://localhost:3001.");
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	// Handle Thumbnail Preview for Create
	const handleCreateThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setCreateThumbnailFile(file);
			const previewUrl = URL.createObjectURL(file);
			setCreateThumbnailPreview(previewUrl);
		} else {
			setCreateThumbnailFile(null);
			setCreateThumbnailPreview(null);
		}
	};

	// Handle Thumbnail Preview for Edit
	const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setEditThumbnailFile(file);
			const previewUrl = URL.createObjectURL(file);
			setEditThumbnailPreview(previewUrl);
		} else {
			setEditThumbnailFile(null);
			setEditThumbnailPreview(null);
		}
	};

	// Reset Create Form
	const resetCreateForm = () => {
		setCreateHeadline("");
		setCreateInfo("");
		setCreateLength("30");
		setCreateReleaseDate(formatDateForInput());
		setCreateAudioFile(null);
		setCreateThumbnailFile(null);
		setCreateThumbnailPreview(null);
		setCreateFormError(null);
		if (createAudioInputRef.current) createAudioInputRef.current.value = "";
		if (createThumbnailInputRef.current) createThumbnailInputRef.current.value = "";
	};

	// Submit Create Form
	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreateFormError(null);

		if (!createHeadline.trim()) {
			setCreateFormError("Angiv venligst en overskrift / titel.");
			return;
		}
		if (!createInfo.trim()) {
			setCreateFormError("Angiv venligst en beskrivelse / info.");
			return;
		}
		const lengthNum = parseInt(createLength, 10);
		if (isNaN(lengthNum) || lengthNum <= 0) {
			setCreateFormError("Varighed skal være et positivt tal i minutter.");
			return;
		}
		if (!createReleaseDate) {
			setCreateFormError("Angiv venligst en udgivelsesdato.");
			return;
		}
		if (!createAudioFile) {
			setCreateFormError("Vælg venligst en podcast-lydfil (.mp3).");
			return;
		}

		try {
			setIsSubmittingCreate(true);
			const formData = new FormData();
			formData.append("headline", createHeadline.trim());
			formData.append("info", createInfo.trim());
			formData.append("subtitle", createInfo.trim());
			formData.append("contentText", createInfo.trim());
			formData.append("length", lengthNum.toString());
			formData.append("releaseDate", createReleaseDate);
			formData.append("podcast", createAudioFile);
			if (createThumbnailFile) {
				formData.append("thumbnail", createThumbnailFile);
			}

			const res = await addPodcast(formData);
			setSuccessMessage(res.message || `Podcast "${createHeadline}" blev oprettet med succes!`);
			resetCreateForm();
			setActiveTab("list");
			await refreshPodcasts();
		} catch (err: unknown) {
			console.error("Create podcast failed:", err);
			const errMsg = err instanceof Error ? err.message : "Der opstod en fejl under upload af podcasten.";
			setCreateFormError(`Fejl: ${errMsg}`);
		} finally {
			setIsSubmittingCreate(false);
		}
	};

	// Start Edit Podcast
	const handleOpenEdit = (podcast: PodcastItem) => {
		setEditingPodcast(podcast);
		setEditHeadline(podcast.headline || "");
		setEditInfo(podcast.info || podcast.subtitle || podcast.contentText || "");
		setEditLength(podcast.length ? podcast.length.toString() : "30");
		setEditReleaseDate(formatDateForInput(podcast.releaseDate));
		setEditAudioFile(null);
		setEditThumbnailFile(null);
		setEditThumbnailPreview(null);
		setEditFormError(null);
	};

	// Cancel Edit
	const handleCancelEdit = () => {
		setEditingPodcast(null);
		setEditAudioFile(null);
		setEditThumbnailFile(null);
		setEditThumbnailPreview(null);
		setEditFormError(null);
	};

	// Submit Edit Form
	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingPodcast?._id) return;

		setEditFormError(null);

		if (!editHeadline.trim()) {
			setEditFormError("Angiv venligst en overskrift / titel.");
			return;
		}
		if (!editInfo.trim()) {
			setEditFormError("Angiv venligst en beskrivelse / info.");
			return;
		}
		const lengthNum = parseInt(editLength, 10);
		if (isNaN(lengthNum) || lengthNum <= 0) {
			setEditFormError("Varighed skal være et positivt tal i minutter.");
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
			formData.append("info", editInfo.trim());
			formData.append("subtitle", editInfo.trim());
			formData.append("contentText", editInfo.trim());
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
			await refreshPodcasts();
		} catch (err: unknown) {
			console.error("Update podcast failed:", err);
			const errMsg = err instanceof Error ? err.message : "Der opstod en fejl under opdatering.";
			setEditFormError(`Fejl: ${errMsg}`);
		} finally {
			setIsSubmittingEdit(false);
		}
	};

	// Confirm & Execute Delete
	const handleConfirmDelete = async () => {
		if (!podcastToDelete?._id) return;
		try {
			setIsDeleting(true);
			const res = await deletePodcast(podcastToDelete._id);
			setSuccessMessage(res.message || `Podcast "${podcastToDelete.headline}" blev slettet.`);
			setPodcastToDelete(null);
			await refreshPodcasts();
		} catch (err: unknown) {
			console.error("Delete podcast failed:", err);
			const errMsg = err instanceof Error ? err.message : "Kunne ikke slette podcasten.";
			setError(`Fejl ved sletning: ${errMsg}`);
		} finally {
			setIsDeleting(false);
		}
	};

	// Filter Podcasts
	const filteredPodcasts = useMemo(() => {
		let list = [...podcasts];

		const query = searchQuery.toLowerCase();
		if (query) {
			list = list.filter((item) => {
				const headline = (item.headline || "").toLowerCase();
				const info = (item.info || item.subtitle || item.contentText || "").toLowerCase();
				return headline.includes(query) || info.includes(query);
			});
		}

		return list;
	}, [podcasts, searchQuery]);

	return (
		<main className="parent-container space-y-8 flex-1">
			{/* Top Header Card */}
			<section className="bg-black text-white p-6 border-b-4 border-category">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="bg-category text-white text-xs px-2 py-0.5 font-bold uppercase tracking-wider">
								Administration
							</span>
							<span className="text-gray text-xs">
								• {podcasts.length} {podcasts.length === 1 ? "podcast" : "podcasts"} i alt
							</span>
						</div>
						<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
							Podcast Administration
						</h1>
						<p className="text-gray text-sm md:text-base mt-1">
							Upload nye episoder, opdater oplysninger og håndter eksisterende podcasts.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<Link
							href="/podcast"
							target="_blank"
							className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-black font-semibold px-4 py-2 text-sm transition-colors cursor-pointer"
						>
							<span>Se podcasts live</span>
							<FaArrowUpRightFromSquare className="text-xs" />
						</Link>

						<button
							type="button"
							onClick={refreshPodcasts}
							disabled={isLoading}
							title="Genindlæs liste"
							className="p-2.5 border-2 border-white text-white hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50"
						>
							<FaRotateRight className={isLoading ? "animate-spin" : ""} />
						</button>
					</div>
				</div>
			</section>

			{/* Notification Banners */}
			{successMessage && (
				<div className="bg-neutral-900 border-2 border-category text-white p-4 flex items-center justify-between gap-3 animate-in fade-in">
					<div className="flex items-center gap-3">
						<FaCircleCheck className="text-category text-xl shrink-0" />
						<p className="text-sm md:text-base font-semibold">{successMessage}</p>
					</div>
					<button
						type="button"
						onClick={() => setSuccessMessage(null)}
						className="p-1 text-gray hover:text-white transition-colors cursor-pointer"
					>
						<FaXmark className="text-lg" />
					</button>
				</div>
			)}

			{error && (
				<div className="bg-red-50 border-2 border-red-600 text-red-900 p-4 flex items-center justify-between gap-3 animate-in fade-in">
					<div className="flex items-center gap-3">
						<FaCircleExclamation className="text-red-600 text-xl shrink-0" />
						<p className="text-sm md:text-base font-medium">{error}</p>
					</div>
					<button
						type="button"
						onClick={() => setError(null)}
						className="p-1 text-red-600 hover:text-red-900 transition-colors cursor-pointer"
					>
						<FaXmark className="text-lg" />
					</button>
				</div>
			)}

			{/* Navigation Tabs (List vs Create) */}
			<section className="flex border-b-2 border-black gap-2">
				<button
					type="button"
					onClick={() => setActiveTab("list")}
					className={`px-5 py-3 font-bold text-sm md:text-base transition-colors cursor-pointer ${
						activeTab === "list"
							? "bg-black text-white"
							: "bg-neutral-100 text-black hover:bg-neutral-200"
					}`}
				>
					Alle podcasts ({podcasts.length})
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("create")}
					className={`px-5 py-3 font-bold text-sm md:text-base flex items-center gap-2 transition-colors cursor-pointer ${
						activeTab === "create"
							? "bg-category text-white"
							: "bg-neutral-100 text-black hover:bg-neutral-200"
					}`}
				>
					<FaPlus className="text-xs" />
					<span>Tilføj ny podcast</span>
				</button>
			</section>

			{/* TAB 1: CREATE PODCAST FORM */}
			{activeTab === "create" && (
				<section className="bg-white border-2 border-black p-6 md:p-8 space-y-6">
					<div className="border-b border-gray pb-4">
						<h2 className="text-2xl font-bold text-black flex items-center gap-2">
							<span className="w-3 h-3 bg-category inline-block" />
							Opret og upload ny podcast
						</h2>
						<p className="text-neutral-600 text-sm mt-1">
							Udfyld felterne nedenfor for at udgive en ny podcast på sitet. Lydfilen (.mp3) gemmes direkte på serveren.
						</p>
					</div>

					{createFormError && (
						<div className="bg-red-50 border border-red-500 text-red-700 p-3 text-sm font-semibold">
							{createFormError}
						</div>
					)}

					<form onSubmit={handleCreateSubmit} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Headline */}
							<div className="md:col-span-2">
								<label className="block text-sm font-bold text-black uppercase mb-1.5">
									Overskrift / Titel <span className="text-category">*</span>
								</label>
								<input
									type="text"
									value={createHeadline}
									onChange={(e) => setCreateHeadline(e.target.value)}
									placeholder="F.eks. Fremtidens Kunstig Intelligens"
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"
								/>
							</div>

							{/* Description / Info */}
							<div className="md:col-span-2">
								<label className="block text-sm font-bold text-black uppercase mb-1.5">
									Beskrivelse / Opsummering <span className="text-category">*</span>
								</label>
								<textarea
									rows={4}
									value={createInfo}
									onChange={(e) => setCreateInfo(e.target.value)}
									placeholder="Kort beskrivelse af podcastens indhold og emne..."
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white resize-y"
								/>
							</div>

							{/* Length in minutes */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1.5">
									Varighed i minutter <span className="text-category">*</span>
								</label>
								<div className="relative flex items-center">
									<input
										type="number"
										min="1"
										value={createLength}
										onChange={(e) => setCreateLength(e.target.value)}
										placeholder="30"
										required
										className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white pr-16"
									/>
									<span className="absolute right-4 text-xs font-bold text-neutral-500 uppercase pointer-events-none">
										Minutter
									</span>
								</div>
							</div>

							{/* Release Date */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1.5">
									Udgivelsesdato <span className="text-category">*</span>
								</label>
								<input
									type="date"
									value={createReleaseDate}
									onChange={(e) => setCreateReleaseDate(e.target.value)}
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"
								/>
							</div>

							{/* Audio File Input */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1.5">
									Lydfil (MP3 / Audio) <span className="text-category">*</span>
								</label>
								<div className="border-2 border-dashed border-gray p-4 bg-neutral-50 text-center hover:border-black transition-colors">
									<input
										ref={createAudioInputRef}
										type="file"
										accept="audio/*,.mp3,.wav,.ogg,.m4a"
										required
										onChange={(e) => setCreateAudioFile(e.target.files?.[0] || null)}
										className="hidden"
										id="create-audio-upload"
									/>
									<label
										htmlFor="create-audio-upload"
										className="cursor-pointer flex flex-col items-center justify-center gap-2"
									>
										<FaMusic className="text-2xl text-neutral-500" />
										<span className="text-sm font-bold text-black underline">
											{createAudioFile ? "Skift lydfil" : "Vælg lydfil fra computer"}
										</span>
										<span className="text-xs text-neutral-500">
											{createAudioFile
												? `${createAudioFile.name} (${(createAudioFile.size / (1024 * 1024)).toFixed(2)} MB)`
												: "Tilladte formater: .mp3, .wav, .m4a (maks 50MB)"}
										</span>
									</label>

									{/* Audio Preview if selected */}
									{createAudioFile && (
										<div className="mt-3 pt-3 border-t border-gray/40">
											<audio
												controls
												src={URL.createObjectURL(createAudioFile)}
												className="w-full h-8"
											/>
										</div>
									)}
								</div>
							</div>

							{/* Thumbnail File Input */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1.5">
									Coverbillede / Thumbnail (Valgfri)
								</label>
								<div className="border-2 border-dashed border-gray p-4 bg-neutral-50 text-center hover:border-black transition-colors">
									<input
										ref={createThumbnailInputRef}
										type="file"
										accept="image/*,.jpg,.jpeg,.png,.webp"
										onChange={handleCreateThumbnailChange}
										className="hidden"
										id="create-thumbnail-upload"
									/>
									<label
										htmlFor="create-thumbnail-upload"
										className="cursor-pointer flex flex-col items-center justify-center gap-2"
									>
										{createThumbnailPreview ? (
											<div className="relative size-24 border border-gray overflow-hidden">
												<Image
													src={createThumbnailPreview}
													alt="Preview"
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<FaImage className="text-2xl text-neutral-500" />
										)}
										<span className="text-sm font-bold text-black underline">
											{createThumbnailFile ? "Skift billede" : "Vælg coverbillede fra computer"}
										</span>
										<span className="text-xs text-neutral-500">
											{createThumbnailFile
												? `${createThumbnailFile.name}`
												: "Tilladte formater: .jpg, .png, .webp"}
										</span>
									</label>
								</div>
							</div>
						</div>

						{/* Form Actions */}
						<div className="flex items-center gap-4 pt-4 border-t border-gray">
							<button
								type="submit"
								disabled={isSubmittingCreate}
								className="bg-category text-white font-bold px-8 py-3 uppercase tracking-wider text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
							>
								{isSubmittingCreate ? (
									<>
										<FaSpinner className="animate-spin text-sm" />
										<span>Uploader...</span>
									</>
								) : (
									<>
										<FaPlus className="text-xs" />
										<span>Udgiv podcast</span>
									</>
								)}
							</button>

							<button
								type="button"
								onClick={resetCreateForm}
								disabled={isSubmittingCreate}
								className="border-2 border-black text-black font-bold px-6 py-3 uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50"
							>
								Ryd felter
							</button>

							<button
								type="button"
								onClick={() => setActiveTab("list")}
								className="text-neutral-600 hover:text-black font-semibold text-sm underline ml-auto cursor-pointer"
							>
								Tilbage til oversigt
							</button>
						</div>
					</form>
				</section>
			)}

			{/* TAB 2: PODCAST LIST VIEW */}
			{activeTab === "list" && (
				<section className="space-y-6">
					{/* Search, Filter & Count Bar */}
					<div className="bg-white border-2 border-gray p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
						{/* Search Input */}
						<div className="relative flex-1">
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Søg i podcasts (overskrift eller info)..."
								className="w-full border-2 border-gray focus:border-black p-2.5 pl-9 outline-none text-black font-medium text-sm transition-colors"
							/>
							<FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer text-sm"
								>
									<FaXmark />
								</button>
							)}
						</div>
					</div>

					{/* Podcasts List */}
					{isLoading ? (
						<div className="bg-white border-2 border-gray p-12 text-center space-y-3">
							<FaSpinner className="animate-spin text-3xl mx-auto text-category" />
							<p className="text-neutral-600 font-semibold">Henter podcasts fra serveren...</p>
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
							{searchQuery ? (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="border-2 border-black px-4 py-2 font-bold text-sm hover:bg-black hover:text-white transition-colors cursor-pointer"
								>
									Nulstil søgning
								</button>
							) : (
								<button
									type="button"
									onClick={() => setActiveTab("create")}
									className="bg-category text-white font-bold px-6 py-2.5 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
								>
									<FaPlus />
									<span>Tilføj podcast</span>
								</button>
							)}
						</div>
					) : (
						<div className="space-y-4">
							{filteredPodcasts.map((podcast) => {
								const thumbnailSrc = podcast.thumbnail ? getPodcastAssetUrl(podcast.thumbnail) : "";
								const audioSrc = podcast.podcast ? getPodcastAssetUrl(podcast.podcast) : "";
								const description = podcast.info || podcast.subtitle || podcast.contentText || "";

								return (
									<article
										key={podcast._id}
										className="bg-white border-2 border-gray hover:border-black transition-colors p-4 md:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center"
									>
										{/* Cover Thumbnail */}
										<div className="relative size-24 md:size-28 shrink-0 bg-neutral-100 border border-gray overflow-hidden self-center md:self-auto">
											{thumbnailSrc ? (
												<Image
													src={thumbnailSrc}
													alt={podcast.headline}
													fill
													className="object-cover"
												/>
											) : (
												<div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-neutral-400">
													<FaImage className="text-xl mb-1" />
													<span className="text-[10px] font-bold uppercase">Intet billede</span>
												</div>
											)}
										</div>

										{/* Content Info */}
										<div className="flex-1 min-w-0 space-y-2">
											<div className="flex flex-wrap items-center gap-2">
												<span className="bg-black text-white text-xs font-bold px-2 py-0.5">
													ID: {podcast._id?.slice(-6)}
												</span>
												<span className="flex items-center gap-1 text-xs text-neutral-600 font-medium">
													<FaCalendarDays className="text-[11px]" />
													{formatDateForDisplay(podcast.releaseDate)}
												</span>
												<span className="flex items-center gap-1 text-xs text-neutral-600 font-medium">
													<FaClock className="text-[11px]" />
													{podcast.length} min
												</span>
											</div>

											<h3 className="text-xl font-bold text-black truncate" title={podcast.headline}>
												{podcast.headline}
											</h3>

											<p className="text-sm text-neutral-600 line-clamp-2" title={description}>
												{description || "Ingen beskrivelse angivet."}
											</p>

											{/* Audio Preview Bar */}
											{audioSrc && (
												<div className="pt-2">
													<audio
														controls
														src={audioSrc}
														preload="none"
														className="w-full max-w-md h-8"
													/>
												</div>
											)}
										</div>

										{/* Actions */}
										<div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto justify-end">
											<button
												type="button"
												onClick={() => handleOpenEdit(podcast)}
												className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border-2 border-black bg-white hover:bg-black hover:text-white text-black font-bold px-4 py-2 text-sm transition-colors cursor-pointer"
											>
												<FaPen className="text-xs" />
												<span>Rediger</span>
											</button>

											<button
												type="button"
												onClick={() => setPodcastToDelete(podcast)}
												className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border-2 border-red-600 bg-white hover:bg-red-600 hover:text-white text-red-600 font-bold px-4 py-2 text-sm transition-colors cursor-pointer"
											>
												<FaTrash className="text-xs" />
												<span>Slet</span>
											</button>
										</div>
									</article>
								);
							})}
						</div>
					)}
				</section>
			)}

			{/* EDIT MODAL */}
			{editingPodcast && (
				<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
					<div className="bg-white border-4 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
						<div className="flex items-center justify-between border-b-2 border-black pb-4">
							<div>
								<span className="bg-category text-white text-xs px-2 py-0.5 font-bold uppercase">
									Rediger episode
								</span>
								<h2 className="text-2xl font-bold text-black mt-1">
									Rediger Podcast
								</h2>
							</div>
							<button
								type="button"
								onClick={handleCancelEdit}
								className="p-2 text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
							>
								<FaXmark className="text-2xl" />
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
									Overskrift / Titel <span className="text-category">*</span>
								</label>
								<input
									type="text"
									value={editHeadline}
									onChange={(e) => setEditHeadline(e.target.value)}
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"
								/>
							</div>

							{/* Info / Description */}
							<div>
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Beskrivelse / Info <span className="text-category">*</span>
								</label>
								<textarea
									rows={4}
									value={editInfo}
									onChange={(e) => setEditInfo(e.target.value)}
									required
									className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white resize-y"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Length */}
								<div>
									<label className="block text-sm font-bold text-black uppercase mb-1">
										Varighed (minutter) <span className="text-category">*</span>
									</label>
									<input
										type="number"
										min="1"
										value={editLength}
										onChange={(e) => setEditLength(e.target.value)}
										required
										className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"
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
										onChange={(e) => setEditReleaseDate(e.target.value)}
										required
										className="w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"
									/>
								</div>
							</div>

							{/* Audio file replace */}
							<div className="border-t border-gray pt-4">
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Lydfil
								</label>
								<p className="text-xs text-neutral-500 mb-2">
									Nuværende lydfil: <code className="bg-neutral-100 px-1 py-0.5 border border-gray font-mono">{editingPodcast.podcast || "Ingen"}</code>
								</p>
								<input
									ref={editAudioInputRef}
									type="file"
									accept="audio/*,.mp3,.wav,.ogg,.m4a"
									onChange={(e) => setEditAudioFile(e.target.files?.[0] || null)}
									className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-bold file:bg-white file:text-black hover:file:bg-black hover:file:text-white cursor-pointer"
								/>
								{editAudioFile && (
									<p className="text-xs font-semibold text-category mt-1">
										Ny lydfil valgt: {editAudioFile.name} (erstatter den gamle ved gem)
									</p>
								)}
							</div>

							{/* Thumbnail replace */}
							<div className="border-t border-gray pt-4">
								<label className="block text-sm font-bold text-black uppercase mb-1">
									Coverbillede / Thumbnail
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
										<div className="size-16 bg-neutral-100 border border-gray flex items-center justify-center text-[10px] text-neutral-400 font-bold uppercase text-center">
											Ingen
										</div>
									)}
									<div className="flex-1">
										<p className="text-xs text-neutral-500 mb-1">
											Nuværende billede: <code className="bg-neutral-100 px-1 py-0.5 border border-gray font-mono">{editingPodcast.thumbnail || "Intet"}</code>
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
									type="button"
									onClick={handleCancelEdit}
									disabled={isSubmittingEdit}
									className="border-2 border-black px-6 py-2.5 font-bold text-sm text-black hover:bg-neutral-100 transition-colors cursor-pointer"
								>
									Annuller
								</button>
								<button
									type="submit"
									disabled={isSubmittingEdit}
									className="bg-category text-white font-bold px-6 py-2.5 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
								>
									{isSubmittingEdit ? (
										<>
											<FaSpinner className="animate-spin text-sm" />
											<span>Gemmer ændringer...</span>
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

			{/* DELETE CONFIRMATION DIALOG */}
			{podcastToDelete && (
				<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white border-4 border-red-600 w-full max-w-md p-6 space-y-5 shadow-2xl">
						<div className="flex items-center gap-3 text-red-600">
							<FaTrash className="text-2xl" />
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
								type="button"
								onClick={() => setPodcastToDelete(null)}
								disabled={isDeleting}
								className="border-2 border-black px-5 py-2 font-bold text-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
							>
								Annuller
							</button>

							<button
								type="button"
								onClick={handleConfirmDelete}
								disabled={isDeleting}
								className="bg-red-600 text-white font-bold px-5 py-2 text-sm uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
							>
								{isDeleting ? (
									<>
										<FaSpinner className="animate-spin text-sm" />
										<span>Sletter...</span>
									</>
								) : (
									<>
										<FaTrash className="text-xs" />
										<span>Ja, slet podcast</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
