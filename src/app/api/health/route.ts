import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let latencyMs = 0;

  try {
    const db = await getDb();
    const pingRes = await db.command({ ping: 1 });
    latencyMs = Date.now() - startTime;
    if (pingRes.ok === 1) {
      dbStatus = "healthy";
    }
  } catch (err: any) {
    dbStatus = `error: ${err.message || "database ping failed"}`;
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          latencyMs,
        },
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      latencyMs,
    },
    version: "1.0.0",
  });
}
