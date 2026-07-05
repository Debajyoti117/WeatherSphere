import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getWeather } from "../services/weather";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const city = (req.query.city as string) || "New York City";

    const data = await getWeather(city);

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Unable to fetch weather",
    });
  }
}