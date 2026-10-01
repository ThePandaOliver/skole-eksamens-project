import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	getArticleBySlug,
	getArticleById,
	getAllArticles,
	getAllPodcast,
	getArticleImage,
	getArticleLead,
	getArticleMain,
	formatRelativeDate,
	ArticleItem,
	ArticleContentBodyItem,
} from "@/api";
import LatestSection from "@/component/landingpage/LatestSection";
import PodcastSection from "@/component/landingpage/PodcastSection";

interface ArticlePageProps {
	params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
	const { slug } = await params;
	const article = await getArticleBySlug(slug);

	if (!article) {
		notFound();
	}

	const [allArticles, podcasts] = await Promise.all([
		getAllArticles().catch(() => []),
		getAllPodcast().catch(() => []),
	]);

	const latestArticles = allArticles
		.filter((a) => a._id !== article._id && a.slug !== article.slug)
		.slice(0, 4);

	const img = getArticleImage(article);
	const leadText = getArticleLead(article);
	const mainBlocks = getArticleMain(article);
	const relativeDate = formatRelativeDate(article.publishedAt);

	// Extract pull quote text:
	// If there is an item with type 'quote', use it. Otherwise if there are 3+ paragraphs,
	// take the first sentence or lines of paragraph 3 (index 2) as seen in the mockup.
	let pullQuoteText = "";
	const explicitQuote = mainBlocks.find(
		(b) => b.type === "quote" || b.type === "blockquote"
	);

	if (explicitQuote) {
		pullQuoteText = explicitQuote.text;
	} else if (mainBlocks.length >= 3 && mainBlocks[2]?.text) {
		// First sentence or first line from paragraph 3
		const raw = mainBlocks[2].text;
		const firstLine = raw.split("\n")[0] || raw;
		pullQuoteText = firstLine.trim();
		// If too long, trim cleanly around 80 chars
		if (pullQuoteText.length > 85) {
			const cut = pullQuoteText.substring(0, 85);
			pullQuoteText = cut.substring(0, cut.lastIndexOf(" ")) || cut;
		}
	}

	return (
		<main className="parent-container !pt-6 !pb-12 flex-1">
			<article className="w-full">
				{/* Article Header */}
				<header className="mb-6">
					<h1 className="text-3xl md:text-4xl font-bold text-black mb-2 leading-tight">
						{article.title}
					</h1>

					<div className="text-xs mb-4">
						<span className="text-category font-semibold capitalize">
							{article.articleCategory}
						</span>
						<span className="text-neutral-500 font-normal">
							{" "}| {relativeDate}
						</span>
					</div>

					{leadText && (
						<p className="text-base md:text-lg text-neutral-800 font-normal leading-relaxed">
							{leadText}
						</p>
					)}
				</header>

				{/* Featured Image */}
				{img?.url && (
					<div className="relative w-full aspect-16/10 bg-neutral-100 overflow-hidden mb-8">
						<Image
							src={img.url}
							alt={img.altText || article.title}
							fill
							priority
							sizes="(max-width: 1000px) 100vw, 1000px"
							className="object-cover"
						/>
					</div>
				)}

				{/* Article Body Content */}
				<div className="prose prose-neutral max-w-none text-neutral-800 text-base leading-relaxed space-y-6">
					{mainBlocks.map((block: ArticleContentBodyItem, index: number) => {
						const isQuote =
							block.type === "quote" || block.type === "blockquote";
						if (isQuote) return null;

						return (
							<React.Fragment key={index}>
								{block.headline && (
									<h2 className="text-xl md:text-2xl font-bold text-black mt-8 mb-2">
										{block.headline}
									</h2>
								)}

								<p className="whitespace-pre-line text-neutral-800 leading-relaxed text-base">
									{block.text}
								</p>

								{/* Pull quote displayed between paragraph 1 and 2 (as in mockup) */}
								{index === 0 && pullQuoteText && (
									<blockquote className="my-8 py-2 text-center max-w-xl mx-auto border-0">
										<span className="block text-4xl md:text-5xl text-neutral-400 font-serif leading-none select-none mb-2">
											&rdquo;
										</span>
										<p className="text-lg md:text-xl text-neutral-500 font-medium italic leading-snug">
											{pullQuoteText}
										</p>
									</blockquote>
								)}
							</React.Fragment>
						);
					})}

					{/* External or related link if present in content */}
					{article.content?.find((c) => c.type === "link") && (
						<div className="pt-4 border-t border-neutral-200">
							<Link
								href={
									(article.content.find((c) => c.type === "link") as any)
										?.url || "#"
								}
								className="text-category font-semibold hover:underline"
							>
								{
									(article.content.find((c) => c.type === "link") as any)
										?.text || "Læs hele historien her."
								}
							</Link>
						</div>
					)}
				</div>
			</article>

			{/* Seneste Section */}
			{latestArticles.length > 0 && (
				<LatestSection articles={latestArticles}/>
			)}

			{/* Podcast Section */}
			{podcasts.length > 0 && (
				<PodcastSection podcasts={podcasts} />
			)}
		</main>
	);
}
