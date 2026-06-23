"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Map tile layers
const TILE_LAYERS = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

// Mock regional data with real lat/long coordinates
const REGION_STATS = [
  {
    id: "na",
    name: "North America",
    users: "142,500",
    creators: "4,820",
    activity: "92%",
    coords: [40.7128, -74.0060] as [number, number],
  },
  {
    id: "eu",
    name: "Europe",
    users: "98,300",
    creators: "3,150",
    activity: "88%",
    coords: [51.5074, -0.1278] as [number, number],
  },
  {
    id: "as",
    name: "Asia-Pacific",
    users: "185,400",
    creators: "5,930",
    activity: "95%",
    coords: [35.6762, 139.6503] as [number, number],
  },
  {
    id: "sa",
    name: "South America",
    users: "45,100",
    creators: "1,220",
    activity: "81%",
    coords: [-23.5505, -46.6333] as [number, number],
  },
  {
    id: "af",
    name: "Africa",
    users: "28,900",
    creators: "850",
    activity: "76%",
    coords: [6.5244, 3.3792] as [number, number],
  },
];

// Sub-component to control map viewport flying animations
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 4, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

interface ActiveRegionsLeafletMapProps {
  onSelectRegion: (region: typeof REGION_STATS[0]) => void;
  activeCoords: [number, number];
  mapMode: "light" | "dark" | "satellite";
}

const ActiveRegionsLeafletMap = ({
  onSelectRegion,
  activeCoords,
  mapMode,
}: ActiveRegionsLeafletMapProps) => {
  useEffect(() => {
    // Overriding Default Leaflet icons because React-Leaflet bundling strips the assets
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="w-full h-[450px] rounded-md overflow-hidden relative border border-border-primary">
      <MapContainer
        center={activeCoords || [20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: "#121212" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={TILE_LAYERS[mapMode]}
        />

        <MapController center={activeCoords} />

        {REGION_STATS.map((region) => (
          <Marker
            key={region.id}
            position={region.coords}
            eventHandlers={{
              click: () => onSelectRegion(region),
              popupopen: () => onSelectRegion(region),
            }}
          >
            <Popup className="premium-popup">
              <div className="p-2 space-y-6">
                <h6 className="text-sm font-semibold text-primary-text">{region.name}</h6>
                <div className="space-y-6 text-sm text-muted-text">
                  <p>Users: <span className="font-semibold text-primary-text">{region.users}</span></p>
                  <p>Creators: <span className="font-semibold text-primary-text">{region.creators}</span></p>
                  <p>Engagement: <span className="font-semibold text-success">{region.activity}</span></p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ActiveRegionsLeafletMap;
export { REGION_STATS };
