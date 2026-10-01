import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArticleItem, getArticleImage, getArticleLead, formatRelativeDate } from "@/api";
import {cn} from "tailwind-variants";

interface HeroArticlesSectionProps {
	articles: ArticleItem[];
}

export default function HeroArticlesSection({
	articles,
}: HeroArticlesSectionProps) {
	if (!articles || articles.length === 0) {
		return null;
	}

	const article1 = articles[0];
	const article2 = articles[1];
	const article3 = articles[2];
	const article4 = articles[3];
	const article5 = articles[4];

	return (
		<section className={"w-full"}>
			<div className={"grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"}>
				{article1 && (
					<article className={"lg:col-span-6 flex flex-col group"}>
						<Link
							href={`/article/${article1.slug}`}
							className={"flex flex-col h-full"}
						>
							<h1 className={"text-2xl sm:text-3xl font-bold text-black mb-1 group-hover:text-category transition-colors"}>
								{article1.title}
							</h1>

							<div className={"text-xs mb-2.5"}>
								<span className={"text-category font-semibold capitalize"}>
									{article1.articleCategory}
								</span>
								<span className={"text-neutral-500"}>
									{" "}| {formatRelativeDate(article1.publishedAt)}
								</span>
							</div>

							<div className={"relative w-full flex-1 aspect-16/10 bg-neutral-100 overflow-hidden"}>
								{getArticleImage(article1)?.url ? (
									<Image
										src={getArticleImage(article1)!.url}
										alt={getArticleImage(article1)!.altText}
										fill
										priority
										className={"object-cover group-hover:scale-105 transition-transform duration-300"}
									/>
								) : (
									<div className="w-full h-full bg-neutral-200" />
								)}
							</div>
						</Link>
					</article>
				)}

				<div className="lg:col-span-6 flex flex-col justify-between gap-4">
					{article2 && (
						<article className="flex-1 flex group">
							<Link
								href={`/article/${article2.slug}`}
								className="flex flex-row justify-between gap-4 w-full"
							>
								<div className="flex-1 flex flex-col justify-between py-1">
									<div>
										<h2 className="font-bold text-base sm:text-lg text-black group-hover:text-category transition-colors">
											{article2.title}
										</h2>
										<p className="text-sm text-neutral-600 mt-1.5">
											{getArticleLead(article2)}
										</p>
									</div>
									<div className="text-xs mt-2">
										<span className="text-category font-medium capitalize">
											{article2.articleCategory}
										</span>
										<span className="text-neutral-500">
											{" "}| {formatRelativeDate(article2.publishedAt)}
										</span>
									</div>
								</div>

								<div className="relative w-36 sm:w-44 aspect-4/3 shrink-0 bg-neutral-100 overflow-hidden self-center">
									{getArticleImage(article2)?.url ? (
										<Image
											src={getArticleImage(article2)!.url}
											alt={getArticleImage(article2)!.altText}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									) : (
										<div className="w-full h-full bg-neutral-200" />
									)}
								</div>
							</Link>
						</article>
					)}

					{article3 && (
						<article className="flex-1 flex group pt-2 border-t border-neutral-100 lg:border-t-0">
							<Link
								href={`/article/${article3.slug}`}
								className="flex flex-row justify-between gap-4 w-full"
							>
								<div className="flex-1 flex flex-col justify-between py-1">
									<div>
										<h2 className="font-bold text-base sm:text-lg text-black group-hover:text-category transition-colors">
											{article3.title}
										</h2>
										<p className="text-sm text-neutral-600 mt-1.5">
											{getArticleLead(article3)}
										</p>
									</div>
									<div className="text-xs mt-2">
										<span className="text-category  capitalize">
											{article3.articleCategory}
										</span>
										<span className="text-neutral-500 font-normal">
											{" "}| {formatRelativeDate(article3.publishedAt)}
										</span>
									</div>
								</div>

								<div className="relative w-36 sm:w-44 aspect-4/3 shrink-0 bg-neutral-100 overflow-hidden self-center">
									{getArticleImage(article3)?.url ? (
										<Image
											src={getArticleImage(article3)!.url}
											alt={getArticleImage(article3)!.altText}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									) : (
										<div className="w-full h-full bg-neutral-200" />
									)}
								</div>
							</Link>
						</article>
					)}
				</div>
			</div>

			{(article4 || article5) && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
					{article4 && (
						<article className="relative group overflow-hidden">
							<Link
								href={`/article/${article4.slug}`}
								className="block relative w-full aspect-16/10 bg-neutral-100 overflow-hidden"
							>
								{getArticleImage(article4)?.url ? (
									<Image
										src={getArticleImage(article4)!.url}
										alt={getArticleImage(article4)!.altText}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								) : (
									<div className="w-full h-full bg-neutral-200" />
								)}

								<div className={"absolute bottom-0 inset-x-0 bg-black text-white px-4 py-3"}>
									<p className="text-xs sm:text-sm text-white">
										{getArticleLead(article4)}
									</p>
								</div>
							</Link>
						</article>
					)}

					{article5 && (
						<article className="relative group overflow-hidden">
							<Link
								href={`/article/${article5.slug}`}
								className="block relative w-full aspect-16/10 bg-neutral-100 overflow-hidden"
							>
								{getArticleImage(article5)?.url ? (
									<Image
										src={getArticleImage(article5)!.url}
										alt={getArticleImage(article5)!.altText}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								) : (
									<div className="w-full h-full bg-neutral-200" />
								)}

								<div className={"absolute bottom-0 inset-x-0 bg-black text-white px-4 py-3"}>
									<p className="text-xs sm:text-sm text-white">
										{getArticleLead(article5)}
									</p>
								</div>
							</Link>
						</article>
					)}
				</div>
			)}
		</section>
	);
}