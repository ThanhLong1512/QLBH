"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Navigation, Warehouse, MapPin } from "lucide-react";
import type { MapLocation } from "@/components/features/LeafletMap";

// Dynamic import for Leaflet map to prevent SSR window issues
const LeafletMap = dynamic(
  () => import("@/components/features/LeafletMap").then((mod) => mod.LeafletMap),
  { ssr: false }
);

const fleetLocations: MapLocation[] = [
  {
    id: "loc-wh-1",
    name: "Central Lubricant Warehouse (HCMC)",
    lat: 10.8231,
    lng: 106.6297,
    type: "WAREHOUSE",
    description: "Stock: 1,200 Drums (15W-40, VG68) & 5,000 Pails",
  },
  {
    id: "loc-truck-1",
    name: "Truck #51C-789.21 (Driver: Tran Van Nam)",
    lat: 10.795,
    lng: 106.68,
    type: "TRUCK",
    description: "Delivering 20 Drums 15W-40 to Tan Phat Transport",
  },
  {
    id: "loc-truck-2",
    name: "Truck #60B-334.12 (Driver: Le Quoc Hung)",
    lat: 10.85,
    lng: 106.75,
    type: "TRUCK",
    description: "En route to Bien Hoa Industrial Zone (Hydraulic Fluid)",
  },
  {
    id: "loc-dist-1",
    name: "Distributor: AutoPro Sai Gon Hub",
    lat: 10.76,
    lng: 106.66,
    type: "DISTRIBUTOR",
    description: "Tier-1 Master Distributor - Retail Garage network",
  },
];

export default function FleetPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fleet Tracking & Dispatch Management
          </h1>
          <p className="text-sm text-slate-500">
            Real-time GPS positions of lubricant tanker trucks, depot delivery vans, and warehouse distribution points.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            GPS Stream Active
          </Badge>
        </div>
      </div>

      {/* Map & Fleet Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Leaflet Map (2 Cols) */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                Live Logistics Geo-Map (HCMC & Surrounding Zones)
              </CardTitle>
              <CardDescription className="text-xs">
                Click pins to inspect truck payload, driver, and destination garage
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LeafletMap
                center={[10.80, 106.70]}
                zoom={11}
                locations={fleetLocations}
                height="450px"
              />
            </CardContent>
          </Card>
        </div>

        {/* Fleet Route Sidebar (1 Col) */}
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" />
                Active Delivery Dispatches
              </CardTitle>
              <CardDescription className="text-xs">
                3 Vehicles currently completing delivery routes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Truck #51C-789.21</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                    On Delivery
                  </Badge>
                </div>
                <p className="text-slate-600">Payload: 20 Drums 15W-40 CK-4</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="h-3 w-3 text-amber-500" />
                  <span>Dest: Tan Phat Transport, Q12</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Truck #60B-334.12</span>
                  <Badge variant="outline" className="text-[10px] text-blue-700 border-blue-300 bg-blue-50">
                    Express Highway
                  </Badge>
                </div>
                <p className="text-slate-600">Payload: 15 Drums ISO VG 68</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="h-3 w-3 text-blue-500" />
                  <span>Dest: Bien Hoa 2 Industrial Park</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Warehouse HCMC-WH01</span>
                  <Badge variant="outline" className="text-[10px] text-slate-700">
                    Main Depot
                  </Badge>
                </div>
                <p className="text-slate-600 flex items-center gap-1">
                  <Warehouse className="h-3 w-3 text-slate-500" />
                  Loading 2 upcoming routes for afternoon shift
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
