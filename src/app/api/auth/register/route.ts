import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/user-store";
import { createToken, setSessionCookie } from "@/lib/auth";

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

  const result = await createUser(name, email, password);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const token = await createToken(result);
  await setSessionCookie(token);

  return NextResponse.json({ user: result }, { status: 201 });
}
