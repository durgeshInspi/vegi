import { NextRequest, NextResponse } from "next/server";
import { getSupplierById, updateSupplier } from "@/modules/suppliers/supplier.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supplier = await getSupplierById(id);
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }
    return NextResponse.json({ supplier: serializeMongo(supplier) });
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
    const updated = await updateSupplier(id, body);
    return NextResponse.json({ success: true, supplier: serializeMongo(updated) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
