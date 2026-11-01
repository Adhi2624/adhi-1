import { getDb } from "@/lib/db";
import { DEFAULT_RATE_LIMITS } from "@/lib/db/types";

async function getRateLimitsConfig(): Promise<Record<string, { maxPerWindow: number; windowMinutes: number }>> {
  const db = await getDb();
  const raw = await db.getConfig("rate_limits");
  if (raw) {
    return JSON.parse(raw);
  }
  return DEFAULT_RATE_LIMITS;
}

function getWindowStart(windowMinutes: number): string {
  const now = new Date();
  const windowMs = windowMinutes * 60 * 1000;
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  return windowStart.toISOString();
}

export async function checkEmailRateLimit(email: string, type: string): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const allLimits = await getRateLimitsConfig();
  const config = allLimits[type] || { maxPerWindow: 5, windowMinutes: 60 };
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
  const allLimits = await getRateLimitsConfig();
  const config = allLimits[type] || { maxPerWindow: 5, windowMinutes: 60 };
  const windowStart = getWindowStart(config.windowMinutes);

  const db = await getDb();
  await db.incrementEmailSendCount(email, type, windowStart);
}
