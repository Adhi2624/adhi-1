import type {
  User,
  SafeUser,
  UserRole,
  PricingTier,
  Resume,
  CreateUserInput,
  UpdateResumeInput,
  EmailToken,
  McpCallLog,
  PlatformConfig,
} from "./types";

export interface DbAdapter {
  // Users
  createUser(input: CreateUserInput): Promise<SafeUser>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<SafeUser | null>;
  listUsers(): Promise<SafeUser[]>;
  updateUserRole(id: string, role: UserRole): Promise<SafeUser | null>;
  updateUserTier(id: string, tier: PricingTier): Promise<SafeUser | null>;
  updateUserPassword(id: string, passwordHash: string): Promise<boolean>;
  setEmailVerified(id: string, verified: boolean): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
  getUserCount(): Promise<number>;

  // Resumes
  createResume(userId: string, name: string, latex: string): Promise<Resume>;
  getResume(id: string): Promise<Resume | null>;
  updateResume(id: string, updates: UpdateResumeInput): Promise<Resume | null>;
  deleteResume(id: string): Promise<boolean>;
  listResumes(): Promise<Resume[]>;
  listResumesByUser(userId: string): Promise<Resume[]>;
  getResumeCount(): Promise<number>;
  getResumeCountByUser(userId: string): Promise<number>;

  // Email tokens
  createEmailToken(email: string, type: EmailToken["type"], token: string, expiresAt: string): Promise<EmailToken>;
  getEmailToken(token: string, type: EmailToken["type"]): Promise<EmailToken | null>;
  markEmailTokenUsed(token: string): Promise<boolean>;
  deleteExpiredTokens(): Promise<number>;

  // Rate limiting
  getEmailSendCount(email: string, type: string, windowStart: string): Promise<number>;
  incrementEmailSendCount(email: string, type: string, windowStart: string): Promise<void>;

  // MCP call logging
  logMcpCall(userId: string, method: string, toolName: string | null): Promise<McpCallLog>;
  getMcpCallCount(userId: string, since: string): Promise<number>;
  getMcpCallCountAll(since: string): Promise<number>;
  getMcpCallsByUser(userId: string, since: string, limit?: number): Promise<McpCallLog[]>;
  getMcpCallsAll(since: string, limit?: number): Promise<McpCallLog[]>;
  getMcpCallCountPerUser(since: string): Promise<{ userId: string; count: number }[]>;

  // Platform config (admin-editable key/value store)
  getConfig(key: string): Promise<string | null>;
  setConfig(key: string, value: string): Promise<void>;
  getAllConfig(): Promise<PlatformConfig[]>;
}

export type {
  User, SafeUser, UserRole, PricingTier, Resume,
  CreateUserInput, UpdateResumeInput, EmailToken,
  McpCallLog, PlatformConfig,
};
