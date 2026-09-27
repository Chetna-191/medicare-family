import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  showPercent?: boolean;
  color?: 'emerald' | 'sky' | 'indigo' | 'amber' | 'rose' | 'teal';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  subLabel,
  showPercent = true,
  color = 'teal',
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const colorMap = {
    teal: {
      stroke: '#2A9D8F',
      bg: '#EAF6F6',
      track: '#d6edf7',
      glow: 'rgba(42, 157, 143, 0.35)',
      text: 'text-[#0F766E]',
    },
    emerald: {
      stroke: '#2A9D8F',
      bg: '#EAF6F6',
      track: '#d6edf7',
      glow: 'rgba(42, 157, 143, 0.35)',
      text: 'text-[#0F766E]',
    },
    sky: {
      stroke: '#3B82F6',
      bg: '#e0f2fe',
      track: '#d6edf7',
      glow: 'rgba(59, 130, 246, 0.35)',
      text: 'text-blue-700',
    },
    indigo: {
      stroke: '#4F46E5',
      bg: '#e0e7ff',
      track: '#e0e7ff',
      glow: 'rgba(79, 70, 229, 0.35)',
      text: 'text-indigo-700',
    },
    amber: {
      stroke: '#D97706',
      bg: '#fef3c7',
      track: '#fde68a',
      glow: 'rgba(217, 119, 6, 0.35)',
      text: 'text-amber-800',
    },
    rose: {
      stroke: '#E11D48',
      bg: '#ffe4e6',
      track: '#fecdd3',
      glow: 'rgba(225, 29, 72, 0.35)',
      text: 'text-rose-700',
    },
  };

  const currentTheme = colorMap[color] || colorMap.teal;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 filter drop-shadow-sm"
        style={{ filter: `drop-shadow(0 4px 8px ${currentTheme.glow})` }}
      >
        {/* Background Track with soft blue tint */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={currentTheme.track}
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={currentTheme.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {showPercent && (
          <span className={`text-xl font-extrabold tracking-tight ${currentTheme.text}`}>
            {normalizedProgress}%
          </span>
        )}
        {label && <span className="text-xs font-semibold text-slate-600">{label}</span>}
      </div>
      {subLabel && <span className="text-xs text-slate-600 mt-1 font-semibold">{subLabel}</span>}
    </div>
  );
};
