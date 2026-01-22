'use client';

import { useState } from 'react';
import { CEFRLevel, LEVEL_NAMES, LEVEL_DESCRIPTIONS, LEVEL_COLORS } from '@/types';

interface LevelCardProps {
  level: CEFRLevel;
  onClick: (level: CEFRLevel) => void;
}

export default function LevelCard({ level, onClick }: LevelCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${LEVEL_COLORS[level]} hover:scale-105 hover:shadow-lg`}
      onClick={() => onClick(level)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center">
        <span className="text-2xl font-bold text-gray-800">{level}</span>
        <p className="text-sm text-gray-600 mt-1">{LEVEL_NAMES[level]}</p>
      </div>

      {/* 호버 툴팁 */}
      {isHovered && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 w-64 p-3 bg-[#3D3228] text-white text-sm rounded-lg shadow-lg">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#3D3228]"></div>
          {LEVEL_DESCRIPTIONS[level]}
        </div>
      )}
    </button>
  );
}
