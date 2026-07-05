import React from "react";
import { motion } from "motion/react";

interface PressureGaugeProps {
  pressure: number;
}

export default function PressureGauge({ pressure }: PressureGaugeProps) {
  // Normalize pressure between 950 and 1050 for visualization percentage
  const minP = 950;
  const maxP = 1050;
  const percentage = Math.min(Math.max((pressure - minP) / (maxP - minP), 0), 1);
  
  // Circumference calculation for semicircle track
  // SVG radius is 70, path is 140 width, 140 radius
  // Semicircle stroke-dasharray is roughly 220 (PI * R)
  const radius = 70;
  const strokeLength = Math.PI * radius; // 219.9
  const strokeDashoffset = strokeLength - percentage * strokeLength;

  return (
    <div className="relative flex flex-col items-center justify-center mt-4">
      {/* Gauge SVG */}
      <svg className="w-full max-w-[220px] h-auto" viewBox="0 0 200 120">
        {/* Semicircle Background Track */}
        <path
          d="M 30 100 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeLinecap="round"
          strokeWidth="12"
        />
        
        {/* Semicircle Active Indicator (Sky blue) */}
        <motion.path
          d="M 30 100 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="#38bdf8"
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={strokeLength}
          initial={{ strokeDashoffset: strokeLength }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", stiffness: 45, damping: 12 }}
        />

        {/* Ticks */}
        <g stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5">
          <line x1="100" x2="100" y1="22" y2="30" />
          <line x1="42" x2="50" y1="82" y2="78" />
          <line x1="158" x2="150" y1="82" y2="78" />
        </g>
      </svg>

      {/* Value Overlay inside center of gauge */}
      <div className="absolute bottom-2 flex flex-col items-center">
        <motion.span 
          className="text-4xl font-bold text-white tracking-tight"
          key={pressure}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {pressure.toFixed(1)}
        </motion.span>
        <span className="text-sm font-semibold font-sans text-white/50 tracking-wide uppercase">
          mb
        </span>
      </div>
    </div>
  );
}
