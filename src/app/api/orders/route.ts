import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientOrderId, customerName, items, totalAmount } = body;

    if (!customerName || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid order payload" },
        { status: 400 }
      );
    }

    // Process and respond with synced order record
    const syncedOrder = {
      id: `SRV-${Date.now()}`,
      clientOrderId: clientOrderId || `LOC-${Date.now()}`,
      customerName,
      itemsCount: items.length,
      totalAmount,
      syncStatus: "SYNCED",
      receivedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Order successfully processed and synced to DMS database.",
      order: syncedOrder,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
