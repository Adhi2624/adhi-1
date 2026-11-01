import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDb = {
  getConfig: vi.fn(),
  setConfig: vi.fn(),
  getAllConfig: vi.fn(),
};

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => Promise.resolve(mockDb)),
}));

import { configService, ConfigError } from "@/services/config-service";
import { DEFAULT_TIER_LIMITS } from "@/lib/db/types";

describe("ConfigService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConfig / setConfig", () => {
    it("gets a config value", async () => {
      mockDb.getConfig.mockResolvedValue("some-value");
      const result = await configService.getConfig("some-key");
      expect(result).toBe("some-value");
    });

    it("sets a config value", async () => {
      mockDb.setConfig.mockResolvedValue(undefined);
      await configService.setConfig("key", "value");
      expect(mockDb.setConfig).toHaveBeenCalledWith("key", "value");
    });

    it("throws on empty key", async () => {
      try {
        await configService.setConfig("", "value");
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ConfigError);
        expect((err as ConfigError).status).toBe(400);
      }
    });
  });

  describe("getTierLimits", () => {
    it("returns stored tier limits when configured", async () => {
      const customLimits = { ...DEFAULT_TIER_LIMITS.pro, maxMcpCallsPerHour: 200 };
      mockDb.getConfig.mockResolvedValue(JSON.stringify(customLimits));

      const result = await configService.getTierLimits("pro");
      expect(result.maxMcpCallsPerHour).toBe(200);
    });

    it("returns default tier limits when not configured", async () => {
      mockDb.getConfig.mockResolvedValue(null);

      const result = await configService.getTierLimits("free");
      expect(result).toEqual(DEFAULT_TIER_LIMITS.free);
    });
  });

  describe("setTierLimits", () => {
    it("stores tier limits as JSON", async () => {
      mockDb.setConfig.mockResolvedValue(undefined);
      await configService.setTierLimits("pro", DEFAULT_TIER_LIMITS.pro);
      expect(mockDb.setConfig).toHaveBeenCalledWith(
        "tier_limits:pro",
        JSON.stringify(DEFAULT_TIER_LIMITS.pro)
      );
    });
  });

  describe("getAllTierLimits", () => {
    it("returns limits for all tiers", async () => {
      mockDb.getConfig.mockResolvedValue(null);

      const result = await configService.getAllTierLimits();
      expect(result.free).toEqual(DEFAULT_TIER_LIMITS.free);
      expect(result.pro).toEqual(DEFAULT_TIER_LIMITS.pro);
      expect(result.team).toEqual(DEFAULT_TIER_LIMITS.team);
    });
  });

  describe("getRateLimits / setRateLimits", () => {
    it("returns stored rate limits when configured", async () => {
      const custom = { verification: { maxPerWindow: 10, windowMinutes: 30 } };
      mockDb.getConfig.mockResolvedValue(JSON.stringify(custom));

      const result = await configService.getRateLimits();
      expect(result.verification.maxPerWindow).toBe(10);
    });

    it("returns defaults when not configured", async () => {
      mockDb.getConfig.mockResolvedValue(null);

      const result = await configService.getRateLimits();
      expect(result.verification.maxPerWindow).toBe(3);
    });

    it("stores rate limits as JSON", async () => {
      const limits = { verification: { maxPerWindow: 5, windowMinutes: 60 } };
      mockDb.setConfig.mockResolvedValue(undefined);
      await configService.setRateLimits(limits);
      expect(mockDb.setConfig).toHaveBeenCalledWith("rate_limits", JSON.stringify(limits));
    });
  });

  describe("getAllConfig", () => {
    it("returns all config entries", async () => {
      const entries = [
        { key: "k1", value: "v1", updatedAt: "2024-01-01" },
        { key: "k2", value: "v2", updatedAt: "2024-01-02" },
      ];
      mockDb.getAllConfig.mockResolvedValue(entries);

      const result = await configService.getAllConfig();
      expect(result).toEqual(entries);
    });
  });
});
