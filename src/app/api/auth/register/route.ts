import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { authService, AuthError } from "@/services/auth-service";
import { emailService } from "@/services/email-service";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    const { user, token } = await authService.register({ name, email, password });
    await setSessionCookie(token);

    emailService.sendVerificationEmail(email).catch(() => {});

    return NextResponse.json({ user }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
