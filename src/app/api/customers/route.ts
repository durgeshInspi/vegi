import { NextRequest, NextResponse } from "next/server";
import { getCustomers, createCustomer } from "@/modules/customers/customer.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await getCustomers();
    return NextResponse.json({ customers: serializeMongo(customers) });
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
    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: "Customer name and phone number are required" }, { status: 400 });
    }

    const customer = await createCustomer(body);
    return NextResponse.json({ success: true, customer: serializeMongo(customer) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
