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

    res.status(200).json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to fetch weather",
    });
  }
}