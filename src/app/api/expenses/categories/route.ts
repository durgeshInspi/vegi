import { NextRequest, NextResponse } from "next/server";
import { getExpenseCategories, createExpenseCategory } from "@/modules/expenses/expense.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await getExpenseCategories();
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
    const category = await createExpenseCategory(body);
    return NextResponse.json({ success: true, category: serializeMongo(category) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
