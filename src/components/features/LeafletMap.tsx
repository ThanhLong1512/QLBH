"use client";

import { useSyncExternalStore } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon paths in Next.js bundler
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "WAREHOUSE" | "DISTRIBUTOR" | "TRUCK";
  description?: string;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  locations?: MapLocation[];
  height?: string;
}

const emptySubscribe = () => () => {};

export function LeafletMap({
  center = [10.7769, 106.7009], // Default: Ho Chi Minh City center
  zoom = 12,
  locations = [],
  height = "400px",
}: LeafletMapProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isMounted) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200 text-slate-400 text-sm animate-pulse"
      >
        Loading Map & Fleet Coordinates...
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">{loc.name}</p>
                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 my-1 font-mono text-[10px]">
                  {loc.type}
                </span>
                {loc.description && (
                  <p className="text-slate-500 mt-1">{loc.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
