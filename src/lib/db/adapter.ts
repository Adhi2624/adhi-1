import type {
  User,
  SafeUser,
  UserRole,
  Resume,
  CreateUserInput,
  UpdateResumeInput,
  EmailToken,
} from "./types";

export interface DbAdapter {
  // Users
  createUser(input: CreateUserInput): Promise<SafeUser>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<SafeUser | null>;
  listUsers(): Promise<SafeUser[]>;
  updateUserRole(id: string, role: UserRole): Promise<SafeUser | null>;
  updateUserPassword(id: string, passwordHash: string): Promise<boolean>;
  setEmailVerified(id: string, verified: boolean): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
  getUserCount(): Promise<number>;

  // Resumes
  createResume(userId: string, name: string, latex: string): Promise<Resume>;
  getResume(id: string): Promise<Resume | null>;
  updateResume(
    id: string,
    updates: UpdateResumeInput
  ): Promise<Resume | null>;
  deleteResume(id: string): Promise<boolean>;
  listResumes(): Promise<Resume[]>;
  listResumesByUser(userId: string): Promise<Resume[]>;
  getResumeCount(): Promise<number>;
  getResumeCountByUser(userId: string): Promise<number>;

  // Email tokens (verification, password reset)
  createEmailToken(email: string, type: EmailToken["type"], token: string, expiresAt: string): Promise<EmailToken>;
  getEmailToken(token: string, type: EmailToken["type"]): Promise<EmailToken | null>;
  markEmailTokenUsed(token: string): Promise<boolean>;
  deleteExpiredTokens(): Promise<number>;

  // Rate limiting (per-email, per-type)
  getEmailSendCount(email: string, type: string, windowStart: string): Promise<number>;
  incrementEmailSendCount(email: string, type: string, windowStart: string): Promise<void>;
}

export type { User, SafeUser, UserRole, Resume, CreateUserInput, UpdateResumeInput, EmailToken };
