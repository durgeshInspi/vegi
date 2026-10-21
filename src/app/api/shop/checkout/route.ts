import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { createSale } from "@/modules/sales/sale.service";
import { serializeMongo, safeObjectId } from "@/lib/mongo-utils";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryPincode,
      paymentMethod = "CASH",
      items,
      notes,
    } = body;

    if (!customerName?.trim()) {
      return NextResponse.json({ error: "Please provide your full name." }, { status: 400 });
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: "Please provide a valid contact phone number." }, { status: 400 });
    }
    if (!deliveryAddress?.trim()) {
      return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Shopping cart is empty." }, { status: 400 });
    }

    const db = await getDb();

    // Check if customer already exists by phone, or create customer
    let customerObjId: string | undefined = undefined;
    const cleanPhone = customerPhone.trim();
    const existingCustomer = await db.collection("customers").findOne({ phone: cleanPhone });

    if (existingCustomer) {
      customerObjId = existingCustomer._id.toString();
    } else {
      const newCust = {
        _id: new ObjectId(),
        name: customerName.trim(),
        phone: cleanPhone,
        address: `${deliveryAddress.trim()}, ${deliveryCity || "Mumbai"} - ${deliveryPincode || ""}`.trim(),
        creditLimit: 0,
        outstandingBalance: 0,
        isWalkIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection("customers").insertOne(newCust);
      customerObjId = newCust._id.toString();
    }

    // Find default store user for attribution
    const staffUser = await db.collection("users").findOne({ role: "ADMIN" });
    const cashierId = staffUser ? staffUser._id.toString() : new ObjectId().toString();
    const cashierName = "Online Web Store";

    const fullNotes = [
      notes?.trim() ? `Customer Note: ${notes.trim()}` : "",
      `Delivery To: ${deliveryAddress.trim()}, ${deliveryCity || "Mumbai"} ${deliveryPincode ? `(${deliveryPincode})` : ""}`,
      `Payment: ${paymentMethod === "CASH" ? "Cash on Delivery" : paymentMethod}`,
    ]
      .filter(Boolean)
      .join(" | ");

    // Execute atomic sale with inventory deduction
    const sale = await createSale(
      {
        customerId: customerObjId,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        items: items.map((it: any) => ({
          vegetableId: it.vegetableId,
          quantity: Number(it.quantity),
          unit: it.unit,
        })),
        paymentMethod: paymentMethod === "UPI" ? "UPI" : "CASH",
        notes: fullNotes,
      },
      cashierId,
      cashierName
    );

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      sale: serializeMongo(sale),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to place order. Please try again." },
      { status: 400 }
    );
  }
}
