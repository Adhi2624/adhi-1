import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email/tokens";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const result = await sendPasswordResetEmail(email);

  if (!result.sent && result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: 429 }
    );
  }

  return NextResponse.json({
    message: "If an account with that email exists, a reset link has been sent.",
  });
}
