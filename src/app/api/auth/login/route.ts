import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const user = await db.collection<User>("users").findOne({
      email: email.trim().toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
