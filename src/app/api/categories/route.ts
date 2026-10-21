import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/modules/categories/category.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await getCategories();
    return NextResponse.json({ categories: serializeMongo(categories) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const category = await createCategory(body);
    return NextResponse.json({ success: true, category: serializeMongo(category) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
