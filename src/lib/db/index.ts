import type { DbAdapter } from "./adapter";
import { MemoryAdapter } from "./memory";
import bcrypt from "bcryptjs";

let instance: DbAdapter | null = null;
let initPromise: Promise<void> | null = null;

async function seedAdmin(db: DbAdapter) {
  const existing = await db.getUserByEmail("admin@typeset.app");
  if (!existing) {
    const hash = await bcrypt.hash("admin123", 10);
    const user = await db.createUser({
      name: "Admin",
      email: "admin@typeset.app",
      passwordHash: hash,
    });
    await db.updateUserRole(user.id, "admin");
  }
}

async function createAdapter(): Promise<DbAdapter> {
  const adapterType = process.env.DB_ADAPTER || "memory";

  switch (adapterType) {
    case "mongodb":
    case "mongo": {
      const uri = process.env.MONGODB_URI;
      if (!uri) throw new Error("MONGODB_URI is required for mongodb adapter");
      const { MongoAdapter } = await import("./mongo");
      const adapter = new MongoAdapter(
        uri,
        process.env.MONGODB_DB || "typeset"
      );
      await adapter.init();
      return adapter;
    }

    case "d1": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const binding = (globalThis as any).DB || (globalThis as any).__env?.DB;
      if (!binding) {
        throw new Error(
          "D1 database binding not found. Ensure DB is bound in wrangler.toml."
        );
      }
      const { D1Adapter } = await import("./d1");
      const adapter = new D1Adapter(binding);
      await adapter.init();
      return adapter;
    }

    case "memory":
    default: {
      return new MemoryAdapter();
    }
  }
}

export async function getDb(): Promise<DbAdapter> {
  if (instance) return instance;

  if (!initPromise) {
    initPromise = (async () => {
      instance = await createAdapter();
      await seedAdmin(instance);
    })();
  }

  await initPromise;
  return instance!;
}

export type { DbAdapter } from "./adapter";
export type {
  User,
  SafeUser,
  UserRole,
  PricingTier,
  Resume,
  CreateUserInput,
  UpdateResumeInput,
  EmailToken,
  EmailRateLimit,
  McpCallLog,
  PlatformConfig,
  TierLimits,
} from "./types";
export { DEFAULT_TIER_LIMITS, DEFAULT_RATE_LIMITS } from "./types";
