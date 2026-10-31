import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/user-store";
import { createToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await verifyCredentials(email, password);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await createToken(user);
  await setSessionCookie(token);

  return NextResponse.json({ user });
}
