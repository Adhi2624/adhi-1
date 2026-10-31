import { v4 as uuidv4 } from "uuid";
import type { DbAdapter } from "./adapter";
import type {
  User,
  SafeUser,
  UserRole,
  Resume,
  CreateUserInput,
  UpdateResumeInput,
} from "./types";

/**
 * Cloudflare D1 binding interface.
 * In a Cloudflare Workers/Pages environment, this is available via env.DB.
 */
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

function toSafe(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  latex TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resumes_userId ON resumes(userId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

export class D1Adapter implements DbAdapter {
  private db: D1Database;
  private initialized = false;

  constructor(db: D1Database) {
    this.db = db;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.db.exec(SCHEMA_SQL);
    this.initialized = true;
  }

  private async ensureInit() {
    if (!this.initialized) await this.init();
  }

  async createUser(input: CreateUserInput): Promise<SafeUser> {
    await this.ensureInit();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const existing = await this.db
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(input.email)
      .first();
    if (existing) throw new Error("Email already registered");

    await this.db
      .prepare(
        "INSERT INTO users (id, name, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, 'user', ?)"
      )
      .bind(id, input.name, input.email, input.passwordHash, createdAt)
      .run();

    return { id, name: input.name, email: input.email, role: "user", createdAt };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureInit();
    return this.db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first<User>();
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    await this.ensureInit();
    const user = await this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first<User>();
    return user ? toSafe(user) : null;
  }

  async listUsers(): Promise<SafeUser[]> {
    await this.ensureInit();
    const result = await this.db
      .prepare("SELECT * FROM users ORDER BY createdAt DESC")
      .all<User>();
    return result.results.map(toSafe);
  }

  async updateUserRole(id: string, role: UserRole): Promise<SafeUser | null> {
    await this.ensureInit();
    await this.db
      .prepare("UPDATE users SET role = ? WHERE id = ?")
      .bind(role, id)
      .run();
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.ensureInit();
    const result = await this.db
      .prepare("DELETE FROM users WHERE id = ?")
      .bind(id)
      .run();
    if (result.meta && (result.meta as Record<string, number>).changes > 0) {
      await this.db
        .prepare("DELETE FROM resumes WHERE userId = ?")
        .bind(id)
        .run();
      return true;
    }
    return false;
  }

  async getUserCount(): Promise<number> {
    await this.ensureInit();
    const count = await this.db
      .prepare("SELECT COUNT(*) as count FROM users")
      .first<number>("count");
    return count || 0;
  }

  async createResume(
    userId: string,
    name: string,
    latex: string
  ): Promise<Resume> {
    await this.ensureInit();
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        "INSERT INTO resumes (id, userId, name, latex, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(id, userId, name, latex, now, now)
      .run();

    return { id, userId, name, latex, createdAt: now, updatedAt: now };
  }

  async getResume(id: string): Promise<Resume | null> {
    await this.ensureInit();
    return this.db
      .prepare("SELECT * FROM resumes WHERE id = ?")
      .bind(id)
      .first<Resume>();
  }

  async updateResume(
    id: string,
    updates: UpdateResumeInput
  ): Promise<Resume | null> {
    await this.ensureInit();
    const sets: string[] = ["updatedAt = ?"];
    const values: unknown[] = [new Date().toISOString()];

    if (updates.name) {
      sets.push("name = ?");
      values.push(updates.name);
    }
    if (updates.latex) {
      sets.push("latex = ?");
      values.push(updates.latex);
    }

    values.push(id);
    await this.db
      .prepare(`UPDATE resumes SET ${sets.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.getResume(id);
  }

  async deleteResume(id: string): Promise<boolean> {
    await this.ensureInit();
    const result = await this.db
      .prepare("DELETE FROM resumes WHERE id = ?")
      .bind(id)
      .run();
    return (result.meta as Record<string, number>)?.changes > 0;
  }

  async listResumes(): Promise<Resume[]> {
    await this.ensureInit();
    const result = await this.db
      .prepare("SELECT * FROM resumes ORDER BY updatedAt DESC")
      .all<Resume>();
    return result.results;
  }

  async listResumesByUser(userId: string): Promise<Resume[]> {
    await this.ensureInit();
    const result = await this.db
      .prepare(
        "SELECT * FROM resumes WHERE userId = ? ORDER BY updatedAt DESC"
      )
      .bind(userId)
      .all<Resume>();
    return result.results;
  }

  async getResumeCount(): Promise<number> {
    await this.ensureInit();
    const count = await this.db
      .prepare("SELECT COUNT(*) as count FROM resumes")
      .first<number>("count");
    return count || 0;
  }

  async getResumeCountByUser(userId: string): Promise<number> {
    await this.ensureInit();
    const count = await this.db
      .prepare("SELECT COUNT(*) as count FROM resumes WHERE userId = ?")
      .bind(userId)
      .first<number>("count");
    return count || 0;
  }
}
