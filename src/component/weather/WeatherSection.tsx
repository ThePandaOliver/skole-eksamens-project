import React from "react";
import { WeatherData } from "@/utils/weather";
import { WeatherIcon } from "./WeatherIcons";

interface WeatherSectionProps {
	data?: WeatherData | null;
	error?: string | null;
}

export default function WeatherSection({ data, error }: WeatherSectionProps) {
	if (error || !data) {
		return (
			<section className={"w-full"}>
				<div className={"bg-neutral-100 border border-neutral-300 rounded p-6 sm:p-8 text-center text-neutral-700"}>
					<h3 className={"text-lg sm:text-xl font-bold text-black mb-2"}>
						Kunne ikke indlæse vejrdata
					</h3>
					<p className={"text-sm sm:text-base text-neutral-600"}>
						{error || "Der er en fejl ved Vejrtjenesten."}
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className={"w-full"}>
			<div className={"grid grid-cols-1 lg:grid-cols-2 gap-2 select-none items-stretch"}>
				{/* Current Weather */}
				<div className={"flex flex-col gap-2"}>
					{/* Main Current Weather Card */}
					<div className={"bg-weather-bg p-4 sm:p-6 text-white flex flex-col justify-between"}>
						{/* City and date */}
						<div className={"flex items-baseline gap-2"}>
							<h2 className={"text-xl sm:text-2xl font-bold"}>
								{data.city}
							</h2>
							<span className={"text-sm sm:text-base text-white/95"}>
								{data.formattedDate}
							</span>
						</div>

						{/* temperature and Weather Icon */}
						<div className={"flex items-center justify-between py-4 sm:py-6 px-2 sm:px-4"}>
							<span className={"text-7xl sm:text-8xl md:text-9xl font-bold"}>
								{data.currentTemp}°
							</span>
							<div className={"shrink-0 flex items-center justify-center"}>
								<WeatherIcon
									code={data.weatherCode}
									className={"w-20 h-20 sm:w-24 sm:h-24 text-white"}
								/>
							</div>
						</div>

						{/* Morgen, Middag, Aften, Nat */}
						<div className={"flex justify-end pt-2 sm:pt-4"}>
							<div className={"grid grid-cols-4 gap-3 sm:gap-6 text-center"}>
								<div>
									<div className={"text-sm sm:text-base font-medium"}>Morgen</div>
									<div className={"text-lg sm:text-xl font-bold mt-0.5"}>
										{data.morningTemp}°
									</div>
								</div>
								<div>
									<div className={"text-sm sm:text-base font-medium"}>Middag</div>
									<div className={"text-lg sm:text-xl font-bold mt-0.5"}>
										{data.noonTemp}°
									</div>
								</div>
								<div>
									<div className={"text-sm sm:text-base font-medium"}>Aften</div>
									<div className={"text-lg sm:text-xl font-bold mt-0.5"}>
										{data.eveningTemp}°
									</div>
								</div>
								<div>
									<div className={"text-sm sm:text-base font-medium"}>Nat</div>
									<div className={"text-lg sm:text-xl font-bold mt-0.5"}>
										{data.nightTemp}°
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Metric Cards Grid */}
					<div className={"grid grid-cols-2 gap-2"}>
						{/* Vind */}
						<div className={"bg-weather-bg p-3.5 sm:p-5 flex flex-col justify-between h-28 sm:h-32 text-white"}>
							<span className={"text-sm sm:text-base font-medium"}>
								Vind
							</span>
							<div className={"flex items-baseline justify-between mt-auto"}>
								<span className={"text-sm sm:text-base font-semibold"}>
									m/s
								</span>
								<span className={"text-3xl sm:text-4xl lg:text-5xl font-bold"}>
									{data.windSpeed}
								</span>
							</div>
						</div>

						{/* Chance for regn */}
						<div className={"bg-weather-bg p-3.5 sm:p-5 flex flex-col justify-between h-28 sm:h-32 text-white"}>
							<span className={"text-sm sm:text-base font-medium"}>
								Chance for regn
							</span>
							<div className={"flex items-baseline justify-between mt-auto"}>
								<span className={"text-sm sm:text-base font-semibold"}>
									%
								</span>
								<span className={"text-3xl sm:text-4xl lg:text-5xl font-bold"}>
									{data.precipitationChance}
								</span>
							</div>
						</div>

						{/* Luftfugtighed */}
						<div className={"bg-weather-bg p-3.5 sm:p-5 flex flex-col justify-between h-28 sm:h-32 text-white"}>
							<span className={"text-sm sm:text-base font-medium"}>
								Luftfugtighed
							</span>
							<div className={"flex items-baseline justify-between mt-auto"}>
								<span className={"text-sm sm:text-base font-semibold"}>
									%
								</span>
								<span className={"text-3xl sm:text-4xl lg:text-5xl font-bold"}>
									{data.humidity}
								</span>
							</div>
						</div>

						{/* UV Index */}
						<div className={"bg-weather-bg p-3.5 sm:p-5 flex flex-col justify-between h-28 sm:h-32 text-white"}>
							<span className={"text-sm sm:text-base font-medium"}>
								UV Index
							</span>
							<div className={"flex items-baseline justify-between mt-auto"}>
								<span className={"text-3xl sm:text-4xl lg:text-5xl font-bold ml-auto"}>
									{data.uvIndex}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Weekly Forecast Card */}
				<div className={"bg-weather-bg p-4 sm:p-5 text-white flex flex-col justify-between h-full"}>
					{data.forecast.map((day) => (
						<div
							key={day.date}
							className={"flex items-center justify-between py-2 sm:py-2.5 border-b border-white/10 last:border-b-0"}
						>
							{/* Day name and date */}
							<div className={"w-28 sm:w-32 shrink-0 flex flex-col justify-center"}>
								<span className={"font-bold text-base sm:text-lg md:text-xl capitalize leading-tight"}>
									{day.dayName}
								</span>
								<span className={"text-xs sm:text-sm text-white/90 leading-tight"}>
									{day.dateLabel}
								</span>
							</div>

							{/* Main Day Temperature */}
							<div className={"w-10 sm:w-14 text-center shrink-0 font-bold text-base sm:text-lg md:text-xl"}>
								{day.maxTemp}°
							</div>

							{/* Weather Icon */}
							<div className={"w-8 sm:w-10 flex items-center justify-center shrink-0"}>
								<WeatherIcon
									code={day.weatherCode}
									className={"w-6 h-6 sm:w-7 sm:h-7 text-white"}
								/>
							</div>

							{/* Morgen, Middag, Aften, Nat */}
							<div className={"flex-1 grid grid-cols-4 text-center items-center font-bold text-sm sm:text-base md:text-lg ml-2 sm:ml-4"}>
								<span>{day.morningTemp}°</span>
								<span>{day.noonTemp}°</span>
								<span>{day.eveningTemp}°</span>
								<span>{day.nightTemp}°</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
