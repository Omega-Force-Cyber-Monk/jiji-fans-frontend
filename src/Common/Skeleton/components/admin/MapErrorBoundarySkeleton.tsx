"use client";

import React from "react";

const MapErrorBoundarySkeleton = () => {
  return (
    <div className="w-full h-96 bg-primary-bg rounded-md border border-border-primary flex flex-col items-center justify-center p-6 space-y-6 animate-pulse">
      <div className="w-12 h-12 rounded-md bg-skeleton-bg" />
      <div className="space-y-6 flex flex-col items-center">
        <div className="h-4 w-40 bg-skeleton-bg rounded-md" />
        <div className="h-3 w-64 bg-skeleton-bg rounded-md" />
      </div>
      <div className="h-8 w-32 bg-skeleton-bg rounded-md" />
    </div>
  );
};

export default MapErrorBoundarySkeleton;
