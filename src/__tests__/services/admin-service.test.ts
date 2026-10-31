import { describe, it, expect, beforeEach, vi } from "vitest";
import { AdminService, AdminError } from "@/services/admin-service";

const mockUsers = new Map<string, { id: string; name: string; email: string; role: string; emailVerified: boolean; createdAt: string; resumeCount?: number }>();

vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockResolvedValue({
    listUsers: vi.fn().mockImplementation(async () => Array.from(mockUsers.values())),
    getUserCount: vi.fn().mockImplementation(async () => mockUsers.size),
    getResumeCount: vi.fn().mockResolvedValue(5),
    getResumeCountByUser: vi.fn().mockResolvedValue(2),
    updateUserRole: vi.fn().mockImplementation(async (id: string, role: string) => {
      const user = mockUsers.get(id);
      if (!user) return null;
      user.role = role;
      return user;
    }),
    deleteUser: vi.fn().mockImplementation(async (id: string) => {
      return mockUsers.delete(id);
    }),
  }),
}));

describe("AdminService", () => {
  let service: AdminService;

  beforeEach(() => {
    service = new AdminService();
    mockUsers.clear();
    mockUsers.set("admin-1", {
      id: "admin-1",
      name: "Admin",
      email: "admin@test.com",
      role: "admin",
      emailVerified: true,
      createdAt: new Date().toISOString(),
    });
    mockUsers.set("user-1", {
      id: "user-1",
      name: "User",
      email: "user@test.com",
      role: "user",
      emailVerified: true,
      createdAt: new Date().toISOString(),
    });
  });

  describe("getStats", () => {
    it("returns aggregated stats", async () => {
      const stats = await service.getStats();
      expect(stats.totalUsers).toBe(2);
      expect(stats.totalResumes).toBe(5);
      expect(stats.admins).toBe(1);
      expect(stats.recentUsers).toBe(2);
    });
  });

  describe("listUsersWithCounts", () => {
    it("returns users with resume counts", async () => {
      const users = await service.listUsersWithCounts();
      expect(users).toHaveLength(2);
      expect(users[0].resumeCount).toBe(2);
    });
  });

  describe("updateUserRole", () => {
    it("promotes a user to admin", async () => {
      const updated = await service.updateUserRole("user-1", "admin");
      expect(updated.role).toBe("admin");
    });

    it("throws AdminError for missing userId", async () => {
      await expect(service.updateUserRole("", "admin")).rejects.toThrow(AdminError);
    });

    it("throws AdminError for non-existent user", async () => {
      await expect(service.updateUserRole("fake-id", "admin")).rejects.toThrow(AdminError);
    });
  });

  describe("deleteUser", () => {
    it("deletes a user", async () => {
      await service.deleteUser("user-1", "admin-1");
      expect(mockUsers.has("user-1")).toBe(false);
    });

    it("prevents self-deletion", async () => {
      await expect(service.deleteUser("admin-1", "admin-1")).rejects.toThrow(AdminError);

      try {
        await service.deleteUser("admin-1", "admin-1");
      } catch (err) {
        expect((err as AdminError).message).toBe("Cannot delete yourself");
        expect((err as AdminError).status).toBe(400);
      }
    });

    it("throws AdminError for non-existent user", async () => {
      await expect(service.deleteUser("ghost", "admin-1")).rejects.toThrow(AdminError);
    });
  });
});
