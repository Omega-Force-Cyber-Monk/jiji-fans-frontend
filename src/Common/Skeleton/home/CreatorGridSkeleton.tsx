import React from "react";

export default function CreatorGridSkeleton() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="aspect-square bg-skeleton-bg animate-pulse" />
      ))}
    </div>
  );
}
