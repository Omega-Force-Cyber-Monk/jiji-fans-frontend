"use client";

import React from "react";

interface StatusSealProps {
  status: "PENDING" | "REJECTED" | "SUSPENDED";
}

const SEAL_CONFIG = {
  PENDING: {
    topText: "UNDER",
    bottomText: "REVIEW",
    color: "var(--brand-primary)",
    textColor: "#ffffff",
  },
  REJECTED: {
    topText: "APPLICATION",
    bottomText: "REJECTED",
    color: "var(--error)",
    textColor: "#ffffff",
  },
  SUSPENDED: {
    topText: "CHANNEL",
    bottomText: "SUSPENDED",
    color: "var(--error)",
    textColor: "#ffffff",
  },
};

export default function StatusSeal({ status }: StatusSealProps) {
  const config = SEAL_CONFIG[status] || SEAL_CONFIG.PENDING;

  // Symmetrical angles for stars (in degrees)
  const topAngles = [-162, -144, -126, -108, -90, -72, -54, -36, -18];
  const bottomAngles = [18, 36, 54, 72, 90, 108, 126, 144, 162];

  // Helper to generate 5-point star polygon points centered at (cx, cy)
  const getStarPoints = (cx: number, cy: number, outerRadius = 6.5, innerRadius = 2.8) => {
    const spikes = 5;
    let rot = (Math.PI / 2) * 3;
    const points: string[] = [];
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      points.push(`${x},${y}`);
      rot += Math.PI / spikes;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      points.push(`${x},${y}`);
      rot += Math.PI / spikes;
    }
    return points.join(" ");
  };

  return (
    <div className="flex justify-center items-center select-none mb-8 w-full">
      <svg
        viewBox="0 0 300 300"
        className="w-full max-w-[240px] aspect-square drop-shadow-xl animate-in zoom-in-95 duration-500"
        aria-hidden="true"
      >
        {/* Outer Ring */}
        <circle
          cx="150"
          cy="150"
          r="140"
          stroke={config.color}
          strokeWidth="5.5"
          fill="none"
        />

        {/* Inner Thin Ring */}
        <circle
          cx="150"
          cy="150"
          r="131"
          stroke={config.color}
          strokeWidth="2.5"
          fill="none"
        />

        {/* Inner Bold Ring */}
        <circle
          cx="150"
          cy="150"
          r="120"
          stroke={config.color}
          strokeWidth="5.5"
          fill="none"
        />

        {/* Bottom Half Background Fill */}
        <path
          d="M 30 150 A 120 120 0 0 0 270 150 Z"
          fill={config.color}
        />

        {/* Horizontal Split Center Line */}
        <line
          x1="30"
          y1="150"
          x2="270"
          y2="150"
          stroke={config.color}
          strokeWidth="5.5"
        />

        {/* Top Half Stars (config.color stars on transparent/white background) */}
        {topAngles.map((angle, index) => {
          const angleRad = (angle * Math.PI) / 180;
          const cx = 150 + 100 * Math.cos(angleRad);
          const cy = 150 + 100 * Math.sin(angleRad);
          return (
            <polygon
              key={`top-star-${index}`}
              points={getStarPoints(cx, cy)}
              fill={config.color}
            />
          );
        })}

        {/* Bottom Half Stars (white stars on config.color background) */}
        {bottomAngles.map((angle, index) => {
          const angleRad = (angle * Math.PI) / 180;
          const cx = 150 + 100 * Math.cos(angleRad);
          const cy = 150 + 100 * Math.sin(angleRad);
          return (
            <polygon
              key={`bottom-star-${index}`}
              points={getStarPoints(cx, cy)}
              fill={config.textColor}
            />
          );
        })}

        {/* Top Text (Condensed Sans, capitalized, bold/semibold) */}
        <text
          x="150"
          y="126"
          textAnchor="middle"
          fill={config.color}
          fontSize="24"
          fontWeight="700"
          letterSpacing="0.8"
          className="font-sans font-semibold tracking-wider uppercase select-none text-base"
          style={{
            fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
          }}
        >
          {config.topText}
        </text>

        {/* Bottom Text (Condensed Sans, capitalized, white, bold/semibold) */}
        <text
          x="150"
          y="192"
          textAnchor="middle"
          fill={config.textColor}
          fontSize="24"
          fontWeight="700"
          letterSpacing="0.8"
          className="font-sans font-semibold tracking-wider uppercase select-none text-base"
          style={{
            fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
          }}
        >
          {config.bottomText}
        </text>
      </svg>
    </div>
  );
}
