import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { getWeather } from "./services/weather";

dotenv.config({ path: ".env.local" });
console.log("Weather Key:", process.env.WEATHER_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry and fallback checking
let aiClient: GoogleGenAI | null = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY && GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Using high-fidelity local weather simulation engine.");
}

// Preset weather data for popular cities
const DEFAULT_WEATHER_DATA: Record<string, any> = {
  "new york city": {
    location: "New York City",
    currentCondition: "Mostly Cloudy",
    shortStatus: "Expect clearing skies by late afternoon.",
    temp: 24,
    feelsLike: 26,
    high: 29,
    low: 20,
    humidity: 72,
    windSpeed: 18,
    windDirection: "NE",
    pressure: 993.2,
    pressureStatus: "Currently falling rapidly",
    airQuality: 42,
    airQualityLabel: "Good",
    sunrise: "06:12 AM",
    sunset: "07:34 PM",
    hourly: [
      { time: "Now", condition: "cloudy", temp: 24 },
      { time: "11 AM", condition: "cloudy", temp: 25 },
      { time: "12 PM", condition: "partly_cloudy", temp: 27 },
      { time: "1 PM", condition: "partly_cloudy", temp: 28 },
      { time: "2 PM", condition: "sunny", temp: 29 },
      { time: "3 PM", condition: "sunny", temp: 29 },
      { time: "4 PM", condition: "partly_cloudy", temp: 28 }
    ],
    forecast7Day: [
      { day: "MON", condition: "sunny", high: 31, low: 24 },
      { day: "TUE", condition: "cloudy", high: 29, low: 22 },
      { day: "WED", condition: "rainy", high: 26, low: 20 },
      { day: "THU", condition: "partly_cloudy", high: 27, low: 21 },
      { day: "FRI", condition: "sunny", high: 30, low: 23 },
      { day: "SAT", condition: "sunny", high: 32, low: 25 },
      { day: "SUN", condition: "partly_cloudy", high: 29, low: 22 }
    ]
  },
  "london": {
    location: "London",
    currentCondition: "Drizzle",
    shortStatus: "Cool and damp with light rain continuing into evening.",
    temp: 16,
    feelsLike: 15,
    high: 18,
    low: 12,
    humidity: 85,
    windSpeed: 22,
    windDirection: "SW",
    pressure: 1008.5,
    pressureStatus: "Rising slowly",
    airQuality: 28,
    airQualityLabel: "Good",
    sunrise: "05:45 AM",
    sunset: "08:55 PM",
    hourly: [
      { time: "Now", condition: "rainy", temp: 16 },
      { time: "11 AM", condition: "rainy", temp: 16 },
      { time: "12 PM", condition: "cloudy", temp: 17 },
      { time: "1 PM", condition: "cloudy", temp: 17 },
      { time: "2 PM", condition: "partly_cloudy", temp: 18 },
      { time: "3 PM", condition: "cloudy", temp: 18 },
      { time: "4 PM", condition: "rainy", temp: 16 }
    ],
    forecast7Day: [
      { day: "MON", condition: "rainy", high: 18, low: 12 },
      { day: "TUE", condition: "cloudy", high: 19, low: 13 },
      { day: "WED", condition: "partly_cloudy", high: 21, low: 14 },
      { day: "THU", condition: "sunny", high: 22, low: 15 },
      { day: "FRI", condition: "cloudy", high: 19, low: 13 },
      { day: "SAT", condition: "rainy", high: 17, low: 12 },
      { day: "SUN", condition: "partly_cloudy", high: 18, low: 11 }
    ]
  },
  "tokyo": {
    location: "Tokyo",
    currentCondition: "Sunny",
    shortStatus: "Clear blue skies with comfortable temperatures all day.",
    temp: 26,
    feelsLike: 27,
    high: 28,
    low: 19,
    humidity: 50,
    windSpeed: 10,
    windDirection: "S",
    pressure: 1015.0,
    pressureStatus: "Steady",
    airQuality: 55,
    airQualityLabel: "Moderate",
    sunrise: "04:35 AM",
    sunset: "06:45 PM",
    hourly: [
      { time: "Now", condition: "sunny", temp: 26 },
      { time: "11 AM", condition: "sunny", temp: 27 },
      { time: "12 PM", condition: "sunny", temp: 28 },
      { time: "1 PM", condition: "sunny", temp: 28 },
      { time: "2 PM", condition: "sunny", temp: 27 },
      { time: "3 PM", condition: "sunny", temp: 26 },
      { time: "4 PM", condition: "partly_cloudy", temp: 25 }
    ],
    forecast7Day: [
      { day: "MON", condition: "sunny", high: 28, low: 19 },
      { day: "TUE", condition: "sunny", high: 29, low: 20 },
      { day: "WED", condition: "partly_cloudy", high: 27, low: 18 },
      { day: "THU", condition: "cloudy", high: 25, low: 17 },
      { day: "FRI", condition: "rainy", high: 22, low: 16 },
      { day: "SAT", condition: "sunny", high: 26, low: 18 },
      { day: "SUN", condition: "sunny", high: 27, low: 19 }
    ]
  }
};

app.get("/api/weather", async (req, res) => {
  try {
    const city = (req.query.city as string) || "New York City";

    const data = await getWeather(city);

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

      airQuality: Math.round(
        data.current.air_quality?.["us-epa-index"] || 1
      ),
      airQualityLabel: "Good",

      sunrise: data.forecast.forecastday[0].astro.sunrise,
      sunset: data.forecast.forecastday[0].astro.sunset,

      hourly: data.forecast.forecastday[0].hour
        .slice(0, 7)
        .map((h: any) => ({
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

    res.json(weather);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Unable to fetch weather",
    });
  }
});



// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WeatherSphere server running on http://localhost:${PORT}`);
  });
}

startServer();
