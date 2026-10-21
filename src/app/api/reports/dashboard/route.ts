import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/modules/reports/report.service";
import { getCurrentUser } from "@/lib/auth";
import { serializeMongo } from "@/lib/mongo-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const metrics = await getDashboardMetrics();
    return NextResponse.json({ metrics: serializeMongo(metrics) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
