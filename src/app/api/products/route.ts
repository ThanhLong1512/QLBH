import { NextResponse } from "next/server";

export async function GET() {
  const products = [
    {
      id: "prod-1",
      name: "PetroFleet Heavy Duty 15W-40 CK-4",
      sku: "LUB-ENG-15W40-18L",
      viscosity: "15W-40",
      volume: "18L",
      category: "Engine Oil",
      price: 1250000,
      stock: 450,
    },
    {
      id: "prod-2",
      name: "PetroFleet Heavy Duty 15W-40 CK-4 (Drum)",
      sku: "LUB-ENG-15W40-200L",
      viscosity: "15W-40",
      volume: "200L",
      category: "Engine Oil",
      price: 12800000,
      stock: 120,
    },
    {
      id: "prod-3",
      name: "UltraSyn Apex Synthetic 5W-30 SP",
      sku: "LUB-ENG-5W30-4L",
      viscosity: "5W-30",
      volume: "4L",
      category: "Engine Oil",
      price: 620000,
      stock: 800,
    },
    {
      id: "prod-4",
      name: "HydraPower ISO VG 68 Anti-Wear",
      sku: "LUB-HYD-VG68-200L",
      viscosity: "ISO VG 68",
      volume: "200L",
      category: "Hydraulic Oil",
      price: 9600000,
      stock: 95,
    },
  ];

  return NextResponse.json({
    success: true,
    data: products,
    total: products.length,
  });
}
