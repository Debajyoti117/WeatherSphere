import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Settings, Bookmark, BookmarkCheck, CloudRain } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  currentCity: string;
  onSearch: (city: string) => void;
  onOpenSettings: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isLanding?: boolean;
  onGoHome?: () => void;
}

const POPULAR_SUGGESTIONS = [
  "New York City",
  "London",
  "Tokyo",
  "Paris",
  "Sydney",
  "Mumbai",
  "Rome",
  "Cairo",
];

export default function Header({
  currentCity,
  onSearch,
  onOpenSettings,
  isSaved,
  onToggleSave,
  isLanding = false,
  onGoHome,
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Simple real-time clock updating every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      setCurrentTime(now.toLocaleString("en-US", options).toUpperCase());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside suggestions to hide them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
      setShowSuggestions(false);
      setSearchVal("");
    }
  };

  const handleSuggestionClick = (city: string) => {
    onSearch(city);
    setShowSuggestions(false);
    setSearchVal("");
  };

  return (
    <header className="w-full top-0 sticky z-45 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto gap-4">
        
        {/* Brand Logo & Location Metadata */}
        <div 
          onClick={onGoHome}
          className={`flex items-center gap-4 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all`}
        >
          <div className="flex items-center gap-2">
            <CloudRain className="text-sky-400 animate-pulse" size={28} />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              WeatherSphere
            </h1>
          </div>
          
          {!isLanding && (
            <div className="hidden md:flex flex-col ml-4 border-l border-white/20 pl-4">
              <span className="text-lg font-semibold text-sky-300">{currentCity}</span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-white/50">
                {currentTime || "OCT 24, 10:42 AM"}
              </span>
            </div>
          )}
        </div>

        {/* Search bar & Controls */}
        <div className="flex items-center gap-4">
          
          {/* Responsive Search Input Container - Hidden on Landing */}
          {!isLanding && (
            <div ref={searchRef} className="relative hidden sm:block w-48 md:w-64">
              <form onSubmit={handleSubmit}>
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all shadow-inner"
                  placeholder="Search city..."
                />
              </form>

              {/* Popular suggestions list dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    className="absolute left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 p-2 space-y-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-[10px] font-semibold text-white/40 px-3 py-1.5 uppercase tracking-widest font-sans">
                      Popular suggestions
                    </div>
                    {POPULAR_SUGGESTIONS.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleSuggestionClick(city)}
                        className="w-full text-left px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action Button Controls */}
          <div className="flex items-center gap-2">
            {/* Bookmark Current searched City as Favorite - Hidden on Landing */}
            {!isLanding && (
              <button
                onClick={onToggleSave}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 border ${
                  isSaved
                    ? "bg-sky-400/10 border-sky-400/40 text-sky-400"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80 hover:text-white"
                }`}
                title={isSaved ? "Remove Favorite" : "Add to Favorites"}
              >
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            )}

            {/* Quick Location Detection Search trigger */}
            <button
              onClick={() => onSearch("New York City")}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 active:scale-95 text-white/80 hover:text-white animate-pulse"
              title="Locate Default City"
            >
              <MapPin size={18} />
            </button>

            {/* Settings toggle */}
            <button
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 active:scale-95 text-white/80 hover:text-white"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Header for Active Location metadata - Hidden on Landing */}
      {!isLanding && (
        <div className="md:hidden flex flex-col items-center justify-center py-2 bg-black/20 border-t border-white/5">
          <span className="text-base font-semibold text-sky-300">{currentCity}</span>
          <span className="text-[9px] font-mono font-bold tracking-wider text-white/40">
            {currentTime || "OCT 24, 10:42 AM"}
          </span>
        </div>
      )}
    </header>
  );
}
