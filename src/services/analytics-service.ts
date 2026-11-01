import { getDb } from "@/lib/db";
import type { McpCallLog } from "@/lib/db/types";

export interface PlatformAnalytics {
  totalUsers: number;
  totalResumes: number;
  mcpCallsLastHour: number;
  mcpCallsLast24h: number;
  mcpCallsLast7d: number;
  mcpCallsTotal: number;
  topMcpUsers: { userId: string; email?: string; count: number }[];
  recentMcpCalls: McpCallLog[];
  tierDistribution: Record<string, number>;
}

export interface UserAnalytics {
  userId: string;
  email: string;
  name: string;
  tier: string;
  role: string;
  resumeCount: number;
  mcpCallsLastHour: number;
  mcpCallsLast24h: number;
  mcpCallsTotal: number;
  recentMcpCalls: McpCallLog[];
  mcpConnected: boolean;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

export class AnalyticsService {
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const db = await getDb();
    const epoch = "1970-01-01T00:00:00.000Z";

    const [
      totalUsers, totalResumes, users,
      mcpCallsLastHour, mcpCallsLast24h, mcpCallsLast7d, mcpCallsTotal,
      topMcpUsers, recentMcpCalls,
    ] = await Promise.all([
      db.getUserCount(),
      db.getResumeCount(),
      db.listUsers(),
      db.getMcpCallCountAll(hoursAgo(1)),
      db.getMcpCallCountAll(hoursAgo(24)),
      db.getMcpCallCountAll(daysAgo(7)),
      db.getMcpCallCountAll(epoch),
      db.getMcpCallCountPerUser(daysAgo(7)),
      db.getMcpCallsAll(daysAgo(7), 20),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));

    const tierDistribution: Record<string, number> = {};
    for (const u of users) {
      const tier = u.tier || "free";
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    }

    return {
      totalUsers,
      totalResumes,
      mcpCallsLastHour,
      mcpCallsLast24h,
      mcpCallsLast7d,
      mcpCallsTotal,
      topMcpUsers: topMcpUsers.slice(0, 10).map((t) => ({
        ...t,
        email: userMap.get(t.userId)?.email,
      })),
      recentMcpCalls,
      tierDistribution,
    };
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const db = await getDb();
    const epoch = "1970-01-01T00:00:00.000Z";

    const user = await db.getUserById(userId);
    if (!user) throw new AnalyticsError("User not found", 404);

    const [resumeCount, mcpCallsLastHour, mcpCallsLast24h, mcpCallsTotal, recentMcpCalls] =
      await Promise.all([
        db.getResumeCountByUser(userId),
        db.getMcpCallCount(userId, hoursAgo(1)),
        db.getMcpCallCount(userId, hoursAgo(24)),
        db.getMcpCallCount(userId, epoch),
        db.getMcpCallsByUser(userId, daysAgo(30), 50),
      ]);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier || "free",
      role: user.role,
      resumeCount,
      mcpCallsLastHour,
      mcpCallsLast24h,
      mcpCallsTotal,
      recentMcpCalls,
      mcpConnected: mcpCallsTotal > 0,
    };
  }
}

export class AnalyticsError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AnalyticsError";
  }
}

export const analyticsService = new AnalyticsService();
