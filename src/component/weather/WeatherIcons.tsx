import React from "react";
import {
	FaSun,
	FaCloudSun,
	FaCloud,
	FaSmog,
	FaCloudRain,
	FaCloudShowersHeavy,
	FaCloudSunRain,
	FaSnowflake,
	FaCloudBolt,
} from "react-icons/fa6";

export function WeatherIcon({
	code,
	className,
}: {
	code: number;
	className?: string;
}) {
	switch (code) {
		case 0:
			// Clear sky
			return <FaSun className={className} />;
		case 1:
		case 2:
			// partly cloudy
			return <FaCloudSun className={className} />;
		case 3:
			// Overcast
			return <FaCloud className={className} />;
		case 45:
		case 48:
			// Fog
			return <FaSmog className={className} />;
		case 51:
		case 53:
		case 55:
		case 56:
		case 57:
			// Drizzle
			return <FaCloudRain className={className} />;
		case 61:
		case 63:
		case 65:
		case 66:
		case 67:
			// Rain
			return <FaCloudShowersHeavy className={className} />;
		case 71:
		case 73:
		case 75:
		case 77:
		case 85:
		case 86:
			// Snow
			return <FaSnowflake className={className} />;
		case 80:
		case 81:
		case 82:
			// Rain showers
			return <FaCloudSunRain className={className} />;
		case 95:
		case 96:
		case 99:
			// Thunderstorm
			return <FaCloudBolt className={className} />;
		default:
			return <FaSun className={className} />;
	}
}
