export type UserRole = "user" | "admin";

export type PricingTier = "free" | "pro" | "team";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  tier: PricingTier;
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

export interface McpCallLog {
  id: string;
  userId: string;
  method: string;
  toolName: string | null;
  timestamp: string;
}

export interface PlatformConfig {
  key: string;
  value: string;
  updatedAt: string;
}

export interface TierLimits {
  maxResumes: number;
  mcpAccess: boolean;
  maxMcpCallsPerHour: number;
  maxMcpCallsPerDay: number;
  customTemplates: boolean;
  versionHistory: boolean;
  collaboration: boolean;
}

export const DEFAULT_TIER_LIMITS: Record<PricingTier, TierLimits> = {
  free: {
    maxResumes: 3,
    mcpAccess: false,
    maxMcpCallsPerHour: 0,
    maxMcpCallsPerDay: 0,
    customTemplates: false,
    versionHistory: false,
    collaboration: false,
  },
  pro: {
    maxResumes: -1,
    mcpAccess: true,
    maxMcpCallsPerHour: 100,
    maxMcpCallsPerDay: 1000,
    customTemplates: true,
    versionHistory: true,
    collaboration: false,
  },
  team: {
    maxResumes: -1,
    mcpAccess: true,
    maxMcpCallsPerHour: 500,
    maxMcpCallsPerDay: 5000,
    customTemplates: true,
    versionHistory: true,
    collaboration: true,
  },
};

export const DEFAULT_RATE_LIMITS: Record<string, { maxPerWindow: number; windowMinutes: number }> = {
  verification: { maxPerWindow: 3, windowMinutes: 60 },
  "password-reset": { maxPerWindow: 3, windowMinutes: 60 },
};
