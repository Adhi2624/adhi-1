import { getDb } from "@/lib/db";
import type { SafeUser, UserRole, PricingTier } from "@/lib/db/types";

export interface AdminStats {
  totalUsers: number;
  totalResumes: number;
  admins: number;
  recentUsers: number;
}

export interface UserWithResumeCount extends SafeUser {
  resumeCount: number;
}

export class AdminService {
  async getStats(): Promise<AdminStats> {
    const db = await getDb();
    const [users, totalUsers, totalResumes] = await Promise.all([
      db.listUsers(),
      db.getUserCount(),
      db.getResumeCount(),
    ]);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      totalUsers,
      totalResumes,
      admins: users.filter((u) => u.role === "admin").length,
      recentUsers: users.filter((u) => new Date(u.createdAt) > weekAgo).length,
    };
  }

  async listUsersWithCounts(): Promise<UserWithResumeCount[]> {
    const db = await getDb();
    const users = await db.listUsers();

    return Promise.all(
      users.map(async (u) => ({
        ...u,
        resumeCount: await db.getResumeCountByUser(u.id),
      }))
    );
  }

  async updateUserRole(userId: string, role: UserRole): Promise<SafeUser> {
    if (!userId || !role) {
      throw new AdminError("userId and role required", 400);
    }
    const db = await getDb();
    const updated = await db.updateUserRole(userId, role);
    if (!updated) {
      throw new AdminError("User not found", 404);
    }
    return updated;
  }

  async updateUserTier(userId: string, tier: PricingTier): Promise<SafeUser> {
    if (!userId || !tier) {
      throw new AdminError("userId and tier required", 400);
    }
    const validTiers: PricingTier[] = ["free", "pro", "team"];
    if (!validTiers.includes(tier)) {
      throw new AdminError("Invalid tier. Must be: free, pro, or team", 400);
    }
    const db = await getDb();
    const updated = await db.updateUserTier(userId, tier);
    if (!updated) {
      throw new AdminError("User not found", 404);
    }
    return updated;
  }

  async deleteUser(userId: string, currentUserId: string): Promise<void> {
    if (userId === currentUserId) {
      throw new AdminError("Cannot delete yourself", 400);
    }
    const db = await getDb();
    const ok = await db.deleteUser(userId);
    if (!ok) {
      throw new AdminError("User not found", 404);
    }
  }
}

export class AdminError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AdminError";
  }
}

export const adminService = new AdminService();
