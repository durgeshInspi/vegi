import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/modules/categories/category.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updated = await updateCategory(id, body);
    return NextResponse.json({ success: true, category: serializeMongo(updated) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
