import type { Metadata } from "next";
import { Droplet, Filter, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Lubricant Product Catalog - PetroLub DMS",
  description: "Browse commercial and industrial lubricants: Engine oils (15W-40, 10W-40, 5W-30), hydraulic oils (ISO VG 46, 68), and gear lubricants.",
};

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: "Engine Oil" | "Hydraulic Oil" | "Gear Lubricant" | "Grease";
  viscosity: string;
  volume: string;
  standard: string;
  description: string;
  pricePerUnit: string;
}

const mockProducts: ProductItem[] = [
  {
    id: "prod-1",
    name: "PetroFleet Heavy Duty 15W-40 CK-4",
    sku: "LUB-ENG-15W40-18L",
    category: "Engine Oil",
    viscosity: "15W-40",
    volume: "18 Liters",
    standard: "API CK-4 / CJ-4, ACEA E9",
    description: "Premium heavy-duty diesel engine oil for modern Euro 4/5/6 truck fleets and tractors with DPF.",
    pricePerUnit: "1,250,000 VND",
  },
  {
    id: "prod-2",
    name: "PetroFleet Heavy Duty 15W-40 CK-4 (Drum)",
    sku: "LUB-ENG-15W40-200L",
    category: "Engine Oil",
    viscosity: "15W-40",
    volume: "200 Liters (Drum)",
    standard: "API CK-4 / CJ-4, ACEA E9",
    description: "Wholesale industrial drum for transport fleets, bus operators, and logistics depots.",
    pricePerUnit: "12,800,000 VND",
  },
  {
    id: "prod-3",
    name: "UltraSyn Apex Synthetic 5W-30 SP",
    sku: "LUB-ENG-5W30-4L",
    category: "Engine Oil",
    viscosity: "5W-30",
    volume: "4 Liters",
    standard: "API SP, ILSAC GF-6A",
    description: "Full-synthetic lubricant providing superior fuel economy and low-speed pre-ignition (LSPI) protection.",
    pricePerUnit: "620,000 VND",
  },
  {
    id: "prod-4",
    name: "HydraPower ISO VG 68 Anti-Wear",
    sku: "LUB-HYD-VG68-200L",
    category: "Hydraulic Oil",
    viscosity: "ISO VG 68",
    volume: "200 Liters (Drum)",
    standard: "DIN 51524 Part 2 (HLP)",
    description: "High-performance anti-wear hydraulic oil for injection molding, excavators, and industrial press equipment.",
    pricePerUnit: "9,600,000 VND",
  },
  {
    id: "prod-5",
    name: "HydraPower ISO VG 46 Anti-Wear",
    sku: "LUB-HYD-VG46-200L",
    category: "Hydraulic Oil",
    viscosity: "ISO VG 46",
    volume: "200 Liters (Drum)",
    standard: "DIN 51524 Part 2 (HLP)",
    description: "Industrial hydraulic fluid with high thermal stability and rapid air-release properties.",
    pricePerUnit: "9,450,000 VND",
  },
  {
    id: "prod-6",
    name: "TransGear HD 80W-90 GL-5",
    sku: "LUB-GEAR-80W90-18L",
    category: "Gear Lubricant",
    viscosity: "80W-90",
    volume: "18 Liters",
    standard: "API GL-5, MIL-L-2105D",
    description: "Extreme-pressure automotive gear lubricant for hypoid differentials and manual transmissions.",
    pricePerUnit: "1,180,000 VND",
  },
];

export default function CatalogPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:px-6">
      {/* Catalog Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <Badge className="bg-amber-100 text-amber-900 mb-2 hover:bg-amber-100">B2B Wholesale Catalog</Badge>
          <h1 className="text-3xl font-bold text-slate-900">Lubricant Oil & Fluid Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Engineered lubricants conforming to international API, SAE, and ISO VG standards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-slate-700">
            <Filter className="h-4 w-4" />
            Filter by Viscosity
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts.map((p) => (
          <Card key={p.id} className="flex flex-col justify-between border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <Badge variant="outline" className="font-mono text-xs border-amber-300 bg-amber-50 text-amber-900">
                  {p.viscosity}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">{p.sku}</span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 mt-2">
                {p.name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {p.category} &bull; {p.standard}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2 flex-1">
              <p className="line-clamp-2">{p.description}</p>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Packaging / Volume:</span>
                  <span className="font-medium text-slate-800">{p.volume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wholesale Price:</span>
                  <span className="font-bold text-amber-700">{p.pricePerUnit}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-slate-100">
              <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2">
                <Droplet className="h-3.5 w-3.5" />
                Request Dispatch Quote
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Technical Standards Bar */}
      <div id="standards" className="mt-14 p-6 bg-slate-100 rounded-xl border border-slate-200">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          Certified Quality & Technical Standards
        </h2>
        <p className="text-xs text-slate-600 mt-2">
          All lubricants distributed through PetroLub DMS adhere to API (American Petroleum Institute), ACEA (European Automobile Manufacturers Association), and ISO standards. Test reports (COA / Certificate of Analysis) are available per batch upon delivery dispatch.
        </p>
      </div>
    </div>
  );
}
