"use client";

import React, {useEffect, useState} from "react";
import {FaCircleCheck, FaEnvelope, FaPaperPlane, FaSpinner, FaXmark} from "react-icons/fa6";
import {addContact} from "@/api";

export interface ContactModalProps {
	isOpen?: boolean;
	onClose?: () => void;
	onSuccess?: () => void;
}

export default function ContactModal({
	isOpen: controlledIsOpen,
	onClose,
	onSuccess,
}: ContactModalProps) {
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const isControlled = typeof controlledIsOpen === "boolean";
	const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	// Lock body scroll
	useEffect(() => {
		if (!isOpen) return;

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	function handleClose() {
		if (!isControlled) {
			setInternalIsOpen(false);
		}
		onClose?.();
		if (isSuccess) {
			resetForm();
		}
	}

	function resetForm() {
		setName("");
		setEmail("");
		setSubject("");
		setMessage("");
		setErrorMessage(null);
		setIsSuccess(false);
	}

	async function handleSubmit(event: React.SubmitEvent) {
		event.preventDefault();
		setErrorMessage(null);

		if (!name.trim()) {
			setErrorMessage("Angiv venligst dit fulde navn.");
			return;
		}
		if (!email.trim()) {
			setErrorMessage("Angiv venligst din e-mailadresse.");
			return;
		}
		if (!subject.trim()) {
			setErrorMessage("Angiv venligst et emne.");
			return;
		}
		if (!message.trim()) {
			setErrorMessage("Skriv venligst en besked.");
			return;
		}

		try {
			setIsSubmitting(true);
			await addContact({
				name: name.trim(),
				email: email.trim(),
				subject: subject.trim(),
				message: message.trim(),
			});
			setIsSuccess(true);
			onSuccess?.();
		} catch (err: unknown) {
			console.error("Couldn't send contact data:", err);
			setErrorMessage("Der opstod en fejl under afsendelsen");
		} finally {
			setIsSubmitting(false);
		}
	}

	if (!isOpen) return null;

	return (
		<div
			className={"fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"}
			onClick={(e) => {
				if (e.target === e.currentTarget) handleClose();
			}}
		>
			<div
				className={"bg-white border-4 border-black w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative"}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className={"flex items-center justify-between border-b-2 border-black pb-4"}>
					<h2 className={"text-2xl font-bold text-black flex items-center gap-2.5"}>
						Kontakt
					</h2>
					<button
						type={"button"}
						onClick={handleClose}
						className={"p-2 text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"}
					>
						<FaXmark className={"text-2xl"} />
					</button>
				</div>

				{/* Error Notice */}
				{errorMessage && (
					<div className={"bg-red-50 border border-red-500 text-red-700 p-3 text-sm font-semibold"}>
						{errorMessage}
					</div>
				)}

				{/* Success State */}
				{isSuccess ? (
					<div className={"text-center py-6 space-y-5"}>
						<div className={"flex justify-center"}>
							<FaCircleCheck className={"text-5xl text-category"} />
						</div>
						<div className={"space-y-2"}>
							<h3 className={"text-2xl font-bold text-black"}>
								Tak for din besked!
							</h3>
							<p className={"text-neutral-600 text-sm max-w-md mx-auto"}>
								Vi har modtaget din henvendelse. Vores redaktion vil gennemgå den snarest muligt.
							</p>
						</div>

						<div className={"flex items-center justify-center gap-3 pt-4 border-t border-gray"}>
							<button
								type={"button"}
								onClick={resetForm}
								className={"border-2 border-black text-black font-bold px-6 py-2.5 uppercase text-sm hover:bg-neutral-100 transition-colors cursor-pointer"}
							>
								Send en ny besked
							</button>
							<button
								type={"button"}
								onClick={handleClose}
								className={"bg-category text-white font-bold px-6 py-2.5 uppercase text-sm hover:opacity-90 transition-opacity cursor-pointer"}
							>
								Luk
							</button>
						</div>
					</div>
				) : (
					/* Contact Form */
					<form onSubmit={handleSubmit} className={"space-y-5"}>
						{/* Name */}
						<div>
							<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
								Fulde navn <span className={"text-category"}>*</span>
							</label>
							<input
								type={"text"}
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								autoFocus
								className={"w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white text-sm"}
							/>
						</div>

						{/* Email */}
						<div>
							<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
								E-mailadresse <span className={"text-category"}>*</span>
							</label>
							<input
								type={"email"}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className={"w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white text-sm"}
							/>
						</div>

						{/* Subject */}
						<div>
							<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
								Emne <span className={"text-category"}>*</span>
							</label>
							<input
								type={"text"}
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								required
								className={"w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white text-sm"}
							/>
						</div>

						{/* Message */}
						<div>
							<label className={"block text-sm font-bold text-black uppercase mb-1.5"}>
								Besked <span className={"text-category"}>*</span>
							</label>
							<textarea
								rows={4}
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								required
								className={"w-full border-2 border-gray focus:border-black p-3 outline-none text-black font-medium transition-colors bg-white text-sm resize-y"}
							/>
						</div>

						{/* Actions */}
						<div className={"flex items-center justify-end gap-3 pt-4 border-t border-gray"}>
							<button
								type={"button"}
								onClick={handleClose}
								disabled={isSubmitting}
								className={"border-2 border-black text-black font-bold px-6 py-3 uppercase text-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"}
							>
								Annuller
							</button>

							<button
								type={"submit"}
								disabled={isSubmitting}
								className={"bg-category text-white font-bold px-8 py-3 uppercase text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"}
							>
								{isSubmitting ? (
									<>
										<FaSpinner className={"animate-spin text-sm"} />
										<span>Sender...</span>
									</>
								) : (
									<span>Send besked</span>
								)}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
