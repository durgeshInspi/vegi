import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "./mongodb";
import { safeObjectId } from "./mongo-utils";
import { User, UserSession, UserRole } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "vegi_shop_fallback_secret_key_needs_replacement";
const key = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "vegi_session";
const SESSION_EXPIRY = (Number(process.env.SESSION_EXPIRY_HOURS) || 24) * 3600; // in seconds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY}s`)
    .sign(key);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: UserSession): Promise<void> {
  const token = await createToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifyToken(token);
    if (!session) return null;

    const db = await getDb();
    const objectId = safeObjectId(session.userId);
    if (!objectId) return null;

    const user = await db.collection<User>("users").findOne({
      _id: objectId,
      isActive: true,
    });

    if (!user) return null;

    return {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<UserSession> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Admin privileges required");
  }
  return user;
}
