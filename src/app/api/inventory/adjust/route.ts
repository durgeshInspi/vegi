import { NextRequest, NextResponse } from "next/server";
import { adjustVegetableStock } from "@/modules/vegetables/vegetable.service";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required for manual stock adjustments" }, { status: 403 });
    }

    const body = await request.json();
    const { vegetableId, quantity, reason } = body;

    if (!vegetableId || quantity === undefined) {
      return NextResponse.json({ error: "Vegetable ID and quantity adjustment are required" }, { status: 400 });
    }

    const result = await adjustVegetableStock(vegetableId, {
      quantity: Number(quantity),
      reason: reason || "Manual physical inventory count audit",
      userId: user.userId,
      userName: user.name,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
