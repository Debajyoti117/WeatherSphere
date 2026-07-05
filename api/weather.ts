import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const city = (req.query.city as string) || "New York City";

    const API_KEY = process.env.WEATHER_API_KEY;

    const { data } = await axios.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
        city
      )}&days=7&aqi=yes&alerts=yes`
    );

    const weather = {
  location: data.location.name,
  currentCondition: data.current.condition.text,
  shortStatus: data.current.condition.text,

  temp: data.current.temp_c,
  feelsLike: data.current.feelslike_c,

  high: data.forecast.forecastday[0].day.maxtemp_c,
  low: data.forecast.forecastday[0].day.mintemp_c,

  humidity: data.current.humidity,

  windSpeed: data.current.wind_kph,
  windDirection: data.current.wind_dir,

  pressure: data.current.pressure_mb,
  pressureStatus: "Stable",

  airQuality: Math.round(data.current.air_quality?.["us-epa-index"] || 1),
  airQualityLabel: "Good",

  sunrise: data.forecast.forecastday[0].astro.sunrise,
  sunset: data.forecast.forecastday[0].astro.sunset,

  hourly: data.forecast.forecastday[0].hour.slice(0, 7).map((h: any) => ({
    time: h.time.split(" ")[1],
    condition: h.condition.text,
    temp: h.temp_c,
  })),

  forecast7Day: data.forecast.forecastday.map((d: any) => ({
    day: new Date(d.date)
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase(),
    condition: d.day.condition.text,
    high: d.day.maxtemp_c,
    low: d.day.mintemp_c,
  })),
};

res.status(200).json(weather);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to fetch weather",
    });
  }
}