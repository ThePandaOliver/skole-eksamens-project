"use client";

import React, {useEffect, useState} from "react";
import Image from "next/image";
import {getImageAssetUrl, getQuiz, type QuizItem, type QuizQuestion} from "@/utils/api";
import {cn} from "tailwind-variants";

interface QuizComponentProps {
	quizzes?: QuizItem[];
}

export function QuizSkeleton() {
	return (
		<div className="w-full max-w-120 bg-white border-2 border-neutral-400 p-4 sm:p-6 md:p-8 animate-pulse">
			{/* Image skeleton */}
			<div className="relative w-full aspect-video bg-neutral-200">
				<div className="absolute bottom-0 lg:bottom-3 lg:right-3 w-full lg:w-60 lg:h-30 bg-neutral-300"/>
			</div>
			{/* Answers skeleton */}
			<div className="mt-4 space-y-4">
				<div className="w-full h-15 bg-neutral-200"/>
				<div className="w-full h-15 bg-neutral-200"/>
				<div className="w-full h-15 bg-neutral-200"/>
			</div>
		</div>
	);
}

export default function QuizComponent({quizzes: initialQuizzes}: QuizComponentProps) {
	const [quizzes, setQuizzes] = useState<QuizItem[] | null>(initialQuizzes || null);
	const [activeQuestion, setActiveQuestion] = useState<{
		quiz: QuizItem;
		question: QuizQuestion;
	} | null>(null);
	const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
	const [hasVoted, setHasVoted] = useState(false);
	const [isLoading, setIsLoading] = useState(!initialQuizzes || initialQuizzes.length === 0);

	// Fetch quizzes
	useEffect(() => {
		if (initialQuizzes && initialQuizzes.length > 0) {
			setQuizzes(initialQuizzes);
			setIsLoading(false);
			return;
		}

		let isMounted = true;
		setIsLoading(true);

		getQuiz()
			.then((data) => {
				if (isMounted) {
					setQuizzes(data);
					setIsLoading(false);
				}
			})
			.catch((err) => {
				console.error("Failed to load quiz data:", err);
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [initialQuizzes]);

	// Pick a random quiz and random question
	useEffect(() => {
		if (!quizzes || quizzes.length === 0) return;

		const randomQuizIndex = Math.floor(Math.random() * quizzes.length);
		const chosenQuiz = quizzes[randomQuizIndex];

		const randomQuestionIndex = Math.floor(
			Math.random() * chosenQuiz.questions.length
		);
		const chosenQuestion = chosenQuiz.questions[randomQuestionIndex];

		setActiveQuestion({
			quiz: chosenQuiz,
			question: chosenQuestion,
		});
		setHasVoted(false);
		setSelectedAnswerId(null);
	}, [quizzes]);

	if (isLoading) {
		return <QuizSkeleton/>;
	}

	if (!activeQuestion || !activeQuestion.question) {
		return null;
	}

	const {question} = activeQuestion;
	const answers = question.answers || [];

	const handleAnswerClick = (answerId: string) => {
		if (hasVoted) return;
		setSelectedAnswerId(answerId);
		setHasVoted(true);
	};

	// Calculate total votes and percentage
	const totalVotes = answers.reduce((acc, answer, idx) => {
		const answerKey = answer._id || String(idx);
		const extraVote = selectedAnswerId === answerKey ? 1 : 0;
		return acc + (answer.count || 0) + extraVote;
	}, 0);

	return (
		<div className="w-full max-w-120 bg-white border-2 border-neutral-400 p-4 sm:p-6 md:p-8">
			<section className={"relative w-full aspect-video"}>
				<Image
					src={getImageAssetUrl(question.image)}
					alt={question.question}
					fill
					priority
				/>
				<div className={"absolute bottom-0 lg:bottom-3 lg:right-3 w-full lg:w-60 lg:h-30 bg-category p-2 md:p-4"}>
					<p className={"text-white font-bold text-base lg:text-xl text-center lg:text-left"}>
						{question.question}
					</p>
				</div>
			</section>

			{/* Answers List */}
			<div className="mt-4 space-y-4">
				{answers.map((answer, index) => {
					const answerKey = answer._id || String(index);
					const isSelected = selectedAnswerId === answerKey;
					const voteCount = (answer.count || 0) + (isSelected ? 1 : 0);
					const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

					return (
						<button
							key={answerKey}
							onClick={() => handleAnswerClick(answerKey)}
							className={cn(
								"relative w-full bg-category h-fit p-4 flex text-white text-base sm:text-lg md:text-xl transition-colors",
								hasVoted ? "" : "hover:bg-[#A87B03] cursor-pointer"
							)}
						>
							{
								!hasVoted ? (
									<span>{answer.text}</span>
								) : (
									<>
										{/* progress */}
										<div
											className={"absolute inset-y-0 left-0 bg-[#a87b03] transition-[width] duration-700 ease-out"}
											style={{width: `${percentage}%`}}
										/>

										{/* Foreground */}
										<div className={"relative text-right z-10 w-full text-white font-bold"}>
											{percentage}%
										</div>
									</>
								)
							}
						</button>
					);
				})}
			</div>
		</div>
	);
}
