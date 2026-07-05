import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  Thermometer, 
  Droplets, 
  Wind, 
  Compass as CompassIcon,
  Sunrise, 
  Sunset, 
  Calendar,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import { WeatherData, TempUnit } from "./types";
import Header from "./components/Header";
import SettingsModal from "./components/SettingsModal";
import Compass from "./components/Compass";
import PressureGauge from "./components/PressureGauge";
import HumidityCircular from "./components/HumidityCircular";
import AirQualityBar from "./components/AirQualityBar";

const BG_IMAGE_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuA-lZfuornuam2CDolJRmFeyb1Pk3JGyKjnv3djBb1ziuQINm4t7ViIeUxD6E4kmNUfb-hs4OzWwFHAZb728qb-cqrxauty_I6SggjZy6MyxJd7aR6g_ho8SGic0NQj_AmD6fv-i5M4KldoLiw7tQnFb_GMI1Yr_fU-vwUdxZmwq01H3S5_5sR7jDyf_RjmWco_gCbFAlKB9t5yDjdWH-96Y3TNjUwiN9wiF7DGVGfdwXygph_AP0f_roi25ND4URDikojxGcJMjHc";
const LANDING_BG_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuD-96Xca0-phC_NjwnLY1jA_KhLtoDwtJtAQiV9rUVKtE_UobSMR8AMtL7zxcutl-vN16bostnxGRh9SNiZ_gP_uCYe-8XFXVQoW_eqvWgrDh1bXqOYDWoc_a9ksoslu0JJnRpK4tS1FPZWV5iyA16esbWTPmSliChh72OWqyUpWHsKLABa7aJxY64IsnNCFN1VcKRN1phThMAUxZk5MY9Hm7gDqLjFYiE-Zg1vxjmZRia5NYv01bRjZlAJ7nwcESRWKOUYjXjzROE";

// Mapping of weather categories to animated Lucide Icons
const getWeatherIcon = (condition: string, size: number = 24) => {
  const cond = (condition || "").toLowerCase();
  if (cond.includes("sunny") || cond.includes("clear")) {
    return <Sun size={size} className="text-amber-400 animate-[spin_30s_linear_infinite]" />;
  }
  if (cond.includes("mostly cloudy") || cond.includes("overcast")) {
    return <Cloud size={size} className="text-sky-200 animate-[pulse_3s_ease-in-out_infinite]" />;
  }
  if (cond.includes("partly") || cond.includes("cloudy")) {
    return <CloudSun size={size} className="text-sky-300" />;
  }
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower") || cond.includes("precip") || cond.includes("heavy rain")) {
    return <CloudRain size={size} className="text-sky-400 animate-[bounce_2s_infinite]" />;
  }
  if (cond.includes("storm") || cond.includes("thunder") || cond.includes("lightning")) {
    return <CloudLightning size={size} className="text-amber-300 animate-[pulse_1.5s_infinite]" />;
  }
  if (cond.includes("snow") || cond.includes("ice") || cond.includes("frost") || cond.includes("freeze")) {
    return <Snowflake size={size} className="text-sky-100 animate-spin" style={{ animationDuration: "12s" }} />;
  }
  return <CloudSun size={size} className="text-sky-300" />;
};

const getWeatherTheme = (condition: string) => {
  const cond = (condition || "").toLowerCase();
  if (cond.includes("sunny") || cond.includes("clear")) {
    return {
      bgGlow: "from-amber-400/20 via-sky-400/10 to-transparent",
      accent: "text-amber-400",
      pillClass: "border-amber-400/20 bg-amber-400/5 text-amber-300",
    };
  }
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("storm") || cond.includes("shower")) {
    return {
      bgGlow: "from-sky-500/25 via-blue-600/10 to-transparent",
      accent: "text-sky-400",
      pillClass: "border-sky-400/20 bg-sky-400/5 text-sky-300",
    };
  }
  if (cond.includes("snow") || cond.includes("freeze")) {
    return {
      bgGlow: "from-blue-200/20 via-indigo-400/5 to-transparent",
      accent: "text-white",
      pillClass: "border-white/20 bg-white/5 text-white",
    };
  }
  return {
    bgGlow: "from-sky-300/20 via-indigo-500/10 to-transparent",
    accent: "text-sky-300",
    pillClass: "border-sky-400/20 bg-sky-400/5 text-sky-300",
  };
};

