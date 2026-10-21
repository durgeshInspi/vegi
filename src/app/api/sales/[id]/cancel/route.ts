import { NextRequest, NextResponse } from "next/server";
import { cancelSale } from "@/modules/sales/sale.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required to cancel sales" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Customer cancelled or returned produce";

    const cancelledSale = await cancelSale(id, user.userId, user.name, reason);
    return NextResponse.json({ success: true, sale: serializeMongo(cancelledSale) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
