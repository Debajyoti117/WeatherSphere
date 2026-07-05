import React from "react";
import { motion } from "motion/react";

interface CompassProps {
  direction: string;
  speed: number;
}

const directionToAngle: Record<string, number> = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

export default function Compass({ direction, speed }: CompassProps) {
  // Fallback if direction doesn't match perfectly
  const angle = directionToAngle[direction.toUpperCase()] ?? 45;

  return (
    <div className="flex items-center gap-4 mt-2">
      {/* Visual Compass */}
      <div className="relative w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-black/30 shadow-inner">
        {/* Cardinal Directions */}
        <span className="absolute top-1 text-[9px] font-sans text-white/40 select-none">N</span>
        <span className="absolute bottom-1 text-[9px] font-sans text-white/40 select-none">S</span>
        <span className="absolute left-1.5 text-[9px] font-sans text-white/40 select-none">W</span>
        <span className="absolute right-1.5 text-[9px] font-sans text-white/40 select-none">E</span>

        {/* Animated Compass Needle */}
        <motion.div
          className="relative w-1 h-12 flex items-center justify-center"
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          {/* North Needle */}
          <div className="absolute top-0 w-1.5 h-6 bg-sky-400 rounded-t-full" />
          {/* South Needle */}
          <div className="absolute bottom-0 w-1.5 h-6 bg-white/20 rounded-b-full" />
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-sky-300 rounded-full border border-black/30 shadow" />
        </motion.div>
      </div>

      {/* Wind Stats */}
      <div className="flex flex-col">
        <div className="text-2xl font-sans font-semibold text-white tracking-tight">
          {speed} <span className="text-sm font-normal text-white/60 font-mono">km/h</span>
        </div>
        <div className="text-sm font-sans font-medium text-sky-300 flex items-center gap-1">
          <span>{direction}</span>
          <span className="text-white/40">•</span>
          <span className="text-white/60">Wind Direction</span>
        </div>
      </div>
    </div>
  );
}
