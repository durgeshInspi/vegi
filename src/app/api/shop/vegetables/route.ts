import { NextRequest, NextResponse } from "next/server";
import { getVegetables } from "@/modules/vegetables/vegetable.service";
import { serializeMongo } from "@/lib/mongo-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Public shop only shows active vegetables
    const result = await getVegetables({
      query,
      categoryId,
      status: "active",
      page,
      limit,
    });

    return NextResponse.json({
      items: serializeMongo(result.items),
      pagination: result.pagination,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch vegetables" }, { status: 500 });
  }
}
