import {PodcastItem} from "@/component/Podcast";
import axios from "axios";

const API_URL = "http://localhost:3001"

export async function getAllPodcast(): Promise<PodcastItem[]> {
	return axios.get(`${API_URL}/podcast`).then(res => res.data);
}

export async function getPodcast(id: string): Promise<PodcastItem> {
	return axios.get(`${API_URL}/podcast/${id}`).then(res => res.data);
}