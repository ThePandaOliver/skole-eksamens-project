import {PodcastItem} from "@/component/Podcast";
import axios from "axios";

const API_URL = "http://localhost:3001";

export async function getAllPodcast(): Promise<PodcastItem[]> {
	return axios.get(`${API_URL}/podcast`).then(res => res.data);
}

export async function getPodcast(id: string): Promise<PodcastItem> {
	return axios.get(`${API_URL}/podcast/${id}`).then(res => res.data);
}

export async function addPodcast(formData: FormData): Promise<{ message: string; article?: PodcastItem }> {
	return axios.post(`${API_URL}/podcast/add`, formData).then(res => res.data);
}

export async function updatePodcast(id: string, formData: FormData): Promise<{ success: boolean; message: string; podcast?: PodcastItem }> {
	return axios.put(`${API_URL}/podcast/update/${id}`, formData).then(res => res.data);
}

export async function deletePodcast(id: string): Promise<{ success: boolean; message: string }> {
	return axios.delete(`${API_URL}/podcast/delete/${id}`).then(res => res.data);
}
