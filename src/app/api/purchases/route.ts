import { NextRequest, NextResponse } from "next/server";
import { getPurchases, createPurchase } from "@/modules/purchases/purchase.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const result = await getPurchases({ supplierId, dateFrom, dateTo, page, limit });
    return NextResponse.json({
      items: serializeMongo(result.items),
      pagination: result.pagination,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const purchase = await createPurchase(body, user.userId, user.name);

    return NextResponse.json({
      success: true,
      purchase: serializeMongo(purchase),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
