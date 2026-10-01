"use client";

import React, {useId, useRef, useState} from "react";
import Image from "next/image";
import {FaImage, FaMusic, FaPlus, FaSpinner, FaXmark} from "react-icons/fa6";
import {cn} from "tailwind-variants";
import {addPodcast, getPodcastAssetUrl, PodcastItem, updatePodcast} from "@/api";
import {formatDateForInput} from "@/app/admin/page";
import {formatDurationToTime, getAudioDuration} from "@/utils/audio";

export interface PodcastFormProps {
	podcast?: PodcastItem | null;
	title?: string;
	isModal?: boolean;
	setSuccessMessage?: (message: string | null) => void;
	setActiveTab?: (tab: "list" | "create") => void;
	refetchPodcasts?: () => Promise<void> | void;
	onSuccess?: () => void;
	onCancel?: () => void;
	className?: string;
}

export default function PodcastForm({
	podcast,
	title,
	isModal = false,
	setSuccessMessage,
	setActiveTab,
	refetchPodcasts,
	onSuccess,
	onCancel,
	className,
}: PodcastFormProps) {
	const isEdit = Boolean(podcast?._id);
	const uniqueId = useId();
	const idPrefix = isEdit ? `edit-${uniqueId}` : `create-${uniqueId}`;

	const [prevPodcastId, setPrevPodcastId] = useState(podcast?._id);
	const [headline, setHeadline] = useState(podcast?.headline || "");
	const [info, setInfo] = useState(podcast?.info || "");
	const [length, setLength] = useState(podcast?.length ? podcast.length.toString() : "30");
	const [releaseDate, setReleaseDate] = useState(formatDateForInput(podcast?.releaseDate));

	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [isCalculatingAudio, setIsCalculatingAudio] = useState(false);
	const [detectedAudioDuration, setDetectedAudioDuration] = useState<number | null>(null);

	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
		podcast?.thumbnail ? getPodcastAssetUrl(podcast.thumbnail) : null
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const audioInputRef = useRef<HTMLInputElement | null>(null);
	const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

	// Reset state during render if the podcast instance being edited changes
	if (podcast?._id !== prevPodcastId) {
		setPrevPodcastId(podcast?._id);
		setHeadline(podcast?.headline || "");
		setInfo(podcast?.info || "");
		setLength(podcast?.length ? podcast.length.toString() : "30");
		setReleaseDate(formatDateForInput(podcast?.releaseDate));
		setAudioFile(null);
		setIsCalculatingAudio(false);
		setDetectedAudioDuration(null);
		setThumbnailFile(null);
		setThumbnailPreview(podcast?.thumbnail ? getPodcastAssetUrl(podcast.thumbnail) : null);
		setFormError(null);
	}

	function resetForm() {
		setHeadline(podcast?.headline || "");
		setInfo(podcast?.info || "");
		setLength(podcast?.length ? podcast.length.toString() : "30");
		setReleaseDate(formatDateForInput(podcast?.releaseDate));
		setAudioFile(null);
		setIsCalculatingAudio(false);
		setDetectedAudioDuration(null);
		setThumbnailFile(null);
		setThumbnailPreview(podcast?.thumbnail ? getPodcastAssetUrl(podcast.thumbnail) : null);
		setFormError(null);
		if (audioInputRef.current) audioInputRef.current.value = "";
		if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
	}

	async function handleAudioChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0] || null;
		setAudioFile(file);
		setDetectedAudioDuration(null);

		if (!file) return;

		try {
			setIsCalculatingAudio(true);
			const durationSeconds = await getAudioDuration(file);
			setDetectedAudioDuration(durationSeconds);
			const minutes = Math.max(1, Math.round(durationSeconds / 60));
			setLength(minutes.toString());
		} catch (err) {
			console.error("Kunne ikke beregne lydfilens varighed:", err);
		} finally {
			setIsCalculatingAudio(false);
		}
	}

	function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (file) {
			setThumbnailFile(file);
			const previewUrl = URL.createObjectURL(file);
			setThumbnailPreview(previewUrl);
		} else {
			setThumbnailFile(null);
			setThumbnailPreview(podcast?.thumbnail ? getPodcastAssetUrl(podcast.thumbnail) : null);
		}
	}

	async function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		if (isCalculatingAudio) return;

		setFormError(null);

		if (!headline.trim()) {
			setFormError("Angiv venligst en titel.");
			return;
		}
		if (!info.trim()) {
			setFormError("Angiv venligst en beskrivelse / info.");
			return;
		}
		if (!isEdit && !audioFile) {
			setFormError("Vælg venligst en podcast-lydfil (.mp3).");
			return;
		}
		const lengthNum = parseInt(length, 10);
		if (isNaN(lengthNum) || lengthNum <= 0) {
			setFormError("Kunne ikke fastslå en gyldig varighed for podcasten.");
			return;
		}
		if (!releaseDate) {
			setFormError("Angiv venligst en udgivelsesdato.");
			return;
		}
		if (!isEdit && !thumbnailFile) {
			setFormError("Vælg venligst et thumbnail.");
			return;
		}

		try {
			setIsSubmitting(true);
			const formData = new FormData();
			formData.append("headline", headline.trim());
			formData.append("info", info.trim());
			formData.append("length", lengthNum.toString());
			formData.append("releaseDate", releaseDate);

			if (audioFile) {
				formData.append("podcast", audioFile);
			}
			if (thumbnailFile) {
				formData.append("thumbnail", thumbnailFile);
			}

			if (isEdit) {
				if (!podcast?._id) throw new Error("Mangler podcast ID til opdatering.");
				const res = await updatePodcast(podcast._id, formData);
				setSuccessMessage?.(res.message || `Podcast "${headline}" blev opdateret!`);
				onSuccess?.();
				if (refetchPodcasts) await refetchPodcasts();
			} else {
				const res = await addPodcast(formData);
				setSuccessMessage?.(res.message || `Podcast "${headline}" blev oprettet!`);
				resetForm();
				setActiveTab?.("list");
				onSuccess?.();
				if (refetchPodcasts) await refetchPodcasts();
			}
		} catch (err: unknown) {
			console.error(`${isEdit ? "Update" : "Create"} podcast failed:`, err);
			const errMsg = err instanceof Error ? err.message : `Der opstod en fejl under ${isEdit ? "opdatering" : "upload"} af podcasten.`;
			setFormError(`Fejl: ${errMsg}`);
		} finally {
			setIsSubmitting(false);
		}
	}

	const defaultTitle = isEdit ? "Rediger Podcast" : "Opret og upload ny podcast";

	return (
		<section
			className={cn(
				"bg-white space-y-6",
				!isModal && "border-2 border-black p-6 md:p-8",
				className
			)}
		>
			<div className={"flex items-center justify-between border-b-2 border-black pb-4"}>
				<h2 className={"text-2xl font-bold text-black flex items-center gap-2"}>
					{title || defaultTitle}
				</h2>
				{onCancel && (
					<button
						type={"button"}
						onClick={onCancel}
						aria-label={"Luk"}
						className={"p-2 text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"}
					>
						<FaXmark className={"text-2xl"}/>
					</button>
				)}
			</div>

			{formError && (
				<div className={"bg-red-50 border border-red-500 text-red-700 p-3 text-sm font-semibold"}>
					{formError}
				</div>
			)}

			<form onSubmit={handleSubmit} className={"space-y-6"}>
				<div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
					{/* Headline */}
					<div className={"md:col-span-2"}>
						<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
							Titel <span className={"text-category"}>*</span>
						</label>
						<input
							type={"text"}
							value={headline}
							onChange={(event) => setHeadline(event.target.value)}
							required
							className={"w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"}
						/>
					</div>

					{/* Info */}
					<div className={"md:col-span-2"}>
						<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
							Info <span className={"text-category"}>*</span>
						</label>
						<textarea
							rows={4}
							value={info}
							required
							onChange={(event) => setInfo(event.target.value)}
							className={"w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white resize-y"}
						/>
					</div>

					{/* Release Date */}
					<div className={"md:col-span-2"}>
						<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
							Udgivelsesdato <span className={"text-category"}>*</span>
						</label>
						<input
							type={"date"}
							value={releaseDate}
							onChange={(e) => setReleaseDate(e.target.value)}
							required
							className={"w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white"}
						/>
					</div>

					{/* Audio File Input */}
					<div>
						<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
							Lydfil (MP3 / Audio) {!isEdit && <span className={"text-category"}>*</span>}
						</label>
						<div className={"border-2 border-dashed border-gray p-4 bg-neutral-50 text-center hover:border-black transition-colors"}>
							<input
								ref={audioInputRef}
								type={"file"}
								accept={"audio/*,.mp3,.wav,.ogg,.m4a"}
								required={!isEdit && !podcast?.podcast}
								onChange={handleAudioChange}
								className={"hidden"}
								id={`${idPrefix}-audio-upload`}
							/>
							<label
								htmlFor={`${idPrefix}-audio-upload`}
								className={"cursor-pointer flex flex-col items-center justify-center gap-2"}
							>
								{isCalculatingAudio ? (
									<FaSpinner className={"animate-spin text-2xl text-category"}/>
								) : (
									<FaMusic className={"text-2xl text-neutral-500"}/>
								)}
								<span className={"text-sm font-bold text-black underline"}>
									{isCalculatingAudio
										? "Beregner varighed..."
										: audioFile
											? "Skift lydfil"
											: isEdit && podcast?.podcast
												? "Erstat lydfil med ny"
												: "Vælg lydfil fra computer"}
								</span>
								<span className={"text-xs text-neutral-500"}>
									{audioFile
										? `${audioFile.name} (${(audioFile.size / (1024 * 1024)).toFixed(2)} MB)`
										: "Tilladte formater: .mp3, .wav, .m4a"}
								</span>
							</label>

							{/* Audio Preview */}
							{audioFile ? (
								<div className={"mt-3 pt-3 border-t border-gray/40 space-y-2"}>
									{isEdit && (
										<p className={"text-xs font-semibold text-category"}>
											Ny lydfil valgt: {audioFile.name} (erstatter den gamle ved gem)
										</p>
									)}
									<audio
										controls
										src={URL.createObjectURL(audioFile)}
										className={"w-full h-8"}
									/>
									{detectedAudioDuration !== null && (
										<p className={"text-xs text-neutral-600 font-medium"}>
											Automatisk beregnet spilletid:{" "}
											<span className={"font-bold text-black"}>{formatDurationToTime(detectedAudioDuration)}</span>{" "}
											({length} min)
										</p>
									)}
								</div>
							) : isEdit && podcast?.podcast ? (
								<div className={"mt-3 pt-3 border-t border-gray/40 space-y-2"}>
									<audio
										controls
										src={getPodcastAssetUrl(podcast.podcast)}
										className={"w-full h-8"}
									/>
									<p className={"text-xs text-neutral-600 font-medium"}>
										Nuværende spilletid: <span className={"font-bold text-black"}>{length} min</span>
									</p>
								</div>
							) : null}
						</div>
					</div>

					{/* Thumbnail File Input */}
					<div>
						<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
							Thumbnail {!isEdit && <span className={"text-category"}>*</span>}
						</label>
						<div className={"border-2 border-dashed border-gray p-4 bg-neutral-50 text-center hover:border-black transition-colors"}>
							<input
								ref={thumbnailInputRef}
								type={"file"}
								accept={"image/*,.jpg,.jpeg,.png,.webp"}
								required={!isEdit && !podcast?.thumbnail}
								onChange={handleThumbnailChange}
								className={"hidden"}
								id={`${idPrefix}-thumbnail-upload`}
							/>
							<label
								htmlFor={`${idPrefix}-thumbnail-upload`}
								className={"cursor-pointer flex flex-col items-center justify-center gap-2"}
							>
								{thumbnailPreview ? (
									<div className={"relative size-24 border border-gray overflow-hidden"}>
										<Image
											src={thumbnailPreview}
											alt={"Preview"}
											fill
											className={"object-cover"}
										/>
									</div>
								) : (
									<FaImage className={"text-2xl text-neutral-500"}/>
								)}
								<span className={"text-sm font-bold text-black underline"}>
									{thumbnailFile
										? "Skift billede"
										: isEdit && podcast?.thumbnail
											? "Erstat thumbnail med ny"
											: "Vælg coverbillede fra computer"}
								</span>
								<span className={"text-xs text-neutral-500"}>
									{thumbnailFile
										? `${thumbnailFile.name}`
										: "Tilladte formater: .jpg, .png, .webp"}
								</span>
							</label>
							{thumbnailFile && isEdit && (
								<p className={"text-xs font-semibold text-category mt-2"}>
									Nyt billede valgt: {thumbnailFile.name} (erstatter det gamle ved gem)
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Form Actions */}
				<div className={"flex items-center gap-4 pt-4 border-t border-gray"}>
					<button
						type={"submit"}
						disabled={isSubmitting || isCalculatingAudio}
						className={"bg-category text-white font-bold px-8 py-3 uppercase text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"}
					>
						{isSubmitting ? (
							<>
								<FaSpinner className={"animate-spin text-sm"}/>
								<span>{isEdit ? "Gemmer ændringer..." : "Uploader..."}</span>
							</>
						) : isCalculatingAudio ? (
							<>
								<FaSpinner className={"animate-spin text-sm"}/>
								<span>Beregner varighed...</span>
							</>
						) : (
							<>
								{!isEdit && <FaPlus className={"text-xs"}/>}
								<span>{isEdit ? "Gem ændringer" : "Udgiv podcast"}</span>
							</>
						)}
					</button>

					{isEdit ? (
						onCancel && (
							<button
								type={"button"}
								onClick={onCancel}
								disabled={isSubmitting || isCalculatingAudio}
								className={"border-2 border-black text-black font-bold px-6 py-3 uppercase text-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"}
							>
								Annuller
							</button>
						)
					) : (
						<button
							type={"button"}
							onClick={resetForm}
							disabled={isSubmitting || isCalculatingAudio}
							className={"border-2 border-black text-black font-bold px-6 py-3 uppercase text-sm hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50"}
						>
							Ryd felter
						</button>
					)}
				</div>
			</form>
		</section>
	);
}
