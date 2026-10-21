import { NextResponse } from "next/server";
import { getCategories } from "@/modules/categories/category.service";
import { serializeMongo } from "@/lib/mongo-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategories();
    // Return only active categories
    const activeCategories = categories.filter((c) => c.isActive !== false);
    return NextResponse.json({
      categories: serializeMongo(activeCategories),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}
