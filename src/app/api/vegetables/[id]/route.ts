import { NextRequest, NextResponse } from "next/server";
import { getVegetableById, updateVegetable } from "@/modules/vegetables/vegetable.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const vegetable = await getVegetableById(id);
    if (!vegetable) {
      return NextResponse.json({ error: "Vegetable not found" }, { status: 404 });
    }
    return NextResponse.json({ vegetable: serializeMongo(vegetable) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updated = await updateVegetable(id, body);

    return NextResponse.json({
      success: true,
      vegetable: serializeMongo(updated),
    });
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
    // Safe archive rather than hard delete to preserve historical order records
    const updated = await updateVegetable(id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: "Vegetable archived successfully",
      vegetable: serializeMongo(updated),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
