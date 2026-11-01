import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDb = {
  getUserCount: vi.fn(),
  getResumeCount: vi.fn(),
  listUsers: vi.fn(),
  getMcpCallCountAll: vi.fn(),
  getMcpCallCountPerUser: vi.fn(),
  getMcpCallsAll: vi.fn(),
  getUserById: vi.fn(),
  getResumeCountByUser: vi.fn(),
  getMcpCallCount: vi.fn(),
  getMcpCallsByUser: vi.fn(),
};

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => Promise.resolve(mockDb)),
}));

import { analyticsService, AnalyticsError } from "@/services/analytics-service";

describe("AnalyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlatformAnalytics", () => {
    it("returns aggregated platform analytics", async () => {
      mockDb.getUserCount.mockResolvedValue(10);
      mockDb.getResumeCount.mockResolvedValue(25);
      mockDb.listUsers.mockResolvedValue([
        { id: "1", email: "a@t.com", name: "A", role: "user", tier: "free", emailVerified: true, createdAt: "2024-01-01" },
        { id: "2", email: "b@t.com", name: "B", role: "admin", tier: "pro", emailVerified: true, createdAt: "2024-01-02" },
      ]);
      mockDb.getMcpCallCountAll.mockResolvedValue(5);
      mockDb.getMcpCallCountPerUser.mockResolvedValue([{ userId: "1", count: 3 }]);
      mockDb.getMcpCallsAll.mockResolvedValue([]);

      const result = await analyticsService.getPlatformAnalytics();

      expect(result.totalUsers).toBe(10);
      expect(result.totalResumes).toBe(25);
      expect(result.tierDistribution).toEqual({ free: 1, pro: 1 });
      expect(result.topMcpUsers).toHaveLength(1);
      expect(result.topMcpUsers[0].email).toBe("a@t.com");
    });
  });

  describe("getUserAnalytics", () => {
    it("returns analytics for a specific user", async () => {
      mockDb.getUserById.mockResolvedValue({
        id: "user-1", email: "test@t.com", name: "Test",
        tier: "pro", role: "user", emailVerified: true, createdAt: "2024-01-01",
      });
      mockDb.getResumeCountByUser.mockResolvedValue(3);
      mockDb.getMcpCallCount.mockResolvedValue(10);
      mockDb.getMcpCallsByUser.mockResolvedValue([]);

      const result = await analyticsService.getUserAnalytics("user-1");

      expect(result.userId).toBe("user-1");
      expect(result.email).toBe("test@t.com");
      expect(result.tier).toBe("pro");
      expect(result.resumeCount).toBe(3);
      expect(result.mcpConnected).toBe(true);
    });

    it("throws 404 for non-existent user", async () => {
      mockDb.getUserById.mockResolvedValue(null);

      try {
        await analyticsService.getUserAnalytics("ghost");
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(AnalyticsError);
        expect((err as AnalyticsError).status).toBe(404);
      }
    });

    it("reports mcpConnected false when no calls", async () => {
      mockDb.getUserById.mockResolvedValue({
        id: "user-1", email: "test@t.com", name: "Test",
        tier: "free", role: "user", emailVerified: false, createdAt: "2024-01-01",
      });
      mockDb.getResumeCountByUser.mockResolvedValue(0);
      mockDb.getMcpCallCount.mockResolvedValue(0);
      mockDb.getMcpCallsByUser.mockResolvedValue([]);

      const result = await analyticsService.getUserAnalytics("user-1");
      expect(result.mcpConnected).toBe(false);
    });
  });
});
