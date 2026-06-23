"use client";

import React, { useRef } from "react";
import Image from "next/image";

/**
 * Logo with a hidden escape hatch:
 * Triple-click within 900 ms navigates to /home (internal team access).
 */
const PrelaunchLogo = () => {
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clicks.current += 1;
    if (timer.current) clearTimeout(timer.current);
    if (clicks.current >= 3) {
      clicks.current = 0;
      window.location.href = "/home";
      return;
    }
    timer.current = setTimeout(() => {
      clicks.current = 0;
    }, 900);
  };

  return (
    <div className="cursor-pointer" onClick={handleClick}>
      <div className="relative w-[110px] h-[42px] sm:w-[136px] sm:h-[52px]">
        <Image
          src="/static/2Fans-01.svg"
          alt="+2Fans Logo"
          fill
          style={{ objectFit: "contain", objectPosition: "left" }}
          priority
          sizes="136px"
        />
      </div>
    </div>
  );
};

export default PrelaunchLogo;
