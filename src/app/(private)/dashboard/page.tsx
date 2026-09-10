import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Droplet, TrendingUp, Package, Truck, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Monthly Revenue",
      value: "1,420,500,000 VND",
      change: "+12.4%",
      description: "Lubricant wholesale sales",
      icon: TrendingUp,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Total Volume Dispatched",
      value: "48,250 Liters",
      change: "+8.1%",
      description: "Pails, Drums & Bulk IBC",
      icon: Droplet,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Warehouse Stock (Drums)",
      value: "640 Drums (200L)",
      change: "Safe Level",
      description: "15W-40, VG68, 80W-90",
      icon: Package,
      iconColor: "text-blue-600 bg-blue-50",
    },
    {
      title: "Active Fleet Trucks",
      value: "8 / 10 En Route",
      change: "Realtime GPS",
      description: "Binh Duong & Dong Nai routes",
      icon: Truck,
      iconColor: "text-purple-600 bg-purple-50",
    },
  ];

  const recentOrders = [
    {
      orderId: "ORD-2026-8941",
      customer: "Tan Phat Transport Logistics",
      products: "PetroFleet 15W-40 CK-4 (12 Drums)",
      viscosity: "15W-40",
      total: "153,600,000 VND",
      status: "DISPATCHED",
      channel: "FIELD_SALES",
    },
    {
      orderId: "ORD-2026-8940",
      customer: "Minh Quang Hydraulic Machining",
      products: "HydraPower ISO VG 68 (6 Drums)",
      viscosity: "ISO VG 68",
      total: "57,600,000 VND",
      status: "COMPLETED",
      channel: "DIRECT_PORTAL",
    },
    {
      orderId: "ORD-2026-8939",
      customer: "Sai Gon Auto Garage Chain",
      products: "UltraSyn 5W-30 SP (48 Cans 4L)",
      viscosity: "5W-30",
      total: "29,760,000 VND",
      status: "OFFLINE_SYNCED",
      channel: "OFFLINE_REP",
    },
    {
      orderId: "ORD-2026-8938",
      customer: "Long An Agricultural Co-op",
      products: "TransGear 80W-90 GL-5 (20 Pails 18L)",
      viscosity: "80W-90",
      total: "23,600,000 VND",
      status: "PENDING_PAYMENT",
      channel: "FIELD_SALES",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Executive DMS Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Distribution performance, bulk lubricant volume metrics, and dispatch fulfillment status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={idx} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {s.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${s.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-semibold flex items-center">
                    {s.change} <ArrowUpRight className="h-3 w-3 inline" />
                  </span>
                  &bull; {s.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Viscosity Breakdown & Orders */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Viscosity Grade Distribution */}
        <Card className="border-slate-200 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Volume by Viscosity
            </CardTitle>
            <CardDescription className="text-xs">
              Current month liters distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>15W-40 (Heavy Commercial Diesel)</span>
                <span className="font-bold">54% (26,055 L)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "54%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>ISO VG 68 / 46 (Industrial Hydraulic)</span>
                <span className="font-bold">28% (13,510 L)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>5W-30 / 10W-40 (Passenger Car Synthetic)</span>
                <span className="font-bold">12% (5,790 L)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "12%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>80W-90 / 85W-140 (Transmission Gear)</span>
                <span className="font-bold">6% (2,895 L)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "6%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="border-slate-200 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Recent Wholesale Distribution Orders
            </CardTitle>
            <CardDescription className="text-xs">
              Live orders captured by field reps and dispatch system
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Order ID</TableHead>
                  <TableHead className="text-xs font-semibold">Distributor / Garage</TableHead>
                  <TableHead className="text-xs font-semibold">Grade</TableHead>
                  <TableHead className="text-xs font-semibold">Total Amount</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((ord) => (
                  <TableRow key={ord.orderId}>
                    <TableCell className="font-mono text-xs font-medium text-slate-900">
                      {ord.orderId}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-slate-800">{ord.customer}</div>
                      <div className="text-[11px] text-slate-500">{ord.products}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-mono border-amber-300 bg-amber-50 text-amber-900">
                        {ord.viscosity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-900">
                      {ord.total}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] ${
                          ord.status === "DISPATCHED"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : ord.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                            : ord.status === "OFFLINE_SYNCED"
                            ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }`}
                      >
                        {ord.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
