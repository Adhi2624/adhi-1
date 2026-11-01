import { describe, it, expect, beforeEach } from "vitest";
import { MemoryAdapter } from "@/lib/db/memory";

describe("MemoryAdapter", () => {
  let db: MemoryAdapter;

  beforeEach(() => {
    db = new MemoryAdapter();
  });

  describe("Users", () => {
    it("creates a user", async () => {
      const user = await db.createUser({
        name: "Alice",
        email: "alice@test.com",
        passwordHash: "hash123",
      });
      expect(user.name).toBe("Alice");
      expect(user.email).toBe("alice@test.com");
      expect(user.role).toBe("user");
      expect(user.emailVerified).toBe(false);
      expect(user).not.toHaveProperty("passwordHash");
    });

    it("rejects duplicate emails", async () => {
      await db.createUser({ name: "A", email: "a@test.com", passwordHash: "h" });
      await expect(
        db.createUser({ name: "B", email: "a@test.com", passwordHash: "h" })
      ).rejects.toThrow("Email already registered");
    });

    it("gets user by email (with hash)", async () => {
      await db.createUser({ name: "A", email: "a@test.com", passwordHash: "hash123" });
      const user = await db.getUserByEmail("a@test.com");
      expect(user).not.toBeNull();
      expect(user!.passwordHash).toBe("hash123");
    });

    it("gets user by id (safe, no hash)", async () => {
      const created = await db.createUser({ name: "A", email: "a@test.com", passwordHash: "h" });
      const user = await db.getUserById(created.id);
      expect(user).not.toBeNull();
      expect(user).not.toHaveProperty("passwordHash");
    });

    it("returns null for non-existent user", async () => {
      expect(await db.getUserByEmail("none@test.com")).toBeNull();
      expect(await db.getUserById("fake-id")).toBeNull();
    });

    it("lists users sorted by createdAt desc", async () => {
      await db.createUser({ name: "First", email: "1@t.com", passwordHash: "h" });
      await db.createUser({ name: "Second", email: "2@t.com", passwordHash: "h" });
      const users = await db.listUsers();
      expect(users).toHaveLength(2);
      expect(new Date(users[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(users[1].createdAt).getTime()
      );
    });

    it("updates user role", async () => {
      const user = await db.createUser({ name: "A", email: "a@t.com", passwordHash: "h" });
      const updated = await db.updateUserRole(user.id, "admin");
      expect(updated!.role).toBe("admin");
    });

    it("updates user password", async () => {
      const user = await db.createUser({ name: "A", email: "a@t.com", passwordHash: "old" });
      const result = await db.updateUserPassword(user.id, "new");
      expect(result).toBe(true);

      const fetched = await db.getUserByEmail("a@t.com");
      expect(fetched!.passwordHash).toBe("new");
    });

    it("sets email verified", async () => {
      const user = await db.createUser({ name: "A", email: "a@t.com", passwordHash: "h" });
      await db.setEmailVerified(user.id, true);
      const fetched = await db.getUserById(user.id);
      expect(fetched!.emailVerified).toBe(true);
    });

    it("deletes a user", async () => {
      const user = await db.createUser({ name: "A", email: "a@t.com", passwordHash: "h" });
      expect(await db.deleteUser(user.id)).toBe(true);
      expect(await db.getUserById(user.id)).toBeNull();
      expect(await db.getUserCount()).toBe(0);
    });

    it("returns false for deleting non-existent user", async () => {
      expect(await db.deleteUser("ghost")).toBe(false);
    });

    it("counts users", async () => {
      expect(await db.getUserCount()).toBe(0);
      await db.createUser({ name: "A", email: "a@t.com", passwordHash: "h" });
      expect(await db.getUserCount()).toBe(1);
    });
  });

  describe("Resumes", () => {
    it("creates and retrieves a resume", async () => {
      const resume = await db.createResume("user-1", "My CV", "\\doc{}");
      expect(resume.userId).toBe("user-1");
      expect(resume.name).toBe("My CV");

      const fetched = await db.getResume(resume.id);
      expect(fetched).toEqual(resume);
    });

    it("updates a resume", async () => {
      const resume = await db.createResume("user-1", "Old", "old-latex");
      const updated = await db.updateResume(resume.id, { name: "New", latex: "new-latex" });
      expect(updated!.name).toBe("New");
      expect(updated!.latex).toBe("new-latex");
    });

    it("deletes a resume", async () => {
      const resume = await db.createResume("user-1", "R", "l");
      expect(await db.deleteResume(resume.id)).toBe(true);
      expect(await db.getResume(resume.id)).toBeNull();
    });

    it("lists resumes by user", async () => {
      await db.createResume("user-1", "R1", "l1");
      await db.createResume("user-2", "R2", "l2");
      await db.createResume("user-1", "R3", "l3");

      const user1 = await db.listResumesByUser("user-1");
      expect(user1).toHaveLength(2);
      expect(user1.every((r) => r.userId === "user-1")).toBe(true);
    });

    it("counts resumes", async () => {
      await db.createResume("user-1", "R1", "l1");
      await db.createResume("user-1", "R2", "l2");
      expect(await db.getResumeCount()).toBe(2);
      expect(await db.getResumeCountByUser("user-1")).toBe(2);
      expect(await db.getResumeCountByUser("user-2")).toBe(0);
    });

    it("returns null for non-existent resume", async () => {
      expect(await db.getResume("nonexistent")).toBeNull();
      expect(await db.updateResume("nonexistent", { name: "x" })).toBeNull();
    });
  });

  describe("Email tokens", () => {
    it("creates and retrieves a token", async () => {
      const future = new Date(Date.now() + 3600000).toISOString();
      const token = await db.createEmailToken("a@t.com", "verification", "tok-123", future);
      expect(token.email).toBe("a@t.com");
      expect(token.type).toBe("verification");

      const fetched = await db.getEmailToken("tok-123", "verification");
      expect(fetched).not.toBeNull();
      expect(fetched!.token).toBe("tok-123");
    });

    it("returns null for expired token", async () => {
      const past = new Date(Date.now() - 1000).toISOString();
      await db.createEmailToken("a@t.com", "verification", "expired-tok", past);
      expect(await db.getEmailToken("expired-tok", "verification")).toBeNull();
    });

    it("returns null for wrong type", async () => {
      const future = new Date(Date.now() + 3600000).toISOString();
      await db.createEmailToken("a@t.com", "verification", "tok", future);
      expect(await db.getEmailToken("tok", "password-reset")).toBeNull();
    });

    it("marks token as used", async () => {
      const future = new Date(Date.now() + 3600000).toISOString();
      await db.createEmailToken("a@t.com", "verification", "tok", future);
      expect(await db.markEmailTokenUsed("tok")).toBe(true);
      expect(await db.getEmailToken("tok", "verification")).toBeNull();
    });

    it("deletes expired tokens", async () => {
      const past = new Date(Date.now() - 1000).toISOString();
      const future = new Date(Date.now() + 3600000).toISOString();
      await db.createEmailToken("a@t.com", "verification", "expired", past);
      await db.createEmailToken("b@t.com", "verification", "valid", future);

      const deleted = await db.deleteExpiredTokens();
      expect(deleted).toBe(1);
      expect(await db.getEmailToken("valid", "verification")).not.toBeNull();
    });
  });

  describe("Rate limiting", () => {
    it("starts at 0 count", async () => {
      const count = await db.getEmailSendCount("a@t.com", "verification", "2024-01-01T00:00:00.000Z");
      expect(count).toBe(0);
    });

    it("increments count", async () => {
      const window = "2024-01-01T00:00:00.000Z";
      await db.incrementEmailSendCount("a@t.com", "verification", window);
      await db.incrementEmailSendCount("a@t.com", "verification", window);
      expect(await db.getEmailSendCount("a@t.com", "verification", window)).toBe(2);
    });

    it("resets count for new window", async () => {
      await db.incrementEmailSendCount("a@t.com", "verification", "window-1");
      await db.incrementEmailSendCount("a@t.com", "verification", "window-1");
      expect(await db.getEmailSendCount("a@t.com", "verification", "window-2")).toBe(0);
    });

    it("tracks different types independently", async () => {
      const window = "2024-01-01T00:00:00.000Z";
      await db.incrementEmailSendCount("a@t.com", "verification", window);
      await db.incrementEmailSendCount("a@t.com", "password-reset", window);
      expect(await db.getEmailSendCount("a@t.com", "verification", window)).toBe(1);
      expect(await db.getEmailSendCount("a@t.com", "password-reset", window)).toBe(1);
    });
  });

  describe("User tiers", () => {
    it("creates users with free tier by default", async () => {
      const user = await db.createUser({ name: "A", email: "a@t.com", passwordHash: "h" });
      expect(user.tier).toBe("free");
    });

    it("updates user tier", async () => {
      const user = await db.createUser({ name: "A", email: "a@t.com", passwordHash: "h" });
      const updated = await db.updateUserTier(user.id, "pro");
      expect(updated!.tier).toBe("pro");
    });

    it("returns null for non-existent user tier update", async () => {
      expect(await db.updateUserTier("ghost", "pro")).toBeNull();
    });
  });

  describe("MCP call logging", () => {
    it("logs an MCP call", async () => {
      const log = await db.logMcpCall("user-1", "tools/call", "list_templates");
      expect(log.userId).toBe("user-1");
      expect(log.method).toBe("tools/call");
      expect(log.toolName).toBe("list_templates");
      expect(log.id).toBeDefined();
      expect(log.timestamp).toBeDefined();
    });

    it("counts MCP calls per user since a timestamp", async () => {
      const past = new Date(Date.now() - 10000).toISOString();
      await db.logMcpCall("user-1", "tools/call", "list_templates");
      await db.logMcpCall("user-1", "tools/call", "get_template");
      await db.logMcpCall("user-2", "tools/call", "list_templates");

      expect(await db.getMcpCallCount("user-1", past)).toBe(2);
      expect(await db.getMcpCallCount("user-2", past)).toBe(1);
    });

    it("counts all MCP calls since a timestamp", async () => {
      const past = new Date(Date.now() - 10000).toISOString();
      await db.logMcpCall("user-1", "tools/call", "t1");
      await db.logMcpCall("user-2", "tools/call", "t2");

      expect(await db.getMcpCallCountAll(past)).toBe(2);
    });

    it("gets MCP calls by user with limit", async () => {
      const past = new Date(Date.now() - 10000).toISOString();
      await db.logMcpCall("user-1", "tools/call", "t1");
      await db.logMcpCall("user-1", "tools/call", "t2");
      await db.logMcpCall("user-1", "tools/call", "t3");

      const calls = await db.getMcpCallsByUser("user-1", past, 2);
      expect(calls).toHaveLength(2);
    });

    it("gets all MCP calls with limit", async () => {
      const past = new Date(Date.now() - 10000).toISOString();
      await db.logMcpCall("user-1", "tools/call", "t1");
      await db.logMcpCall("user-2", "tools/call", "t2");
      await db.logMcpCall("user-1", "tools/call", "t3");

      const calls = await db.getMcpCallsAll(past, 2);
      expect(calls).toHaveLength(2);
    });

    it("gets MCP call counts per user", async () => {
      const past = new Date(Date.now() - 10000).toISOString();
      await db.logMcpCall("user-1", "tools/call", "t1");
      await db.logMcpCall("user-1", "tools/call", "t2");
      await db.logMcpCall("user-2", "tools/call", "t3");

      const counts = await db.getMcpCallCountPerUser(past);
      expect(counts).toHaveLength(2);
      expect(counts[0].userId).toBe("user-1");
      expect(counts[0].count).toBe(2);
      expect(counts[1].userId).toBe("user-2");
      expect(counts[1].count).toBe(1);
    });
  });

  describe("Platform config", () => {
    it("returns null for non-existent config", async () => {
      expect(await db.getConfig("nonexistent")).toBeNull();
    });

    it("sets and gets config", async () => {
      await db.setConfig("test_key", "test_value");
      expect(await db.getConfig("test_key")).toBe("test_value");
    });

    it("overwrites existing config", async () => {
      await db.setConfig("key", "old");
      await db.setConfig("key", "new");
      expect(await db.getConfig("key")).toBe("new");
    });

    it("lists all config entries", async () => {
      await db.setConfig("key1", "val1");
      await db.setConfig("key2", "val2");
      const all = await db.getAllConfig();
      expect(all).toHaveLength(2);
      expect(all.map((c) => c.key).sort()).toEqual(["key1", "key2"]);
    });
  });
});
