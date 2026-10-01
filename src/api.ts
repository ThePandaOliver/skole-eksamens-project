import {PodcastItem} from "@/component/Podcast";
import axios from "axios";

const API_URL = "http://localhost:3001";

const apiClient = axios.create({
	baseURL: API_URL,
	timeout: 30
});

export interface PodcastItem {
	_id?: string;
	headline: string;
	subtitle?: string;
	length: number;
	podcast: string;
	thumbnail?: string;
	releaseDate: string;
	contentText?: string;
}

export async function getAllPodcast(): Promise<PodcastItem[]> {
	return apiClient.get("/podcast").then(res => res.data);
}

export async function getPodcast(id: string): Promise<PodcastItem> {
	return apiClient.get(`/podcast/${id}`).then(res => res.data);
}

export async function addPodcast(formData: FormData): Promise<{ message: string; article?: PodcastItem }> {
	return apiClient.post("/podcast/add", formData).then(res => res.data);
}

export async function updatePodcast(id: string, formData: FormData): Promise<{ success: boolean; message: string; podcast?: PodcastItem }> {
	return apiClient.put(`/podcast/update/${id}`, formData).then(res => res.data);
}

export async function deletePodcast(id: string): Promise<{ success: boolean; message: string }> {
	return apiClient.delete(`/podcast/delete/${id}`).then(res => res.data);
}

export interface ArticleItem {
	_id: string;
	title: string;
	content: string;
	thumbnail?: string;
	releaseDate: string;
}

export interface ArticleContentSection {
	type: string;
	text: string;
	contentbody?: ;
	releaseDate: string;
}

export async function getAllArticles(): Promise<ArticleItem[]> {
	return apiClient.get("/article").then(res => res.data);
}