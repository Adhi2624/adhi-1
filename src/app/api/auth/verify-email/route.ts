import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/services/email-service";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", request.url));
  }

  const result = await emailService.verifyEmailToken(token);

  if (result.verified) {
    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  }

  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(result.error || "verification-failed")}`, request.url)
  );
}
