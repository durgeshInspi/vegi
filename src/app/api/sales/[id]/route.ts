import { NextRequest, NextResponse } from "next/server";
import { getSaleById } from "@/modules/sales/sale.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sale = await getSaleById(id);
    if (!sale) {
      return NextResponse.json({ error: "Sale invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ sale: serializeMongo(sale) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
