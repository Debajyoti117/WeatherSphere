import React from "react";
import { X, Trash2, Globe, Thermometer, Droplets, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TempUnit } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempUnit: TempUnit;
  setTempUnit: (unit: TempUnit) => void;
  savedCities: string[];
  onRemoveCity: (city: string) => void;
  onSelectCity: (city: string) => void;
  backgroundEffect: "rain" | "glass";
  setBackgroundEffect: (effect: "rain" | "glass") => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  tempUnit,
  setTempUnit,
  savedCities,
  onRemoveCity,
  onSelectCity,
  backgroundEffect,
  setBackgroundEffect,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glass blur */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-md rounded-3xl glass-panel border border-white/20 p-6 z-10 overflow-hidden shadow-2xl"
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-sans font-bold text-white flex items-center gap-2">
              <span>Settings</span>
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors duration-300 text-white/70 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Temperature Units */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <Thermometer size={12} className="text-sky-400" />
                Temperature Unit
              </label>
              <div className="grid grid-cols-2 gap-2 bg-black/30 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setTempUnit("C")}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    tempUnit === "C"
                      ? "bg-sky-400 text-black shadow"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  onClick={() => setTempUnit("F")}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    tempUnit === "F"
                      ? "bg-sky-400 text-black shadow"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            {/* Atmosphere / Background Effect */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <Droplets size={12} className="text-sky-400" />
                Background Canvas
              </label>
              <div className="grid grid-cols-2 gap-2 bg-black/30 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setBackgroundEffect("rain")}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    backgroundEffect === "rain"
                      ? "bg-sky-400 text-black shadow"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Liquid Rain raindrops
                </button>
                <button
                  onClick={() => setBackgroundEffect("glass")}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    backgroundEffect === "glass"
                      ? "bg-sky-400 text-black shadow"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Frosted Glacial Glass
                </button>
              </div>
            </div>

            {/* Favorite / Saved Cities */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <Globe size={12} className="text-sky-400" />
                Favorite Cities ({savedCities.length})
              </label>
              {savedCities.length === 0 ? (
                <div className="text-sm text-white/40 italic p-3 text-center bg-black/20 rounded-xl border border-white/5">
                  No saved cities yet. Click the location bookmark pin next to search to save!
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 hide-scrollbar">
                  {savedCities.map((city) => (
                    <div
                      key={city}
                      className="flex justify-between items-center px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <button
                        onClick={() => {
                          onSelectCity(city);
                          onClose();
                        }}
                        className="text-sm font-medium text-white/90 hover:text-white text-left truncate flex-1"
                      >
                        {city}
                      </button>
                      <button
                        onClick={() => onRemoveCity(city)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gemini Grounding Info Section */}
            <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-400/10 flex gap-3 text-xs leading-relaxed text-sky-200">
              <Info size={16} className="text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Gemini Search Grounding enabled</span>
                Searching triggers Gemini AI to run Google search queries, pulling authentic real-time temperatures, hourly intervals, and local pressure details directly from the web!
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
