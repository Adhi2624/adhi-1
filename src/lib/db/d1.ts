import { v4 as uuidv4 } from "uuid";
import type { DbAdapter } from "./adapter";
import type {
  User,
  SafeUser,
  UserRole,
  Resume,
  CreateUserInput,
  UpdateResumeInput,
  EmailToken,
} from "./types";

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

interface D1UserRow {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: number;
  createdAt: string;
}

function rowToUser(row: D1UserRow): User {
  return { ...row, emailVerified: Boolean(row.emailVerified) };
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
  emailVerified INTEGER NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS email_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TEXT NOT NULL,
  usedAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_rate_limits (
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  windowStart TEXT NOT NULL,
  PRIMARY KEY (email, type, windowStart)
);

CREATE INDEX IF NOT EXISTS idx_resumes_userId ON resumes(userId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_tokens(token);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON email_rate_limits(email, type, windowStart);
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

  // --- Users ---

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
        "INSERT INTO users (id, name, email, passwordHash, role, emailVerified, createdAt) VALUES (?, ?, ?, ?, 'user', 0, ?)"
      )
      .bind(id, input.name, input.email, input.passwordHash, createdAt)
      .run();

    return { id, name: input.name, email: input.email, role: "user", emailVerified: false, createdAt };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureInit();
    const row = await this.db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first<D1UserRow>();
    if (!row) return null;
    return rowToUser(row);
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    await this.ensureInit();
    const row = await this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first<D1UserRow>();
    if (!row) return null;
    return toSafe(rowToUser(row));
  }

  async listUsers(): Promise<SafeUser[]> {
    await this.ensureInit();
    const result = await this.db
      .prepare("SELECT * FROM users ORDER BY createdAt DESC")
      .all<D1UserRow>();
    return result.results.map((r) => toSafe(rowToUser(r)));
  }

  async updateUserRole(id: string, role: UserRole): Promise<SafeUser | null> {
    await this.ensureInit();
    await this.db
      .prepare("UPDATE users SET role = ? WHERE id = ?")
      .bind(role, id)
      .run();
    return this.getUserById(id);
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<boolean> {
    await this.ensureInit();
    const result = await this.db
      .prepare("UPDATE users SET passwordHash = ? WHERE id = ?")
      .bind(passwordHash, id)
      .run();
    return (result.meta as Record<string, number>)?.changes > 0;
  }

  async setEmailVerified(id: string, verified: boolean): Promise<boolean> {
    await this.ensureInit();
    const result = await this.db
      .prepare("UPDATE users SET emailVerified = ? WHERE id = ?")
      .bind(verified ? 1 : 0, id)
      .run();
    return (result.meta as Record<string, number>)?.changes > 0;
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

  // --- Resumes ---

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

  // --- Email tokens ---

  async createEmailToken(
    email: string,
    type: EmailToken["type"],
    token: string,
    expiresAt: string
  ): Promise<EmailToken> {
    await this.ensureInit();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await this.db
      .prepare(
        "INSERT INTO email_tokens (id, email, type, token, expiresAt, usedAt, createdAt) VALUES (?, ?, ?, ?, ?, NULL, ?)"
      )
      .bind(id, email, type, token, expiresAt, createdAt)
      .run();

    return { id, email, type, token, expiresAt, usedAt: null, createdAt };
  }

  async getEmailToken(token: string, type: EmailToken["type"]): Promise<EmailToken | null> {
    await this.ensureInit();
    return this.db
      .prepare(
        "SELECT * FROM email_tokens WHERE token = ? AND type = ? AND usedAt IS NULL AND expiresAt > ?"
      )
      .bind(token, type, new Date().toISOString())
      .first<EmailToken>();
  }

  async markEmailTokenUsed(token: string): Promise<boolean> {
    await this.ensureInit();
    const result = await this.db
      .prepare("UPDATE email_tokens SET usedAt = ? WHERE token = ?")
      .bind(new Date().toISOString(), token)
      .run();
    return (result.meta as Record<string, number>)?.changes > 0;
  }

  async deleteExpiredTokens(): Promise<number> {
    await this.ensureInit();
    const result = await this.db
      .prepare("DELETE FROM email_tokens WHERE expiresAt < ? OR usedAt IS NOT NULL")
      .bind(new Date().toISOString())
      .run();
    return (result.meta as Record<string, number>)?.changes ?? 0;
  }

  // --- Rate limiting ---

  async getEmailSendCount(email: string, type: string, windowStart: string): Promise<number> {
    await this.ensureInit();
    const count = await this.db
      .prepare("SELECT count FROM email_rate_limits WHERE email = ? AND type = ? AND windowStart = ?")
      .bind(email, type, windowStart)
      .first<number>("count");
    return count ?? 0;
  }

  async incrementEmailSendCount(email: string, type: string, windowStart: string): Promise<void> {
    await this.ensureInit();
    await this.db
      .prepare(
        "INSERT INTO email_rate_limits (email, type, count, windowStart) VALUES (?, ?, 1, ?) ON CONFLICT(email, type, windowStart) DO UPDATE SET count = count + 1"
      )
      .bind(email, type, windowStart)
      .run();
  }
}
