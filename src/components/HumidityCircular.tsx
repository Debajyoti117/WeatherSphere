import React from "react";
import { motion } from "motion/react";

interface HumidityCircularProps {
  humidity: number;
}

export default function HumidityCircular({ humidity }: HumidityCircularProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.3
  const strokeDashoffset = circumference - (humidity / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center mt-2">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="8"
        />
        
        {/* Active Progress Circle */}
        <motion.circle
          className="text-sky-400"
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", stiffness: 50, damping: 14 }}
        />
      </svg>
      
      {/* Percentage text centered */}
      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white tracking-tight">
        {humidity}%
      </div>
    </div>
  );
}
