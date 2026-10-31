import { NextRequest, NextResponse } from "next/server";
import { registerUser, createToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  try {
    const user = await registerUser(name, email, password);
    const token = await createToken(user);
    await setSessionCookie(token);
    return NextResponse.json({ user }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
