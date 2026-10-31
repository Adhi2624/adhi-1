import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email/tokens";

export async function POST(_request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendVerificationEmail(session.email);

  if (!result.sent && result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: 429 }
    );
  }

  return NextResponse.json({ message: "Verification email sent." });
}
