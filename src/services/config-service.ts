import { getDb } from "@/lib/db";
import type { PlatformConfig, TierLimits, PricingTier } from "@/lib/db/types";
import { DEFAULT_TIER_LIMITS, DEFAULT_RATE_LIMITS } from "@/lib/db/types";

export class ConfigService {
  async getAllConfig(): Promise<PlatformConfig[]> {
    const db = await getDb();
    return db.getAllConfig();
  }

  async getConfig(key: string): Promise<string | null> {
    const db = await getDb();
    return db.getConfig(key);
  }

  async setConfig(key: string, value: string): Promise<void> {
    if (!key || typeof value !== "string") {
      throw new ConfigError("key and value required", 400);
    }
    const db = await getDb();
    await db.setConfig(key, value);
  }

  async getTierLimits(tier: PricingTier): Promise<TierLimits> {
    const db = await getDb();
    const raw = await db.getConfig(`tier_limits:${tier}`);
    if (raw) {
      return JSON.parse(raw) as TierLimits;
    }
    return DEFAULT_TIER_LIMITS[tier];
  }

  async setTierLimits(tier: PricingTier, limits: TierLimits): Promise<void> {
    const db = await getDb();
    await db.setConfig(`tier_limits:${tier}`, JSON.stringify(limits));
  }

  async getAllTierLimits(): Promise<Record<PricingTier, TierLimits>> {
    const tiers: PricingTier[] = ["free", "pro", "team"];
    const result = {} as Record<PricingTier, TierLimits>;
    for (const tier of tiers) {
      result[tier] = await this.getTierLimits(tier);
    }
    return result;
  }

  async getRateLimits(): Promise<Record<string, { maxPerWindow: number; windowMinutes: number }>> {
    const db = await getDb();
    const raw = await db.getConfig("rate_limits");
    if (raw) {
      return JSON.parse(raw);
    }
    return DEFAULT_RATE_LIMITS;
  }

  async setRateLimits(limits: Record<string, { maxPerWindow: number; windowMinutes: number }>): Promise<void> {
    const db = await getDb();
    await db.setConfig("rate_limits", JSON.stringify(limits));
  }
}

export class ConfigError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ConfigError";
  }
}

export const configService = new ConfigService();
