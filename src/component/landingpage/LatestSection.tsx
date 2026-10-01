import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArticleItem, getArticleImage, getArticleLead, formatRelativeDate } from "@/api";
import {FaArrowRight} from "react-icons/fa6";

interface SenesteSectionProps {
	articles: ArticleItem[];
}

export default function LatestSection({
	articles,
}: SenesteSectionProps) {
	if (!articles || articles.length === 0) {
		return null;
	}

	const displayArticles = articles.slice(0, 4);

	return (
		<section className={"w-full"}>
			<div className={"flex items-center justify-between mb-4"}>
				<h2 className={"text-2xl md:text-3xl font-bold text-black"}>Seneste</h2>
				<Link
					href={"/nyheder"}
					className={"text-sm font-semibold text-category hover:underline flex items-center gap-1 transition-colors"}
				>
					<span>Vis mere</span>
					<FaArrowRight/>
				</Link>
			</div>

			<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}>
				{displayArticles.map((article) => {
					const img = getArticleImage(article);
					const lead = getArticleLead(article);
					const relativeDate = formatRelativeDate(article.publishedAt);
					const articleHref = `/article/${article.slug || article._id}`;

					return (
						<article key={article._id} className="flex flex-col group">
							<Link href={articleHref} className="block overflow-hidden">
								<div className="relative w-full aspect-16/10 bg-neutral-100 overflow-hidden">
									{img?.url ? (
										<Image
											src={img.url}
											alt={img.altText || article.title}
											fill
											className={"object-cover group-hover:scale-105 transition-transform duration-300"}
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs font-bold uppercase bg-neutral-100">
											Intet billede
										</div>
									)}
								</div>
							</Link>

							<div className="flex-1 flex flex-col justify-between mt-2">
								<Link href={articleHref}>
									<p className="font-semibold text-sm text-black group-hover:text-category transition-colors">
										{lead || article.title}
									</p>
								</Link>
								<div className="mt-2 text-xs">
									<span className="text-category font-medium capitalize">
										{article.articleCategory}
									</span>
									<span className="text-neutral-500">
										{" "}| {relativeDate}
									</span>
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
}
