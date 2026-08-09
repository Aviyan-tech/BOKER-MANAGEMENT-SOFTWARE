"use client";

import React from "react";

interface Props {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export default function VishwasGharLogo({ size = "md", showTagline = false }: Props) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 52 : 38;
  const nameClass =
    size === "sm"
      ? "text-base"
      : size === "lg"
      ? "text-3xl"
      : "text-xl";

  return (
    <div className="flex items-center gap-2.5">
      {/* SVG Icon — house + building + handshake inspired by logo */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Circular arc (blue) */}
        <path
          d="M8 32 C6 26, 7 18, 14 12"
          stroke="#1e3a8a"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Circular arc (green) */}
        <path
          d="M34 12 C41 18, 42 26, 40 32"
          stroke="#16a34a"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Building columns (dark blue) */}
        <rect x="10" y="10" width="4" height="16" rx="1" fill="#1e3a8a" />
        <rect x="16" y="6" width="4" height="20" rx="1" fill="#1e3a8a" />
        <rect x="22" y="8" width="3" height="10" rx="1" fill="#1e40af" />
        {/* House shape */}
        <path
          d="M20 28 L30 18 L40 28"
          stroke="#1e3a8a"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
        />
        <rect x="23" y="26" width="14" height="12" rx="1" fill="white" fillOpacity="0.15" stroke="#1e3a8a" strokeWidth="1.5" />
        {/* Door/window on house */}
        <rect x="27" y="28" width="4" height="4" rx="0.5" fill="#1e3a8a" fillOpacity="0.6" />
        {/* Checkmark / green tick inside house */}
        <path
          d="M26 33 L29 36 L35 28"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Handshake hint (two arcs meeting) */}
        <path
          d="M10 36 C14 32, 18 34, 20 36"
          stroke="#1e3a8a"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M28 36 C30 34, 34 32, 38 36"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight leading-none ${nameClass}`}>
          <span className="text-[#1e3a8a] dark:text-blue-300">VISHWAS </span>
          <span className="text-[#16a34a] dark:text-green-400">GHAR</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
            विश्वास तपाईको, घर हाम्रो
          </span>
        )}
      </div>
    </div>
  );
}
