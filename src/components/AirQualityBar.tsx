import React from "react";
import { motion } from "motion/react";

interface AirQualityBarProps {
  aqi: number;
  label: string;
}

export default function AirQualityBar({ aqi, label }: AirQualityBarProps) {
  // Normalize AQI (0 to 300 scale for visual fill)
  const maxAQI = 300;
  const fillPercentage = Math.min(Math.max((aqi / maxAQI) * 100, 5), 100);

  // Get dynamic color based on AQI values
  const getAQIColor = (val: number) => {
    if (val <= 50) return "bg-emerald-400";
    if (val <= 100) return "bg-amber-400";
    if (val <= 150) return "bg-orange-400";
    return "bg-rose-400";
  };

  const getAQITextColor = (val: number) => {
    if (val <= 50) return "text-emerald-400";
    if (val <= 100) return "text-amber-400";
    if (val <= 150) return "text-orange-400";
    return "text-rose-400";
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="text-3xl font-bold tracking-tight text-white flex items-baseline gap-2">
        {aqi}
        <span className={`text-base font-medium ${getAQITextColor(aqi)}`}>
          - {label}
        </span>
      </div>

      <div className="mt-4">
        {/* Progress bar container */}
        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
          <motion.div
            className={`h-full rounded-full ${getAQIColor(aqi)}`}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{ type: "spring", stiffness: 45, damping: 12 }}
          />
        </div>
        
        {/* Helper labels */}
        <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1.5 px-0.5">
          <span>0 (Good)</span>
          <span>100 (Mod)</span>
          <span>300+</span>
        </div>
      </div>
    </div>
  );
}
