import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	getArticleBySlug,
	getArticleById,
	getAllArticles,
	getAllPodcast,
	getArticleImageUrl,
	formatRelativeDate,
	ArticleItem,
	ArticleContentItem, ArticleImageContent, ArticleLinkContent, ArticleParagraphContent,
} from "@/utils/api";
import LatestSection from "@/component/landingpage/LatestSection";
import PodcastSection from "@/component/landingpage/PodcastSection";

interface ArticlePageProps {
	params: Promise<{ slug: string }>;
}

function renderContentItem(
	item: ArticleContentItem,
	key: string | number,
	articleTitle: string,
	isFirstItem: boolean = false
): React.ReactNode {
	if (!item) return null;

	const type = (item.type || "").toLowerCase();

	// Container item
	if (type === "main" && Array.isArray(item.contentbody)) {
		return (
			<main key={key} className={"space-y-6"}>
				{item.contentbody.map((child, idx) =>
					renderContentItem(
						child,
						`${key}-main-${idx}`,
						articleTitle,
						false
					)
				)}
			</main>
		);
	}

	// Image item
	if (type === "image") {
		const imageItem = item as ArticleImageContent;
		const fileName = imageItem.url || imageItem.thumbnail;
		if (!fileName) return null;
		const imageUrl = getArticleImageUrl(fileName);

		return (
			<figure key={key} className={"my-8"}>
				<div className={"relative w-full aspect-16/10 bg-neutral-100 overflow-hidden"}>
					<Image
						src={imageUrl}
						alt={imageItem.altText || imageItem.caption || articleTitle}
						fill
						priority={isFirstItem}
						className={"object-cover"}
					/>
				</div>
				{imageItem.caption && (
					<figcaption className={"text-xs text-neutral-500 italic mt-2 text-center"}>
						{imageItem.caption}
					</figcaption>
				)}
				{imageItem.contentbody &&
					Array.isArray(imageItem.contentbody) &&
					imageItem.contentbody.length > 0 && (
						<div className={"mt-4 space-y-4"}>
							{imageItem.contentbody.map((sub, i) =>
								renderContentItem(
									sub,
									`${key}-img-sub-${i}`,
									articleTitle,
									false
								)
							)}
						</div>
					)}
			</figure>
		);
	}

	// Link item
	if (type === "link") {
		const linkItem = item as ArticleLinkContent;
		return (
			<div key={key} className={"pt-4"}>
				<Link
					href={linkItem.url || "#"}
					className={"text-category font-semibold hover:underline"}
				>
					{linkItem.text || "Læs hele historien her."}
				</Link>
				{linkItem.contentbody &&
					Array.isArray(linkItem.contentbody) &&
					linkItem.contentbody.length > 0 && (
						<div className={"mt-4 space-y-4"}>
							{linkItem.contentbody.map((sub, i) =>
								renderContentItem(
									sub,
									`${key}-link-sub-${i}`,
									articleTitle,
									false
								)
							)}
						</div>
					)}
			</div>
		);
	}

	// Paragraph item
	if (type === "paragraph") {
		const paragraphItem = item as ArticleParagraphContent;

		const hasHeadline = Boolean(paragraphItem.headline);
		const hasText = Boolean(paragraphItem.text);

		return (
			<div key={key} className={"space-y-3"}>
				{hasHeadline && (
					<h2 className={"text-xl md:text-2xl font-bold text-black mt-8 mb-2"}>
						{paragraphItem.headline}
					</h2>
				)}
				{hasText && (
					<p
						className={`whitespace-pre-line text-neutral-800 ${
							isFirstItem && !hasHeadline
								? "text-base md:text-lg mb-6"
								: "text-base mb-6"
						}`}
					>
						{paragraphItem.text}
					</p>
				)}
				{paragraphItem.contentbody &&
					Array.isArray(paragraphItem.contentbody) &&
					paragraphItem.contentbody.length > 0 && (
						<div className={"space-y-4"}>
							{paragraphItem.contentbody.map((sub, i) =>
								renderContentItem(
									sub,
									`${key}-sub-${i}`,
									articleTitle,
									false
								)
							)}
						</div>
					)}
			</div>
		);
	}

	return (
		<p className={"text-5xl text-red-600 text-center w-full"}>
			Ukendt content type
		</p>
	);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
	const { slug } = await params;
	const article = await getArticleBySlug(slug).catch(() => null);

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

	const relativeDate = formatRelativeDate(article.publishedAt);

	return (
		<div className={"parent-container flex-1 space-y-6"}>
			<article className={"w-full"}>
				{/* Article Header */}
				<header className={"mb-6"}>
					<h1 className={"text-3xl md:text-4xl font-bold text-black mb-2"}>
						{article.title}
					</h1>

					<div className={"text-xs mb-4"}>
						<span className={"text-category font-semibold capitalize"}>
							{article.articleCategory}
						</span>
						<span className={"text-neutral-500 font-normal"}>
							{" "}| {relativeDate}
						</span>
					</div>
				</header>

				{/* Article Body */}
				<div className={"max-w-none text-neutral-800 text-base"}>
					{Array.isArray(article.content) &&
						article.content.map((item, index) =>
							renderContentItem(
								item,
								index,
								article.title,
								index === 0
							)
						)}
				</div>
			</article>

			{/* Seneste Section */}
			{latestArticles.length > 0 && (
				<LatestSection articles={latestArticles} />
			)}

			{/* Podcast Section */}
			{podcasts.length > 0 && (
				<PodcastSection podcasts={podcasts} />
			)}
		</div>
	);
}
