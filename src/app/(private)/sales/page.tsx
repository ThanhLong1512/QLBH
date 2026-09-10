"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { offlineDB, type OfflineOrder } from "@/store/offlineDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRScanner } from "@/components/features/QRScanner";
import { Plus, Trash2, ShoppingCart, CheckCircle2, ScanLine, Save } from "lucide-react";

interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  viscosity: string;
  volume: string;
  unitPrice: number;
}

const sampleLubricants: CatalogItem[] = [
  {
    id: "lube-1",
    name: "PetroFleet Heavy Duty 15W-40 CK-4 (18L Pail)",
    sku: "PF-15W40-18L",
    viscosity: "15W-40",
    volume: "18 Liters",
    unitPrice: 1250000,
  },
  {
    id: "lube-2",
    name: "PetroFleet Heavy Duty 15W-40 CK-4 (200L Drum)",
    sku: "PF-15W40-200L",
    viscosity: "15W-40",
    volume: "200 Liters (Drum)",
    unitPrice: 12800000,
  },
  {
    id: "lube-3",
    name: "UltraSyn Apex Synthetic 5W-30 SP (4L Can)",
    sku: "USA-5W30-4L",
    viscosity: "5W-30",
    volume: "4 Liters",
    unitPrice: 620000,
  },
  {
    id: "lube-4",
    name: "HydraPower ISO VG 68 Anti-Wear (200L Drum)",
    sku: "HP-VG68-200L",
    viscosity: "ISO VG 68",
    volume: "200 Liters (Drum)",
    unitPrice: 9600000,
  },
];

export default function SalesOrderPage() {
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotalAmount, getTotalItems } =
    useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const [offlineOrdersList, setOfflineOrdersList] = useState<OfflineOrder[]>([]);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const loadOfflineOrders = async () => {
    try {
      const allOrders = await offlineDB.offlineOrders.toArray();
      setOfflineOrdersList(allOrders);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    offlineDB.offlineOrders.toArray().then((allOrders) => {
      if (isSubscribed) {
        setOfflineOrdersList(allOrders);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleScanSuccess = (decoded: string) => {
    // Find matching SKU
    const found = sampleLubricants.find((p) => p.sku === decoded || p.id === decoded);
    if (found) {
      addItem(found, 1);
      setOrderNotice(`Scanned barcode: ${found.name} added to cart!`);
    } else {
      setOrderNotice(`Scanned code "${decoded}" not recognized. Added default product.`);
      addItem(sampleLubricants[0], 1);
    }
    setIsQrOpen(false);
  };

  const handlePlaceOrder = async () => {
    if (!customerName || items.length === 0) {
      setOrderNotice("Please enter customer name and add at least 1 lubricant product.");
      return;
    }

    const orderData: OfflineOrder = {
      clientOrderId: `ORD-LOCAL-${Date.now()}`,
      customerName,
      customerPhone,
      deliveryAddress,
      items: items.map((i) => ({
        productId: i.id,
        productName: i.name,
        viscosity: i.viscosity,
        volume: i.volume,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      totalAmount: getTotalAmount(),
      createdAt: new Date().toISOString(),
      syncStatus: navigator.onLine ? "SYNCED" : "PENDING",
    };

    try {
      await offlineDB.offlineOrders.add(orderData);
      setOrderNotice(
        navigator.onLine
          ? "Order placed and synced to server successfully!"
          : "Saved locally to IndexedDB! Will sync automatically when online."
      );
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      loadOfflineOrders();
    } catch (err) {
      console.error("Failed to save offline order", err);
      setOrderNotice("Failed to save order.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Field Sales & Offline Order Entry
          </h1>
          <p className="text-sm text-slate-500">
            Create wholesale dispatch orders directly at customer depots or garages, with or without Internet.
          </p>
        </div>

        <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" className="gap-2 border-slate-300">
                <ScanLine className="h-4 w-4 text-amber-600" />
                Scan Drum Barcode
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan Drum Barcode / QR</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <QRScanner onScanSuccess={handleScanSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {orderNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{orderNotice}</span>
        </div>
      )}

      {/* Main Grid: Catalog List & Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Quick-Add (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Lubricant Product Quick Selector
              </CardTitle>
              <CardDescription className="text-xs">
                Select engine, hydraulic, or gear oils to add to distributor dispatch order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleLubricants.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-slate-200 rounded-lg bg-white flex flex-col justify-between hover:border-amber-400 transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] font-mono border-amber-300 bg-amber-50 text-amber-900">
                          {item.viscosity}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm mt-1.5">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Pack: {item.volume}</p>
                      <p className="text-xs font-bold text-amber-700 mt-1">
                        {item.unitPrice.toLocaleString()} VND
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addItem(item, 1)}
                      className="mt-3 w-full bg-slate-900 text-white hover:bg-slate-800 gap-1 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to Order
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Local / Offline Orders Synced from IndexedDB */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Save className="h-4 w-4 text-emerald-600" />
                IndexedDB Local Orders Cache ({offlineOrdersList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offlineOrdersList.length === 0 ? (
                <p className="text-xs text-slate-400">No local orders stored yet.</p>
              ) : (
                <div className="space-y-2">
                  {offlineOrdersList.slice(-3).map((ord, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{ord.customerName}</span>
                        <span className="text-slate-400 ml-2 font-mono">({ord.clientOrderId})</span>
                        <div className="text-[11px] text-slate-500">
                          {ord.items.length} item(s) &bull; {ord.totalAmount.toLocaleString()} VND
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] ${
                          ord.syncStatus === "SYNCED"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }`}
                      >
                        {ord.syncStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Cart & Customer Form (1 Col) */}
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-amber-600" />
                  Order Cart
                </span>
                <Badge variant="secondary" className="text-xs">
                  {getTotalItems()} Items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Items List */}
              {items.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Cart is currently empty.</p>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {items.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between text-xs border-b border-slate-100 pb-2"
                    >
                      <div className="flex-1 mr-2">
                        <p className="font-semibold text-slate-800 truncate">{i.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {i.unitPrice.toLocaleString()} VND x {i.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min="1"
                          value={i.quantity}
                          onChange={(e) => updateQuantity(i.id, parseInt(e.target.value) || 1)}
                          className="w-14 h-7 text-xs text-center"
                        />
                        <button
                          onClick={() => removeItem(i.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-amber-600">{getTotalAmount().toLocaleString()} VND</span>
              </div>

              {/* Customer Fields */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Customer / Garage Name *
                  </label>
                  <Input
                    placeholder="e.g. Garage Thanh Dat"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Number
                  </label>
                  <Input
                    placeholder="e.g. 0908123456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Delivery Address
                  </label>
                  <Input
                    placeholder="e.g. 120 QL1A, Binh Duong"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <Button
                onClick={handlePlaceOrder}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9"
              >
                Submit Order (Offline/Online)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
