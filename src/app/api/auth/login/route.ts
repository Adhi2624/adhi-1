import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { authService, AuthError } from "@/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const { user, token } = await authService.login(email, password);
    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
