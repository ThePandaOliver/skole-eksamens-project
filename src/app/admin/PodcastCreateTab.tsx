"use client";
import React, {useRef, useState} from "react";
import {formatDateForInput} from "@/app/admin/page";
import {addPodcast} from "@/api";
import Image from "next/image";
import {FaImage, FaMusic, FaPlus, FaSpinner} from "react-icons/fa6";
import {formatDurationToTime, getAudioDuration} from "@/utils/audio";

interface PodcastCreateTabProps {
	setSuccessMessage: (message: string | null) => void;
	setActiveTab: (tab: "list" | "create") => void;
	refetchPodcasts: () => Promise<void> | void;
}

export default function PodcastCreateTab({setSuccessMessage, setActiveTab, refetchPodcasts}: PodcastCreateTabProps) {
	// Create Form State
	const [createHeadline, setCreateHeadline] = useState("");
	const [createInfo, setCreateInfo] = useState("");
	const [createLength, setCreateLength] = useState<string>("30");
	const [createReleaseDate, setCreateReleaseDate] = useState<string>(formatDateForInput());
	const [createAudioFile, setCreateAudioFile] = useState<File | null>(null);
	const [isCalculatingAudio, setIsCalculatingAudio] = useState(false);
	const [detectedAudioDuration, setDetectedAudioDuration] = useState<number | null>(null);
	const [createThumbnailFile, setCreateThumbnailFile] = useState<File | null>(null);
	const [createThumbnailPreview, setCreateThumbnailPreview] = useState<string | null>(null);
	const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
	const [createFormError, setCreateFormError] = useState<string | null>(null);
	const createAudioInputRef = useRef<HTMLInputElement | null>(null);
	const createThumbnailInputRef = useRef<HTMLInputElement | null>(null);

	async function handleCreateAudioChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0] || null;
		setCreateAudioFile(file);
		setDetectedAudioDuration(null);

		if (!file) return;

		try {
			setIsCalculatingAudio(true);
			const durationSeconds = await getAudioDuration(file);
			setDetectedAudioDuration(durationSeconds);
			const minutes = Math.max(1, Math.round(durationSeconds / 60));
			setCreateLength(minutes.toString());
		} catch (err) {
			console.error("Kunne ikke beregne lydfilens varighed:", err);
		} finally {
			setIsCalculatingAudio(false);
		}
	}

	function handleCreateThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			setCreateThumbnailFile(file);
			const previewUrl = URL.createObjectURL(file);
			setCreateThumbnailPreview(previewUrl);
		} else {
			setCreateThumbnailFile(null);
			setCreateThumbnailPreview(null);
		}
	}

	function resetCreateForm() {
		setCreateHeadline("");
		setCreateInfo("");
		setCreateLength("30");
		setCreateReleaseDate(formatDateForInput());
		setCreateAudioFile(null);
		setIsCalculatingAudio(false);
		setDetectedAudioDuration(null);
		setCreateThumbnailFile(null);
		setCreateThumbnailPreview(null);
		setCreateFormError(null);
		if (createAudioInputRef.current) createAudioInputRef.current.value = "";
		if (createThumbnailInputRef.current) createThumbnailInputRef.current.value = "";
	}

	async function handleCreateSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		if (isCalculatingAudio) return;

		setCreateFormError(null);

		if (!createHeadline.trim()) {
			setCreateFormError("Angiv venligst en overskrift / titel.");
			return;
		}
		if (!createInfo.trim()) {
			setCreateFormError("Angiv venligst en beskrivelse / info.");
			return;
		}
		if (!createAudioFile) {
			setCreateFormError("Vælg venligst en podcast-lydfil (.mp3).");
			return;
		}
		const lengthNum = parseInt(createLength, 10);
		if (isNaN(lengthNum) || lengthNum <= 0) {
			setCreateFormError("Kunne ikke fastslå en gyldig varighed for podcasten.");
			return;
		}
		if (!createReleaseDate) {
			setCreateFormError("Angiv venligst en udgivelsesdato.");
			return;
		}

		if (!createThumbnailFile) {
			setCreateFormError("Vælg venligst et thumbnail.");
			return;
		}

		try {
			setIsSubmittingCreate(true);
			const formData = new FormData();
			formData.append("headline", createHeadline.trim());
			formData.append("info", createInfo.trim());
			formData.append("length", lengthNum.toString());
			formData.append("releaseDate", createReleaseDate);
			formData.append("podcast", createAudioFile);
			formData.append("thumbnail", createThumbnailFile);

			const res = await addPodcast(formData);
			setSuccessMessage(res.message || `Podcast "${createHeadline}" blev oprettet!`);
			resetCreateForm();
			setActiveTab("list");
			await refetchPodcasts();
		} catch (err: unknown) {
			console.error("Create podcast failed:", err);
			const errMsg = err instanceof Error ? err.message : "Der opstod en fejl under upload af podcasten.";
			setCreateFormError(`Fejl: ${errMsg}`);
		} finally {
			setIsSubmittingCreate(false);
		}
	}

	return (
		<section className="bg-white border-2 border-black p-6 md:p-8 space-y-6">
			<div className="border-b border-gray pb-4">
				<h2 className="text-2xl font-bold text-black flex items-center gap-2">
					Opret og upload ny podcast
				</h2>
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
							Titel <span className="text-category">*</span>
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

					{/* Info */}
					<div className="md:col-span-2">
						<label className="block text-sm font-bold text-black uppercase mb-1.5">
							Beskrivelse <span className="text-category">*</span>
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

					{/* Release Date */}
					<div className="md:col-span-2">
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
						<div
							className="border-2 border-dashed border-gray p-4 bg-neutral-50 text-center hover:border-black transition-colors">
							<input
								ref={createAudioInputRef}
								type="file"
								accept="audio/*,.mp3,.wav,.ogg,.m4a"
								required
								onChange={handleCreateAudioChange}
								className="hidden"
								id="create-audio-upload"
							/>
							<label
								htmlFor="create-audio-upload"
								className="cursor-pointer flex flex-col items-center justify-center gap-2"
							>
								{isCalculatingAudio ? (
									<FaSpinner className="animate-spin text-2xl text-category"/>
								) : (
									<FaMusic className="text-2xl text-neutral-500"/>
								)}
								<span className="text-sm font-bold text-black underline">
									{isCalculatingAudio
										? "Beregner varighed..."
										: createAudioFile
											? "Skift lydfil"
											: "Vælg lydfil fra computer"}
								</span>
								<span className="text-xs text-neutral-500">
									{createAudioFile
										? `${createAudioFile.name} (${(createAudioFile.size / (1024 * 1024)).toFixed(2)} MB)`
										: "Tilladte formater: .mp3, .wav, .m4a (maks 50MB)"}
								</span>
							</label>

							{/* Audio Preview */}
							{createAudioFile && (
								<div className="mt-3 pt-3 border-t border-gray/40 space-y-2">
									<audio
										controls
										src={URL.createObjectURL(createAudioFile)}
										className="w-full h-8"
									/>
									{detectedAudioDuration !== null && (
										<p className="text-xs text-neutral-600 font-medium">
											Automatisk beregnet spilletid:{" "}
											<span className="font-bold text-black">{formatDurationToTime(detectedAudioDuration)}</span>{" "}
											({createLength} min)
										</p>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Thumbnail File Input */}
					<div>
						<label className="block text-sm font-bold text-black uppercase mb-1.5">
							Coverbillede / Thumbnail <span className="text-category">*</span>
						</label>
						<div
							className="border-2 border-dashed border-gray p-4 bg-neutral-50 text-center hover:border-black transition-colors">
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
									<FaImage className="text-2xl text-neutral-500"/>
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
						disabled={isSubmittingCreate || isCalculatingAudio}
						className="bg-category text-white font-bold px-8 py-3 uppercase text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
					>
						{isSubmittingCreate ? (
							<>
								<FaSpinner className="animate-spin text-sm"/>
								<span>Uploader...</span>
							</>
						) : isCalculatingAudio ? (
							<>
								<FaSpinner className="animate-spin text-sm"/>
								<span>Beregner varighed...</span>
							</>
						) : (
							<>
								<FaPlus className="text-xs"/>
								<span>Udgiv podcast</span>
							</>
						)}
					</button>

					<button
						type="button"
						onClick={resetCreateForm}
						disabled={isSubmittingCreate || isCalculatingAudio}
						className="border-2 border-black text-black font-bold px-6 py-3 uppercase text-sm hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50"
					>
						Ryd felter
					</button>
				</div>
			</form>
		</section>
	);
}
