import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createToken, verifyToken } from "@/lib/auth";
import type { SafeUser, User } from "@/lib/db/types";
import type { JwtPayload } from "@/lib/auth";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginResult {
  user: SafeUser;
  token: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<LoginResult> {
    if (!input.name || !input.email || !input.password) {
      throw new AuthError("Name, email, and password are required", 400);
    }
    if (input.password.length < 6) {
      throw new AuthError("Password must be at least 6 characters", 400);
    }

    const db = await getDb();
    const hash = await bcrypt.hash(input.password, 10);

    try {
      const user = await db.createUser({
        name: input.name,
        email: input.email,
        passwordHash: hash,
      });
      const token = await createToken(user);
      return { user, token };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      throw new AuthError(message, 409);
    }
  }

  async login(email: string, password: string): Promise<LoginResult> {
    if (!email || !password) {
      throw new AuthError("Email and password are required", 400);
    }

    const db = await getDb();
    const user = await db.getUserByEmail(email);
    if (!user) {
      throw new AuthError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AuthError("Invalid email or password", 401);
    }

    const { passwordHash: _, ...safe } = user;
    const token = await createToken(safe);
    return { user: safe, token };
  }

  async verifySession(token: string): Promise<JwtPayload | null> {
    return verifyToken(token);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    return db.getUserByEmail(email);
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const db = await getDb();
    return db.updateUserPassword(userId, newPasswordHash);
  }

  async setEmailVerified(userId: string, verified: boolean): Promise<boolean> {
    const db = await getDb();
    return db.setEmailVerified(userId, verified);
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const authService = new AuthService();
