import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { getEmail } from "@/lib/email";
import { checkEmailRateLimit, recordEmailSend } from "./rate-limit";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function sendVerificationEmail(email: string): Promise<{ sent: boolean; error?: string }> {
  const rateCheck = await checkEmailRateLimit(email, "verification");
  if (!rateCheck.allowed) {
    return { sent: false, error: `Too many verification emails. Try again in ${rateCheck.retryAfterSeconds} seconds.` };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const db = await getDb();
  await db.createEmailToken(email, "verification", token, expiresAt);

  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  const emailAdapter = await getEmail();
  const sent = await emailAdapter.send({
    to: email,
    subject: "Verify your Typeset account",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111; margin-bottom: 16px;">Welcome to Typeset</h2>
        <p style="color: #444; line-height: 1.6;">Click the link below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">Verify Email</a>
        <p style="color: #888; font-size: 13px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        <p style="color: #888; font-size: 13px;">Or copy this URL: ${verifyUrl}</p>
      </div>
    `,
    text: `Welcome to Typeset!\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  });

  if (sent) {
    await recordEmailSend(email, "verification");
  }

  return { sent };
}

export async function verifyEmailToken(token: string): Promise<{ verified: boolean; error?: string }> {
  const db = await getDb();
  const entry = await db.getEmailToken(token, "verification");

  if (!entry) {
    return { verified: false, error: "Invalid or expired verification link." };
  }

  const user = await db.getUserByEmail(entry.email);
  if (!user) {
    return { verified: false, error: "User not found." };
  }

  await db.setEmailVerified(user.id, true);
  await db.markEmailTokenUsed(token);

  return { verified: true };
}

export async function sendPasswordResetEmail(email: string): Promise<{ sent: boolean; error?: string }> {
  const db = await getDb();
  const user = await db.getUserByEmail(email);
  if (!user) {
    return { sent: true };
  }

  const rateCheck = await checkEmailRateLimit(email, "password-reset");
  if (!rateCheck.allowed) {
    return { sent: false, error: `Too many reset requests. Try again in ${rateCheck.retryAfterSeconds} seconds.` };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await db.createEmailToken(email, "password-reset", token, expiresAt);

  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const emailAdapter = await getEmail();
  const sent = await emailAdapter.send({
    to: email,
    subject: "Reset your Typeset password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111; margin-bottom: 16px;">Password Reset</h2>
        <p style="color: #444; line-height: 1.6;">Click the link below to reset your password.</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">Reset Password</a>
        <p style="color: #888; font-size: 13px;">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
        <p style="color: #888; font-size: 13px;">Or copy this URL: ${resetUrl}</p>
      </div>
    `,
    text: `Reset your Typeset password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`,
  });

  if (sent) {
    await recordEmailSend(email, "password-reset");
  }

  return { sent };
}

export async function resetPasswordWithToken(
  token: string,
  newPasswordHash: string
): Promise<{ reset: boolean; error?: string }> {
  const db = await getDb();
  const entry = await db.getEmailToken(token, "password-reset");

  if (!entry) {
    return { reset: false, error: "Invalid or expired reset link." };
  }

  const user = await db.getUserByEmail(entry.email);
  if (!user) {
    return { reset: false, error: "User not found." };
  }

  await db.updateUserPassword(user.id, newPasswordHash);
  await db.markEmailTokenUsed(token);

  return { reset: true };
}
