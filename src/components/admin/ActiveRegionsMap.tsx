"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import MapErrorBoundary from "./MapErrorBoundary";

// Dynamic import of Leaflet map to prevent Next.js SSR document is not defined errors
const ActiveRegionsLeafletMap = dynamic(
  () => import("./ActiveRegionsLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] bg-primary-bg rounded-md border border-border-primary animate-pulse flex items-center justify-center text-muted-text text-sm">
        Loading Interactive Map Module...
      </div>
    ),
  }
);

// Initial state stats from the map definitions
const INITIAL_STATS = {
  id: "na",
  name: "North America",
  users: "142,500",
  creators: "4,820",
  activity: "92%",
  color: "var(--brand-primary)",
  coords: [40.7128, -74.0060] as [number, number],
};

const REGIONS_LIST = [
  { id: "na", name: "North America", coords: [40.7128, -74.0060] as [number, number], users: "142,500", creators: "4,820", activity: "92%" },
  { id: "eu", name: "Europe", coords: [51.5074, -0.1278] as [number, number], users: "98,300", creators: "3,150", activity: "88%" },
  { id: "as", name: "Asia-Pacific", coords: [35.6762, 139.6503] as [number, number], users: "185,400", creators: "5,930", activity: "95%" },
  { id: "sa", name: "South America", coords: [-23.5505, -46.6333] as [number, number], users: "45,100", creators: "1,220", activity: "81%" },
  { id: "af", name: "Africa", coords: [6.5244, 3.3792] as [number, number], users: "28,900", creators: "850", activity: "76%" },
];

const ActiveRegionsMap = () => {
  const [selectedRegion, setSelectedRegion] = useState(INITIAL_STATS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mapMode, setMapMode] = useState<"light" | "dark" | "satellite">("dark");

  const handleSelectRegion = (region: any) => {
    // Map Leaflet colors dynamically based on activity
    const colors: Record<string, string> = {
      na: "var(--brand-primary)",
      eu: "var(--success)",
      as: "var(--brand-secondary)",
      sa: "var(--warning)",
      af: "var(--brand-primary)",
    };
    setSelectedRegion({
      ...region,
      color: colors[region.id] || "var(--brand-primary)",
    });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const filteredRegions = REGIONS_LIST.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full p-6 rounded-lg border border-border-primary bg-secondary-bg shadow-sm space-y-6">
      {/* Header section with minimal clean layout (no extra spacers) */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 border-b border-border-primary pb-2">
        <div className="space-y-2">
          <h5 className="text-xl font-semibold text-primary-text">Global Active Regions</h5>
          <p className="text-sm text-muted-text font-normal">
            Real-time heat distribution of active viewers and creators via Leaflet.
          </p>
        </div>

        {/* Legend status list */}
        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-6 text-sm text-secondary-text font-medium">
            <span className="w-3 h-3 bg-brand-primary rounded-sm" />
            High Activity
          </span>
          <span className="inline-flex items-center gap-6 text-sm text-secondary-text font-medium">
            <span className="w-3 h-3 bg-success rounded-sm" />
            Growing
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Dynamic Interactive Leaflet Map Component with overlay search & switches */}
        <div className="lg:col-span-8 w-full relative">

          {/* Overlay Controls wrapper (Search & Mode options directly on top of Leaflet) */}
          <div className="absolute top-4 left-12 right-4 z-[400] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pointer-events-none">

            {/* Search Input Floating */}
            <div className="relative w-full sm:w-64 pointer-events-auto">
              <div className="relative flex items-center shadow-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search active regions..."
                  className="w-full h-10 pl-10 pr-4 bg-secondary-bg border border-border-primary rounded-md text-sm text-primary-text placeholder-muted-text focus:outline-hidden focus:border-brand-primary transition-colors cursor-text"
                />
                <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-muted-text" />
              </div>

              {/* Dropdown Results absolute container */}
              {showDropdown && searchQuery && (
                <div className="absolute left-0 right-0 mt-2 bg-secondary-bg border border-border-primary rounded-md shadow-lg overflow-hidden">
                  {filteredRegions.length > 0 ? (
                    filteredRegions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => handleSelectRegion(region)}
                        className="w-full text-left px-4 py-2.5 text-sm text-secondary-text hover:text-primary-text hover:bg-primary-bg transition-colors border-none cursor-pointer"
                      >
                        {region.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2.5 text-sm text-muted-text text-center">
                      No regions found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Map Theme Mode switch (light, dark, satellite) */}
            <div className="flex bg-secondary-bg border border-border-primary rounded-md p-1 shadow-md gap-1 pointer-events-auto shrink-0">
              {(["light", "dark", "satellite"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-sm border-none cursor-pointer transition-colors uppercase ${mapMode === mode
                    ? "bg-brand-primary text-black"
                    : "text-secondary-text hover:text-primary-text"
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <MapErrorBoundary>
            <ActiveRegionsLeafletMap
              onSelectRegion={handleSelectRegion}
              activeCoords={selectedRegion.coords}
              mapMode={mapMode}
            />
          </MapErrorBoundary>
        </div>

        {/* Detailed Info Panel Card */}
        <div className="lg:col-span-4 p-6 rounded-md border border-border-primary bg-primary-bg flex flex-col justify-between">
          <div className="border-b border-border-primary pb-4 space-y-2">
            <h6 className=" text-sm font-semibold tracking-wider text-primary-text">Region Stats</h6>
            <span className="inline-flex text-xl font-semibold uppercase text-brand-primary">
              {selectedRegion.name}
            </span>
          </div>

          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex justify-between items-center pt-4">
              <span className="text-base font-medium text-primary-text">Active Users</span>
              <span className="text-sm font-semibold text-primary-text">{selectedRegion.users}</span>
            </div>
            <hr className="border-border-primary/50" />
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-primary-text">Active Creators</span>
              <span className="text-sm font-semibold text-primary-text">{selectedRegion.creators}</span>
            </div>
            <hr className="border-border-primary/50" />
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-primary-text">Engagement Index</span>
              <span className="text-sm font-semibold text-success">{selectedRegion.activity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRegionsMap;
