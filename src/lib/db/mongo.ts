import { MongoClient, type Db, type Collection } from "mongodb";
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
  EmailRateLimit,
} from "./types";

function toSafe(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export class MongoAdapter implements DbAdapter {
  private client: MongoClient;
  private db: Db;
  private users: Collection<User>;
  private resumes: Collection<Resume>;
  private emailTokens: Collection<EmailToken>;
  private rateLimits: Collection<EmailRateLimit>;

  constructor(uri: string, dbName: string = "typeset") {
    this.client = new MongoClient(uri);
    this.db = this.client.db(dbName);
    this.users = this.db.collection<User>("users");
    this.resumes = this.db.collection<Resume>("resumes");
    this.emailTokens = this.db.collection<EmailToken>("email_tokens");
    this.rateLimits = this.db.collection<EmailRateLimit>("email_rate_limits");
  }

  async init(): Promise<void> {
    await this.client.connect();
    await this.users.createIndex({ email: 1 }, { unique: true });
    await this.users.createIndex({ id: 1 }, { unique: true });
    await this.resumes.createIndex({ id: 1 }, { unique: true });
    await this.resumes.createIndex({ userId: 1 });
    await this.emailTokens.createIndex({ token: 1 }, { unique: true });
    await this.emailTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await this.rateLimits.createIndex({ email: 1, type: 1 });
  }

  // --- Users ---

  async createUser(input: CreateUserInput): Promise<SafeUser> {
    const existing = await this.users.findOne({ email: input.email });
    if (existing) throw new Error("Email already registered");

    const user: User = {
      id: uuidv4(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: "user",
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    await this.users.insertOne(user);
    return toSafe(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ email }, { projection: { _id: 0 } });
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    const user = await this.users.findOne(
      { id },
      { projection: { _id: 0 } }
    );
    return user ? toSafe(user) : null;
  }

  async listUsers(): Promise<SafeUser[]> {
    const users = await this.users
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return users.map(toSafe);
  }

  async updateUserRole(id: string, role: UserRole): Promise<SafeUser | null> {
    const result = await this.users.findOneAndUpdate(
      { id },
      { $set: { role } },
      { returnDocument: "after", projection: { _id: 0 } }
    );
    return result ? toSafe(result) : null;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<boolean> {
    const result = await this.users.updateOne({ id }, { $set: { passwordHash } });
    return result.modifiedCount > 0;
  }

  async setEmailVerified(id: string, verified: boolean): Promise<boolean> {
    const result = await this.users.updateOne({ id }, { $set: { emailVerified: verified } });
    return result.modifiedCount > 0;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.users.deleteOne({ id });
    if (result.deletedCount > 0) {
      await this.resumes.deleteMany({ userId: id });
      return true;
    }
    return false;
  }

  async getUserCount(): Promise<number> {
    return this.users.countDocuments();
  }

  // --- Resumes ---

  async createResume(
    userId: string,
    name: string,
    latex: string
  ): Promise<Resume> {
    const now = new Date().toISOString();
    const resume: Resume = {
      id: uuidv4(),
      userId,
      name,
      latex,
      createdAt: now,
      updatedAt: now,
    };
    await this.resumes.insertOne(resume);
    return resume;
  }

  async getResume(id: string): Promise<Resume | null> {
    return this.resumes.findOne({ id }, { projection: { _id: 0 } });
  }

  async updateResume(
    id: string,
    updates: UpdateResumeInput
  ): Promise<Resume | null> {
    const setFields: Record<string, string> = {
      updatedAt: new Date().toISOString(),
    };
    if (updates.name) setFields.name = updates.name;
    if (updates.latex) setFields.latex = updates.latex;

    return this.resumes.findOneAndUpdate(
      { id },
      { $set: setFields },
      { returnDocument: "after", projection: { _id: 0 } }
    );
  }

  async deleteResume(id: string): Promise<boolean> {
    const result = await this.resumes.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async listResumes(): Promise<Resume[]> {
    return this.resumes
      .find({}, { projection: { _id: 0 } })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async listResumesByUser(userId: string): Promise<Resume[]> {
    return this.resumes
      .find({ userId }, { projection: { _id: 0 } })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async getResumeCount(): Promise<number> {
    return this.resumes.countDocuments();
  }

  async getResumeCountByUser(userId: string): Promise<number> {
    return this.resumes.countDocuments({ userId });
  }

  // --- Email tokens ---

  async createEmailToken(
    email: string,
    type: EmailToken["type"],
    token: string,
    expiresAt: string
  ): Promise<EmailToken> {
    const entry: EmailToken = {
      id: uuidv4(),
      email,
      type,
      token,
      expiresAt,
      usedAt: null,
      createdAt: new Date().toISOString(),
    };
    await this.emailTokens.insertOne(entry);
    return entry;
  }

  async getEmailToken(token: string, type: EmailToken["type"]): Promise<EmailToken | null> {
    return this.emailTokens.findOne(
      {
        token,
        type,
        usedAt: null,
        expiresAt: { $gt: new Date().toISOString() },
      },
      { projection: { _id: 0 } }
    );
  }

  async markEmailTokenUsed(token: string): Promise<boolean> {
    const result = await this.emailTokens.updateOne(
      { token },
      { $set: { usedAt: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.emailTokens.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date().toISOString() } },
        { usedAt: { $ne: null } },
      ],
    });
    return result.deletedCount;
  }

  // --- Rate limiting ---

  async getEmailSendCount(email: string, type: string, windowStart: string): Promise<number> {
    const entry = await this.rateLimits.findOne({ email, type, windowStart });
    return entry?.count ?? 0;
  }

  async incrementEmailSendCount(email: string, type: string, windowStart: string): Promise<void> {
    await this.rateLimits.updateOne(
      { email, type, windowStart },
      { $inc: { count: 1 }, $setOnInsert: { email, type, windowStart } },
      { upsert: true }
    );
  }
}
