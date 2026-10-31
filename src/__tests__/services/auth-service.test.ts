import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService, AuthError } from "@/services/auth-service";

vi.mock("@/lib/db", () => {
  const users = new Map<string, { id: string; name: string; email: string; passwordHash: string; role: string; emailVerified: boolean; createdAt: string }>();

  return {
    getDb: vi.fn().mockResolvedValue({
      createUser: vi.fn().mockImplementation(async (input: { name: string; email: string; passwordHash: string }) => {
        if (users.has(input.email)) throw new Error("Email already registered");
        const user = { id: "user-1", name: input.name, email: input.email, role: "user", emailVerified: false, createdAt: new Date().toISOString() };
        users.set(input.email, { ...user, passwordHash: input.passwordHash });
        return user;
      }),
      getUserByEmail: vi.fn().mockImplementation(async (email: string) => {
        return users.get(email) || null;
      }),
      updateUserPassword: vi.fn().mockResolvedValue(true),
      setEmailVerified: vi.fn().mockResolvedValue(true),
    }),
    __users: users,
  };
});

vi.mock("@/lib/auth", () => ({
  createToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  verifyToken: vi.fn().mockImplementation(async (token: string) => {
    if (token === "valid-token") return { id: "user-1", email: "test@test.com", name: "Test", role: "user" };
    return null;
  }),
}));

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    service = new AuthService();
    const mod = await import("@/lib/db");
    (mod as unknown as { __users: Map<string, unknown> }).__users.clear();
  });

  describe("register", () => {
    it("creates a new user and returns token", async () => {
      const result = await service.register({
        name: "John",
        email: "john@test.com",
        password: "password123",
      });

      expect(result.user).toBeDefined();
      expect(result.user.name).toBe("John");
      expect(result.user.email).toBe("john@test.com");
      expect(result.token).toBe("mock-jwt-token");
    });

    it("throws AuthError for missing name", async () => {
      await expect(
        service.register({ name: "", email: "a@b.com", password: "123456" })
      ).rejects.toThrow(AuthError);
    });

    it("throws AuthError for missing email", async () => {
      await expect(
        service.register({ name: "John", email: "", password: "123456" })
      ).rejects.toThrow(AuthError);
    });

    it("throws AuthError for short password", async () => {
      await expect(
        service.register({ name: "John", email: "j@t.com", password: "12345" })
      ).rejects.toThrow(AuthError);

      try {
        await service.register({ name: "John", email: "j@t.com", password: "123" });
      } catch (err) {
        expect(err).toBeInstanceOf(AuthError);
        expect((err as AuthError).status).toBe(400);
      }
    });

    it("throws AuthError for duplicate email", async () => {
      await service.register({ name: "John", email: "dup@test.com", password: "password123" });

      await expect(
        service.register({ name: "Jane", email: "dup@test.com", password: "password456" })
      ).rejects.toThrow(AuthError);
    });
  });

  describe("login", () => {
    it("throws AuthError for missing email", async () => {
      await expect(service.login("", "pass")).rejects.toThrow(AuthError);
    });

    it("throws AuthError for missing password", async () => {
      await expect(service.login("a@b.com", "")).rejects.toThrow(AuthError);
    });

    it("throws AuthError for non-existent user", async () => {
      try {
        await service.login("nobody@test.com", "password123");
      } catch (err) {
        expect(err).toBeInstanceOf(AuthError);
        expect((err as AuthError).status).toBe(401);
        expect((err as AuthError).message).toBe("Invalid email or password");
      }
    });
  });

  describe("verifySession", () => {
    it("returns payload for valid token", async () => {
      const result = await service.verifySession("valid-token");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("user-1");
    });

    it("returns null for invalid token", async () => {
      const result = await service.verifySession("bad-token");
      expect(result).toBeNull();
    });
  });
});
