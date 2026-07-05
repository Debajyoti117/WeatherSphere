import axios from "axios";

export async function getWeather(city: string) {
  const API_KEY = process.env.WEATHER_API_KEY;

  if (!API_KEY) {
    throw new Error("Weather API key not found.");
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=yes&alerts=yes`;

  const { data } = await axios.get(url);

  return data;
}