export interface HourlyForecast {
  time: string;
  condition: "sunny" | "cloudy" | "partly_cloudy" | "rainy" | "snowy" | "stormy" | string;
  temp: number;
}

export interface DayForecast {
  day: string;
  condition: "sunny" | "cloudy" | "partly_cloudy" | "rainy" | "snowy" | "stormy" | string;
  high: number;
  low: number;
}

export interface WeatherData {
  location: string;
  currentCondition: string;
  shortStatus: string;
  temp: number;
  feelsLike: number;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  pressureStatus: string;
  airQuality: number;
  airQualityLabel: string;
  sunrise: string;
  sunset: string;
  hourly: HourlyForecast[];
  forecast7Day: DayForecast[];
}

export type TempUnit = "C" | "F";
