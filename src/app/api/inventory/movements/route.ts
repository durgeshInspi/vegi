import { NextRequest, NextResponse } from "next/server";
import { getStockMovements } from "@/modules/inventory/inventory.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vegetableId = searchParams.get("vegetableId") || undefined;
    const movementType = searchParams.get("movementType") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const result = await getStockMovements({ vegetableId, movementType, page, limit });
    return NextResponse.json({
      items: serializeMongo(result.items),
      pagination: result.pagination,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
