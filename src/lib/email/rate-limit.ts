import { getDb } from "@/lib/db";

const RATE_LIMITS: Record<string, { maxPerWindow: number; windowMinutes: number }> = {
  verification: { maxPerWindow: 3, windowMinutes: 60 },
  "password-reset": { maxPerWindow: 3, windowMinutes: 60 },
};

function getWindowStart(windowMinutes: number): string {
  const now = new Date();
  const windowMs = windowMinutes * 60 * 1000;
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  return windowStart.toISOString();
}

export async function checkEmailRateLimit(email: string, type: string): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const config = RATE_LIMITS[type] || { maxPerWindow: 5, windowMinutes: 60 };
  const windowStart = getWindowStart(config.windowMinutes);

  const db = await getDb();
  const count = await db.getEmailSendCount(email, type, windowStart);

  if (count >= config.maxPerWindow) {
    const windowEnd = new Date(new Date(windowStart).getTime() + config.windowMinutes * 60 * 1000);
    const retryAfterSeconds = Math.ceil((windowEnd.getTime() - Date.now()) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export async function recordEmailSend(email: string, type: string): Promise<void> {
  const config = RATE_LIMITS[type] || { maxPerWindow: 5, windowMinutes: 60 };
  const windowStart = getWindowStart(config.windowMinutes);

  const db = await getDb();
  await db.incrementEmailSendCount(email, type, windowStart);
}
