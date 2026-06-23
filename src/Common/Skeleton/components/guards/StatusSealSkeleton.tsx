"use client";

import React from "react";

export default function StatusSealSkeleton() {
  return (
    <div className="flex justify-center items-center mb-8 w-full">
      <div className="w-full max-w-[240px] sm:max-w-[300px] aspect-square rounded-full bg-skeleton-bg animate-pulse" />
    </div>
  );
}
