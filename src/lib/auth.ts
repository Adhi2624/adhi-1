import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import type { SafeUser, UserRole } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "typeset-dev-secret-change-in-production"
);

const COOKIE_NAME = "typeset-session";

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function createToken(user: SafeUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<SafeUser> {
  const db = await getDb();
  const hash = await bcrypt.hash(password, 10);
  return db.createUser({ name, email, passwordHash: hash });
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const db = await getDb();
  const user = await db.getUserByEmail(email);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export { COOKIE_NAME, SECRET };
