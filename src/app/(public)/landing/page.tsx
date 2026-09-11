import type { Metadata } from "next";
import Link from "next/link";
import { Droplet, Shield, Truck, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "PetroLub CRM/DMS - Lubricant Oil Distribution Management System",
  description: "Enterprise distribution management system and wholesale lubricant oil supply for automotive, industrial machinery, and fleet logistics.",
  keywords: ["lubricant oil", "engine oil", "hydraulic oil", "DMS", "CRM", "distribution", "viscosity 10W-40", "15W-40"],
};

export const revalidate = 3600; // ISR: 1 hour cache

export default function LandingPage() {
  const featuredOils = [
    {
      name: "PetroFleet Heavy Duty 15W-40 CK-4",
      viscosity: "15W-40",
      type: "Diesel Engine Oil",
      volume: "18L Pail / 200L Drum",
      badge: "Best Seller Fleet",
    },
    {
      name: "UltraSyn Apex Fully Synthetic 5W-30 SP",
      viscosity: "5W-30",
      type: "Gasoline Passenger Car Oil",
      volume: "1L / 4L Can",
      badge: "High Performance",
    },
    {
      name: "HydraPower ISO VG 68 Anti-Wear",
      viscosity: "ISO VG 68",
      type: "Industrial Hydraulic Fluid",
      volume: "200L Drum / IBC 1000L",
      badge: "Industrial Grade",
    },
    {
      name: "TransGear HD 80W-90 GL-5",
      viscosity: "80W-90",
      type: "Heavy Duty Gear Lubricant",
      volume: "18L Pail / 200L Drum",
      badge: "Heavy Transmission",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20 px-4 text-white sm:px-6 lg:py-28">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge variant="outline" className="mb-4 border-amber-400/40 text-amber-400 px-3 py-1">
            Engineered for Lubricant Oil Distributors & Fleet Operators
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-100">
            Smart Lubricant <span className="text-amber-400">Distribution & DMS</span> Platform
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Manage wholesale inventory, field sales dispatching, route tracking, and offline order capture for automotive and industrial lubricants with zero downtime.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8">
                Explore Catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                Launch DMS Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Fleet & Route DMS</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Live GPS coordinate tracking, delivery dispatching to garages, and warehouse replenishment routes.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Offline-First Ordering</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Field sales representatives can draft orders in remote warehouses without mobile data; auto-syncs when online.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Viscosity & Volume Analytics</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Track sales volume in Liters and Barrels segmented by SAE viscosity (10W-40, 15W-40, 20W-50).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <span className="text-amber-600 text-sm font-semibold tracking-wider uppercase">Products</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Featured Lubricants & Fluids
              </h2>
            </div>
            <Link href="/catalog">
              <Button variant="ghost" className="text-amber-600 hover:text-amber-700 gap-1 p-0">
                View Full Catalog <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredOils.map((oil, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
                      {oil.viscosity}
                    </Badge>
                    <span className="text-[11px] font-medium text-slate-400">{oil.badge}</span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-2">
                    {oil.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    {oil.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Droplet className="h-3.5 w-3.5 text-amber-500" />
                    Packaging: {oil.volume}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>In Stock for Wholesale Dispatch</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
