import axios from "axios";

export interface OpenMeteoCurrent {
	time: string;
	interval?: number;
	temperature_2m: number;
	relative_humidity_2m: number;
	weather_code: number;
	wind_speed_10m: number;
}

export interface OpenMeteoHourly {
	time: string[];
	temperature_2m: number[];
	weather_code?: number[];
}

export interface OpenMeteoDaily {
	time: string[];
	weather_code: number[];
	temperature_2m_max: number[];
	temperature_2m_min: number[];
	precipitation_probability_max: number[];
	uv_index_max: number[];
}

export interface OpenMeteoResponse {
	latitude: number;
	longitude: number;
	generationtime_ms?: number;
	utc_offset_seconds?: number;
	timezone?: string;
	timezone_abbreviation?: string;
	elevation?: number;
	current: OpenMeteoCurrent;
	hourly: OpenMeteoHourly;
	daily: OpenMeteoDaily;
}

export interface ForecastDay {
	date: string;
	dayName: string;
	dateLabel: string;
	maxTemp: number;
	minTemp: number;
	weatherCode: number;
	morningTemp: number;
	noonTemp: number;
	eveningTemp: number;
	nightTemp: number;
}

export interface WeatherData {
	city: string;
	formattedDate: string;
	currentTemp: number;
	weatherCode: number;
	morningTemp: number;
	noonTemp: number;
	eveningTemp: number;
	nightTemp: number;
	windSpeed: number; // m/s
	precipitationChance: number; // %
	humidity: number; // %
	uvIndex: number;
	forecast: ForecastDay[];
}

export interface WeatherFetchOptions {
	latitude?: number;
	longitude?: number;
	cityName?: string;
	forecastDays?: number;
}

const MONTHS: readonly string[] = [
	"januar",
	"februar",
	"marts",
	"april",
	"maj",
	"juni",
	"juli",
	"august",
	"september",
	"oktober",
	"november",
	"december",
];

const DAYS: readonly string[] = [
	"Søndag",
	"Mandag",
	"Tirsdag",
	"Onsdag",
	"Torsdag",
	"Fredag",
	"Lørdag",
];

export function formatDate(date: Date): string {
	const day = date.getDate();
	const month = MONTHS[date.getMonth()];
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${day}. ${month} kl.${hours}.${minutes}`;
}

const weatherApiClient = axios.create({
	baseURL: "https://api.open-meteo.com/v1",
	timeout: 10000,
});

export async function getWeatherData(
	latitude: number = 56.4158,
	longitude: number = 10.8782,
	cityName: string = "Grenå"
): Promise<WeatherData> {
	const response = await weatherApiClient.get<OpenMeteoResponse>("/forecast", {
		params: {
			latitude,
			longitude,
			current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
			hourly: "temperature_2m,weather_code",
			daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max",
			timezone: "Europe/Copenhagen",
			forecast_days: 9,
			wind_speed_unit: "ms",
		},
	});

	const data: OpenMeteoResponse = response.data;
	const current: OpenMeteoCurrent = data.current;
	const daily: OpenMeteoDaily = data.daily;
	const hourly: OpenMeteoHourly = data.hourly;

	if (!current || !daily || !hourly) {
		throw new Error("Ufuldstændige vejrdata modtaget fra API");
	}

	const todayMorning: number = Math.round(
		hourly.temperature_2m[8] ?? current.temperature_2m
	);
	const todayNoon: number = Math.round(
		hourly.temperature_2m[13] ?? current.temperature_2m
	);
	const todayEvening: number = Math.round(
		hourly.temperature_2m[18] ?? current.temperature_2m
	);
	const todayNight: number = Math.round(
		hourly.temperature_2m[23] ?? current.temperature_2m
	);

	const now = new Date();
	const formattedDate: string = formatDate(now);

	const forecast: ForecastDay[] = [];
	const dailyCount: number = Math.min(daily.time.length, 9);

	// Days 1 through 8 (skip day 0 which is today)
	for (let i = 1; i < dailyCount; i++) {
		const dateStr: string = daily.time[i];
		const dateObj: Date = new Date(`${dateStr}T12:00:00`);
		const dayName: string = i === 1 ? "I morgen" : DAYS[dateObj.getDay()];
		const dateLabel: string = `${dateObj.getDate()} ${MONTHS[dateObj.getMonth()]}`;

		const baseHour: number = i * 24;
		const mTemp: number = Math.round(
			hourly.temperature_2m[baseHour + 8] ?? daily.temperature_2m_min[i]
		);
		const noonTemp: number = Math.round(
			hourly.temperature_2m[baseHour + 13] ?? daily.temperature_2m_max[i]
		);
		const eveTemp: number = Math.round(
			hourly.temperature_2m[baseHour + 18] ?? daily.temperature_2m_max[i]
		);
		const nTemp: number = Math.round(
			hourly.temperature_2m[baseHour + 23] ?? daily.temperature_2m_min[i]
		);

		forecast.push({
			date: dateStr,
			dayName,
			dateLabel,
			maxTemp: Math.round(daily.temperature_2m_max[i]),
			minTemp: Math.round(daily.temperature_2m_min[i]),
			weatherCode: daily.weather_code[i] ?? 0,
			morningTemp: mTemp,
			noonTemp: noonTemp,
			eveningTemp: eveTemp,
			nightTemp: nTemp,
		});
	}

	return {
		city: cityName,
		formattedDate,
		currentTemp: Math.round(current.temperature_2m),
		weatherCode: current.weather_code ?? 0,
		morningTemp: todayMorning,
		noonTemp: todayNoon,
		eveningTemp: todayEvening,
		nightTemp: todayNight,
		windSpeed: Math.round(current.wind_speed_10m),
		precipitationChance: Math.round(
			daily.precipitation_probability_max?.[0] ?? 0
		),
		humidity: Math.round(current.relative_humidity_2m),
		uvIndex: Math.round((daily.uv_index_max?.[0] ?? 0) * 10) / 10,
		forecast,
	};
}
