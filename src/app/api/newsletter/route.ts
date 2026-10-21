import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();

    // Strict email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g., name@example.com)." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("newsletter_subscribers");

    // Check if already subscribed
    const existing = await collection.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "You're already subscribed to our fresh harvest updates!" },
        { status: 200 }
      );
    }

    await collection.insertOne({
      _id: new ObjectId(),
      email,
      subscribedAt: new Date(),
      status: "ACTIVE",
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! Fresh seasonal updates will be sent to your inbox.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process newsletter subscription" },
      { status: 500 }
    );
  }
}
