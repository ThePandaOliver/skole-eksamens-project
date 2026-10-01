import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArticleItem, getArticleImage, getArticleLead, formatRelativeDate } from "@/api";

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
			<div className={"grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch"}>
				{/* Article 1 */}
				{article1 && (
					<article className={"lg:col-span-6 flex flex-col group"}>
						<Link
							href={`/article/${article1.slug}`}
							className={"flex flex-col h-full"}
						>
							<h1 className={"text-2xl sm:text-3xl font-bold text-black mb-1 group-hover:text-category transition-colors"}>
								{article1.title}
							</h1>

							<div className={"text-xs mb-2 text-neutral-500"}>
								<span className={"text-category font-semibold capitalize"}>
									{article1.articleCategory}
								</span>
								<span>
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
									<div className={"w-full h-full bg-neutral-200"} />
								)}
							</div>
						</Link>
					</article>
				)}

				{/* Article 2 & Article 3 */}
				<div className={"lg:col-span-6 grid grid-cols-2 lg:flex lg:flex-col justify-between gap-3 sm:gap-4"}>
					{article2 && (
						<article className={"flex-1 flex group"}>
							<Link
								href={`/article/${article2.slug}`}
								className={"flex flex-col lg:flex-row justify-between gap-2 sm:gap-3 lg:gap-4 w-full"}
							>
								<div className={"order-1 lg:order-2 relative w-full lg:w-44 aspect-16/10 lg:aspect-4/3 shrink-0 bg-neutral-100 overflow-hidden lg:self-center"}>
									{getArticleImage(article2)?.url ? (
										<Image
											src={getArticleImage(article2)!.url}
											alt={getArticleImage(article2)!.altText}
											fill
											className={"object-cover group-hover:scale-105 transition-transform duration-300"}
										/>
									) : (
										<div className={"w-full h-full bg-neutral-200"} />
									)}
								</div>

								<div className={"order-2 lg:order-1 flex-1 flex flex-col-reverse lg:flex-col justify-between py-0.5"}>
									<div className={"flex flex-col"}>
										<h2 className={"font-bold text-sm sm:text-base lg:text-lg text-black group-hover:text-category transition-colors line-clamp-2"}>
											{article2.title}
										</h2>
										<p className={"text-xs sm:text-sm text-neutral-600 mt-1 line-clamp-2 sm:line-clamp-3"}>
											{getArticleLead(article2)}
										</p>
									</div>

									<div className={"text-xs block text-neutral-500"}>
										<span className={"text-category font-semibold capitalize"}>
											{article2.articleCategory}
										</span>
										<span>
											{" "}| {formatRelativeDate(article2.publishedAt)}
										</span>
									</div>
								</div>
							</Link>
						</article>
					)}

					{article3 && (
						<article className={"flex-1 flex group pt-0 lg:pt-2 border-t-0 lg:border-t lg:border-neutral-100"}>
							<Link
								href={`/article/${article3.slug}`}
								className={"flex flex-col lg:flex-row justify-between gap-2 sm:gap-3 lg:gap-4 w-full"}
							>
								<div className={"order-1 lg:order-2 relative w-full lg:w-44 aspect-16/10 lg:aspect-4/3 shrink-0 bg-neutral-100 overflow-hidden lg:self-center"}>
									{getArticleImage(article3)?.url ? (
										<Image
											src={getArticleImage(article3)!.url}
											alt={getArticleImage(article3)!.altText}
											fill
											className={"object-cover group-hover:scale-105 transition-transform duration-300"}
										/>
									) : (
										<div className={"w-full h-full bg-neutral-200"} />
									)}
								</div>

								<div className={"order-2 lg:order-1 flex-1 flex flex-col-reverse lg:flex-col justify-between py-0.5"}>
									<div className={"flex flex-col"}>
										<h2 className={"font-bold text-sm sm:text-base lg:text-lg text-black group-hover:text-category transition-colors line-clamp-2"}>
											{article3.title}
										</h2>
										<p className={"text-xs sm:text-sm text-neutral-600 mt-1 line-clamp-2 sm:line-clamp-3"}>
											{getArticleLead(article3)}
										</p>
									</div>

									<div className={"text-xs block text-neutral-500"}>
										<span className={"text-category font-semibold capitalize"}>
											{article3.articleCategory}
										</span>
										<span>
											{" "}| {formatRelativeDate(article3.publishedAt)}
										</span>
									</div>
								</div>
							</Link>
						</article>
					)}
				</div>
			</div>

			{/* Article 4 & Article 5 */}
			{(article4 || article5) && (
				<div className={"grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6"}>
					{article4 && (
						<article className={"relative group overflow-hidden"}>
							<Link
								href={`/article/${article4.slug || article4._id}`}
								className={"block relative w-full aspect-16/10 bg-neutral-100 overflow-hidden"}
							>
								{getArticleImage(article4)?.url ? (
									<Image
										src={getArticleImage(article4)!.url}
										alt={getArticleImage(article4)!.altText}
										fill
										className={"object-cover group-hover:scale-105 transition-transform duration-300"}
									/>
								) : (
									<div className={"w-full h-full bg-neutral-200"} />
								)}

								<div className={"absolute bottom-0 inset-x-0 bg-black text-white px-3 py-2.5 sm:px-4 sm:py-3"}>
									<p className={"text-xs sm:text-sm text-white line-clamp-2"}>
										{getArticleLead(article4)}
									</p>
								</div>
							</Link>
						</article>
					)}

					{article5 && (
						<article className={"relative group overflow-hidden"}>
							<Link
								href={`/article/${article5.slug || article5._id}`}
								className={"block relative w-full aspect-16/10 bg-neutral-100 overflow-hidden"}
							>
								{getArticleImage(article5)?.url ? (
									<Image
										src={getArticleImage(article5)!.url}
										alt={getArticleImage(article5)!.altText}
										fill
										className={"object-cover group-hover:scale-105 transition-transform duration-300"}
									/>
								) : (
									<div className={"w-full h-full bg-neutral-200"} />
								)}

								<div className={"absolute bottom-0 inset-x-0 bg-black text-white px-3 py-2.5 sm:px-4 sm:py-3"}>
									<p className={"text-xs sm:text-sm text-white line-clamp-2"}>
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