const loadingFacts = [
  "Contacting Google Search engine...",
  "Retrieving local barometric updates...",
  "Formatting responsive layout matrices...",
  "Refracting atmospheric crystal layers...",
  "Evaluating thermodynamic dewpoints..."
];

export default function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLanding, setIsLanding] = useState(true);
  const [landingSearch, setLandingSearch] = useState("");
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  // User preferences with LocalStorage persistence
  const [tempUnit, setTempUnit] = useState<TempUnit>(() => {
    return (localStorage.getItem("ws_temp_unit") as TempUnit) || "C";
  });
  const [savedCities, setSavedCities] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ws_saved_cities");
      return saved ? JSON.parse(saved) : ["New York City", "Tokyo", "London"];
    } catch {
      return ["New York City", "Tokyo", "London"];
    }
  });
  const [backgroundEffect, setBackgroundEffect] = useState<"rain" | "glass">(() => {
    return (localStorage.getItem("ws_bg_effect") as "rain" | "glass") || "rain";
  });

  // Keep localStorage in sync with state changes
  useEffect(() => {
    localStorage.setItem("ws_temp_unit", tempUnit);
  }, [tempUnit]);

  useEffect(() => {
    localStorage.setItem("ws_saved_cities", JSON.stringify(savedCities));
  }, [savedCities]);

  useEffect(() => {
    localStorage.setItem("ws_bg_effect", backgroundEffect);
  }, [backgroundEffect]);

  // Loading facts rotation cycle
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % loadingFacts.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  const fetchWeather = async (city: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error("Weather request failed");
      const data: WeatherData = await res.json();
      setWeatherData(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch weather. Reverting to typical simulated data.");
    } finally {
      setLoading(false);
    }
  };

  // Prefetch default city silently on mount
  useEffect(() => {
    const prefetch = async () => {
      try {
        const res = await fetch(`/api/weather?city=New York City`);
        if (res.ok) {
          const data: WeatherData = await res.json();
          setWeatherData(data);
        }
      } catch (err) {
        console.error("Silent prefetch failed", err);
      }
    };
    prefetch();
  }, []);

  const handleSearch = (city: string) => {
    fetchWeather(city);
    setIsLanding(false);
  };

  const handleLandingSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (landingSearch.trim()) {
      fetchWeather(landingSearch.trim());
      setIsLanding(false);
      setLandingSearch("");
    }
  };

  const handleToggleSave = () => {
    if (!weatherData) return;
    const currentName = weatherData.location;
    const isAlreadySaved = savedCities.some(
      (c) => c.toLowerCase() === currentName.toLowerCase()
    );

    if (isAlreadySaved) {
      setSavedCities((prev) =>
        prev.filter((c) => c.toLowerCase() !== currentName.toLowerCase())
      );
    } else {
      setSavedCities((prev) => [...prev, currentName]);
    }
  };

  const handleRemoveCity = (city: string) => {
    setSavedCities((prev) =>
      prev.filter((c) => c.toLowerCase() !== city.toLowerCase())
    );
  };

  // Temperature formatter
  const formatValue = (celsiusValue: number) => {
    if (tempUnit === "F") {
      return `${Math.round((celsiusValue * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsiusValue)}°`;
  };

  const activeTheme = weatherData 
    ? getWeatherTheme(weatherData.currentCondition)
    : getWeatherTheme("cloudy");

  const isCurrentCitySaved = weatherData
    ? savedCities.some((c) => c.toLowerCase() === weatherData.location.toLowerCase())
    : false;

  return (
    <div className="min-h-screen text-white font-sans antialiased relative overflow-x-hidden pb-12">
      
      {/* Background Layer with choice of rain drops or solid glass */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden z-[-2] transition-all duration-1000"
        style={{
          backgroundImage: `url(${isLanding ? LANDING_BG_URL : (backgroundEffect === "rain" ? BG_IMAGE_URL : "")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundColor: "#0a0e1a"
        }}
      />

      {/* Atmospheric dynamic gradient aura glows */}
      {!isLanding && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] transition-all duration-1000">
          <motion.div 
            className={`absolute top-[10%] right-[5%] w-[450px] h-[450px] rounded-full blur-[140px] bg-gradient-to-br ${activeTheme.bgGlow}`}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="absolute bottom-[10%] left-[5%] w-[380px] h-[380px] bg-slate-500/5 rounded-full blur-[120px]" />
        </div>
      )}

      {/* Polished Header */}
      <Header
        currentCity={weatherData?.location || "New York City"}
        onSearch={handleSearch}
        onOpenSettings={() => setSettingsOpen(true)}
        isSaved={isCurrentCitySaved}
        onToggleSave={handleToggleSave}
        isLanding={isLanding}
        onGoHome={() => setIsLanding(true)}
      />

      {/* Interactive Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          
          {isLanding ? (
            /* Gorgeous Interactive Landing Screen */
            <motion.div
              key="landing-screen"
              className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-12 px-4 min-h-[60vh]"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
            >
              <div className="glass-panel w-full rounded-3xl p-8 md:p-12 flex flex-col items-center text-center backdrop-blur-[35px] border border-white/20 shadow-2xl relative overflow-hidden bg-white/35">
                {/* Decorative glowing sphere */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

                <h1 className="text-5xl md:text-6xl font-sans font-extrabold text-[#000080] mb-4 tracking-tight drop-shadow-sm select-none">
                  WeatherSphere
                </h1>
                <p className="text-base md:text-lg font-sans font-medium text-slate-800/90 mb-8 max-w-lg leading-relaxed">
                  Beautiful real-time weather forecasts for anywhere in the world.
                </p>

                {/* Search Interaction Vessel */}
                <form onSubmit={handleLandingSearchSubmit} className="w-full max-w-md relative group">
                  <div className="relative flex items-center bg-white/70 backdrop-blur-[20px] rounded-full px-5 py-3.5 border border-white/40 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/25 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-slate-900">
                    <Search size={22} className="text-[#000080]/70 mr-3 shrink-0" />
                    <input
                      type="text"
                      value={landingSearch}
                      onChange={(e) => setLandingSearch(e.target.value)}
                      className="bg-transparent border-none outline-none text-base md:text-lg font-semibold text-[#000080] placeholder-[#000080]/50 w-full focus:outline-none focus:ring-0 p-0"
                      placeholder="Search city, zip code, or place..."
                    />
                    <button 
                      type="submit"
                      className="bg-[#000080] hover:bg-[#000080]/90 text-white rounded-full p-2 ml-2 transition-colors duration-200 active:scale-95 shrink-0 flex items-center justify-center"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </form>

                {/* Popular Location Shortcuts */}
                <div className="mt-10 w-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#000080]/50 block mb-4">
                    Popular locations
                  </span>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                    {["New York City", "London", "Tokyo", "Paris", "Sydney", "Mumbai"].map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          fetchWeather(city);
                          setIsLanding(false);
                        }}
                        className="px-4 py-2 rounded-full text-xs font-bold bg-[#000080]/5 hover:bg-[#000080]/15 text-[#000080]/85 transition-all active:scale-95 border border-[#000080]/10"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : loading ? (
            /* Immersive Custom Loading Panel */
            <motion.div
              key="loading-panel"
              className="w-full h-[60vh] flex flex-col items-center justify-center rounded-3xl glass-panel border border-white/10 p-8 text-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                <RefreshCw size={44} className="text-sky-400 animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400/20 animate-ping" />
              </div>

              <h4 className="text-lg font-bold font-sans text-white/90 mb-1 tracking-tight">
                Grounding Atmospheric Data
              </h4>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={factIndex}
                  className="text-sm font-mono text-white/50 h-5"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {loadingFacts[factIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : weatherData ? (
            /* Beautiful main dashboard grid layout matching the design reference */
            <motion.div
              key="weather-grid"
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              
              {/* Top Grid: Hero Forecast + Pressure trend */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. Hero Condition Card (Spans 8 columns on desktop) */}
                <div className="md:col-span-8 rounded-3xl glass-panel p-6 flex flex-col justify-between relative overflow-hidden min-h-[360px] border border-white/12 shadow-2xl">
                  {/* Subtle environmental ambient light */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-0`} />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          {getWeatherIcon(weatherData.currentCondition, 40)}
                          <h2 className="text-3xl font-sans font-bold text-white tracking-tight">
                            {weatherData.currentCondition}
                          </h2>
                        </div>
                        <p className="text-sm text-white/60 font-mono font-medium max-w-sm">
                          {weatherData.shortStatus}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-7xl md:text-8xl font-sans font-bold text-white tracking-tighter leading-none">
                          {formatValue(weatherData.temp)}
                        </div>
                        <div className="text-sm font-semibold text-white/60 mt-2 font-mono">
                          H: {formatValue(weatherData.high)} &nbsp; L: {formatValue(weatherData.low)}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Chips */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <div className={`weather-chip rounded-full px-4 py-2.5 flex items-center gap-2 border border-white/5`}>
                        <Thermometer size={14} className="text-sky-300" />
                        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-white">
                          Feels like {formatValue(weatherData.feelsLike)}
                        </span>
                      </div>
                      <div className={`weather-chip rounded-full px-4 py-2.5 flex items-center gap-2 border border-white/5`}>
                        <Droplets size={14} className="text-sky-300" />
                        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-white">
                          Humidity {weatherData.humidity}%
                        </span>
                      </div>
                      <div className={`weather-chip rounded-full px-4 py-2.5 flex items-center gap-2 border border-white/5`}>
                        <Wind size={14} className="text-sky-300" />
                        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-white">
                          Wind {weatherData.windSpeed} km/h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Pressure gauge Card (Spans 4 columns on desktop) */}
                <div className="md:col-span-4 rounded-3xl glass-panel p-6 flex flex-col justify-between border border-white/12 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <RefreshCw size={16} className="text-white/40 animate-spin-slow" />
                    <h3 className="text-xs font-sans font-bold text-white/50 tracking-widest uppercase">
                      Pressure
                    </h3>
                  </div>

                  <div className="mb-4">
                    <p className="text-lg font-sans font-semibold text-white/95 leading-snug">
                      {weatherData.pressureStatus}
                    </p>
                  </div>

                  {/* High-fidelity custom pressure SVG Gauge */}
                  <PressureGauge pressure={weatherData.pressure} />
                </div>
              </div>

              {/* Middle Grid: Hourly Forecast */}
              <div className="rounded-3xl glass-panel p-6 border border-white/12 shadow-2xl">
                <h3 className="text-xs font-sans font-bold text-white/50 tracking-widest uppercase mb-6 flex items-center gap-2">
                  <RefreshCw size={14} className="text-white/40" />
                  Hourly Forecast
                </h3>

                <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-2">
                  {weatherData.hourly.map((item, idx) => (
                    <div 
                      key={`${item.time}-${idx}`}
                      className="flex flex-col items-center min-w-[70px] gap-2 p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                    >
                      <span className="text-xs font-sans text-white/80 font-medium">
                        {item.time}
                      </span>
                      <div className="my-1">
                        {getWeatherIcon(item.condition, 26)}
                      </div>
                      <span className="text-base font-sans font-semibold text-white mt-1">
                        {formatValue(item.temp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lower Widgets: Air Quality, Humidity, Sunrise/Sunset, Wind Compass */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                
                {/* 1. Air Quality Widget */}
                <div className="rounded-3xl glass-panel p-6 flex flex-col justify-between border border-white/12 shadow-2xl">
                  <h3 className="text-xs font-sans font-bold text-white/50 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                    <RefreshCw size={14} className="text-white/40" />
                    Air Quality
                  </h3>
                  <AirQualityBar aqi={weatherData.airQuality} label={weatherData.airQualityLabel} />
                </div>

                {/* 2. Humidity Widget */}
                <div className="rounded-3xl glass-panel p-6 flex flex-col justify-between items-center border border-white/12 shadow-2xl">
                  <h3 className="text-xs font-sans font-bold text-white/50 tracking-widest uppercase mb-4 w-full text-left flex items-center gap-1.5">
                    <Droplets size={14} className="text-white/40" />
                    Humidity
                  </h3>
                  <HumidityCircular humidity={weatherData.humidity} />
                </div>

                {/* 3. Sunrise & Sunset Widget */}
                <div className="rounded-3xl glass-panel p-6 flex flex-col justify-between border border-white/12 shadow-2xl">
                  <h3 className="text-xs font-sans font-bold text-white/50 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                    <Sunrise size={14} className="text-white/40" />
                    Sunrise & Sunset
                  </h3>
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white/50">Sunrise</span>
                      <span className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                        <Sunrise size={14} className="text-amber-400" />
                        {weatherData.sunrise}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                      <span className="text-xs font-semibold text-white/50">Sunset</span>
                      <span className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                        <Sunset size={14} className="text-indigo-400" />
                        {weatherData.sunset}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Interactive Wind Compass Widget */}
                <div className="rounded-3xl glass-panel p-6 flex flex-col justify-between border border-white/12 shadow-2xl">
                  <h3 className="text-xs font-sans font-bold text-white/50 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                    <Wind size={14} className="text-white/40" />
                    Wind speed
                  </h3>
                  <Compass direction={weatherData.windDirection} speed={weatherData.windSpeed} />
                </div>

              </div>

              {/* 7-Day Forecast Grid Row */}
              <div className="rounded-3xl glass-panel p-6 border border-white/12 shadow-2xl">
                <h3 className="text-xs font-sans font-bold text-white/50 tracking-widest uppercase mb-6 flex items-center gap-2">
                  <Calendar size={14} className="text-white/40" />
                  7-Day Forecast
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weatherData.forecast7Day.map((dayItem, idx) => (
                    <div 
                      key={`${dayItem.day}-${idx}`}
                      className="weather-chip rounded-2xl p-4 flex md:flex-col items-center justify-between md:justify-center gap-4 hover:scale-[1.02] transition-transform"
                    >
                      <span className="text-sm font-sans font-bold text-white w-12 md:w-auto text-left md:text-center">
                        {dayItem.day}
                      </span>
                      <div className="my-1.5">
                        {getWeatherIcon(dayItem.condition, 28)}
                      </div>
                      <div className="flex md:flex-col items-center gap-2 md:gap-0">
                        <span className="text-base font-sans font-bold text-white">
                          {formatValue(dayItem.high)}
                        </span>
                        <span className="text-xs font-sans text-white/40 font-semibold">
                          {formatValue(dayItem.low)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            /* Fallback empty view or error state */
            <motion.div
              key="error-panel"
              className="w-full text-center py-16 rounded-3xl glass-panel border border-white/10 p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle className="mx-auto text-rose-400 mb-4" size={48} />
              <p className="text-lg font-sans font-semibold mb-6">
                {error || "An unexpected issue occurred retrieving climate data."}
              </p>
              <button
                onClick={() => fetchWeather("New York City")}
                className="px-6 py-2.5 rounded-full bg-sky-400 text-black font-semibold hover:bg-sky-300 transition-colors"
              >
                Reload Default City
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Global Interactive Settings Dialog overlay */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        savedCities={savedCities}
        onRemoveCity={handleRemoveCity}
        onSelectCity={(city) => fetchWeather(city)}
        backgroundEffect={backgroundEffect}
        setBackgroundEffect={setBackgroundEffect}
      />
    </div>
  );
}
