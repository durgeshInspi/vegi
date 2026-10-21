import { NextRequest, NextResponse } from "next/server";
import { getExpenses, createExpense } from "@/modules/expenses/expense.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const result = await getExpenses({ categoryId, dateFrom, dateTo, page, limit });
    return NextResponse.json({
      items: serializeMongo(result.items),
      pagination: result.pagination,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required to record expenses" }, { status: 403 });
    }

    const body = await request.json();
    const expense = await createExpense(body, user.userId, user.name);

    return NextResponse.json({
      success: true,
      expense: serializeMongo(expense),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
