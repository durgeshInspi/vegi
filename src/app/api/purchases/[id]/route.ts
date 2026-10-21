import { NextRequest, NextResponse } from "next/server";
import { getPurchaseById } from "@/modules/purchases/purchase.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const purchase = await getPurchaseById(id);
    if (!purchase) {
      return NextResponse.json({ error: "Purchase invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ purchase: serializeMongo(purchase) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
