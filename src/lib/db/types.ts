export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export type SafeUser = Omit<User, "passwordHash">;

export interface Resume {
  id: string;
  userId: string;
  name: string;
  latex: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UpdateResumeInput {
  name?: string;
  latex?: string;
}

export interface EmailToken {
  id: string;
  email: string;
  type: "verification" | "password-reset";
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface EmailRateLimit {
  email: string;
  type: string;
  count: number;
  windowStart: string;
}
