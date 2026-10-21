import { NextRequest, NextResponse } from "next/server";
import { recordCustomerPayment } from "@/modules/customers/customer.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const payment = await recordCustomerPayment(id, {
      amount: Number(body.amount),
      paymentMethod: body.paymentMethod || "CASH",
      notes: body.notes,
      referenceInvoice: body.referenceInvoice,
      userId: user.userId,
      userName: user.name,
    });

    return NextResponse.json({ success: true, payment: serializeMongo(payment) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
