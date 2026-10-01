import axios from "axios";

export const API_URL = "http://localhost:3001";

const apiClient = axios.create({
	baseURL: API_URL,
	timeout: 10000,
});


/* Podcast Types & Functions */

export interface PodcastItem {
	_id?: string;
	headline: string;
	info: string;
	length: number;
	podcast: string;
	thumbnail?: string;
	releaseDate: string;
}

export function getPodcastAssetUrl(fileName: string): string {
	return `${API_URL}/assets/podcast/${fileName}`;
}

export async function getAllPodcast(): Promise<PodcastItem[]> {
	return apiClient.get("/podcast").then((res) => res.data);
}

export async function getPodcast(id: string): Promise<PodcastItem> {
	return apiClient.get(`/podcast/${id}`).then((res) => res.data);
}

export async function addPodcast(
	formData: FormData
): Promise<{ message: string; article?: PodcastItem }> {
	return apiClient.post("/podcast/add", formData).then((res) => res.data);
}

export async function updatePodcast(
	id: string,
	formData: FormData
): Promise<{ success: boolean; message: string; podcast?: PodcastItem }> {
	return apiClient.put(`/podcast/update/${id}`, formData).then((res) => res.data);
}

export async function deletePodcast(
	id: string
): Promise<{ success: boolean; message: string }> {
	return apiClient.delete(`/podcast/delete/${id}`).then((res) => res.data);
}


/* Article Types & Functions */

export interface ArticleParagraphContent {
	type: "paragraph";
	text?: string;
	headline?: string;
	contentbody?: ArticleContentItem[];
}

export interface ArticleMainContent {
	type: "main";
	contentbody: ArticleContentItem[];
}

export interface ArticleImageContent {
	type: "image";
	url: string;
	altText?: string;
	caption?: string;
	thumbnail?: string;
	contentbody?: ArticleContentItem[];
}

export interface ArticleLinkContent {
	type: "link";
	url?: string;
	text: string;
	contentbody?: ArticleContentItem[];
}

export type ArticleContentItem =
	| ArticleParagraphContent
	| ArticleMainContent
	| ArticleImageContent
	| ArticleLinkContent;

export interface ArticleItem {
	_id: string;
	title: string;
	content: ArticleContentItem[];
	section: string;
	slug: string;
	articleCategory: string;
	isLandingpage: boolean;
	tags: string[];
	author: string;
	publishedAt: string;
}

export function getArticleImageUrl(fileName?: string): string {
	return `${API_URL}/assets/images/${fileName}`;
}

export function getArticleLead(article: ArticleItem): string {
	if (!article?.content) return "";
	const paragraph = article.content.find((content) => content.type === "paragraph") as
		| ArticleParagraphContent
		| undefined;
	return paragraph?.text || "";
}

export function getArticleImage(article: ArticleItem): { url: string; altText: string } | null {
	if (!article?.content) return null;
	const img = article.content.find((content) => content.type === "image") as
		| ArticleImageContent
		| undefined;
	if (!img || !img.url) return null;
	return {
		url: getArticleImageUrl(img.url),
		altText: img.altText || article.title,
	};
}

export async function getAllArticles(): Promise<ArticleItem[]> {
	return apiClient.get("/article").then((res) => res.data);
}

export async function getLandingpageArticles(): Promise<ArticleItem[]> {
	return apiClient.get("/article/landingpage").then((res) => res.data);
}

export async function getArticleById(id: string): Promise<ArticleItem> {
	return apiClient.get(`/article/id/${id}`).then((res) => res.data);
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem> {
	return apiClient.get(`/article/slug/${slug}`).then((res) => res.data);
}

/* Video Types & Functions */

export interface VideoItem {
	_id: string;
	url: string;
	duration: number;
	thumbnail: string;
	headline: string;
	content: string;
	publishedAt?: string;
}

export function getVideoAssetUrl(fileNameOrUrl?: string): string {
	return `${API_URL}/assets/video/${fileNameOrUrl}`;
}

export async function getAllVideos(): Promise<VideoItem[]> {
	return apiClient.get("/video").then((res) => res.data);
}

export async function getVideoById(id: string): Promise<VideoItem> {
	return apiClient.get(`/video/${id}`).then((res) => res.data);
}

/* Contact Types & Functions */

export interface ContactItem {
	_id?: string;
	name: string;
	email: string;
	subject: string;
	message: string;
	createdAt?: string;
}

export interface AddContactPayload {
	name: string;
	email: string;
	subject: string;
	message: string;
}

export interface AddContactResponse {
	message: string;
	contact?: ContactItem;
	error?: string;
	details?: string;
}

export async function addContact(
	payload: AddContactPayload
): Promise<AddContactResponse> {
	return apiClient.post("/contact/add", payload).then((res) => res.data);
}

/* Utilities */

export function formatRelativeDate(dateString?: string): string {
	if (!dateString) return "nyligt";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "nyligt";

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) return "i dag";
	if (diffDays === 1) return "1 dag siden";
	return `${diffDays} dage siden`;
}
