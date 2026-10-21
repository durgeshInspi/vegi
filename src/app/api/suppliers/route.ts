import { NextRequest, NextResponse } from "next/server";
import { getSuppliers, createSupplier } from "@/modules/suppliers/supplier.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const suppliers = await getSuppliers();
    return NextResponse.json({ suppliers: serializeMongo(suppliers) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required to add suppliers" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }

    const supplier = await createSupplier(body);
    return NextResponse.json({ success: true, supplier: serializeMongo(supplier) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
