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

  constructor(uri: string, dbName: string = "typeset") {
    this.client = new MongoClient(uri);
    this.db = this.client.db(dbName);
    this.users = this.db.collection<User>("users");
    this.resumes = this.db.collection<Resume>("resumes");
  }

  async init(): Promise<void> {
    await this.client.connect();
    await this.users.createIndex({ email: 1 }, { unique: true });
    await this.users.createIndex({ id: 1 }, { unique: true });
    await this.resumes.createIndex({ id: 1 }, { unique: true });
    await this.resumes.createIndex({ userId: 1 });
  }

  async createUser(input: CreateUserInput): Promise<SafeUser> {
    const existing = await this.users.findOne({ email: input.email });
    if (existing) throw new Error("Email already registered");

    const user: User = {
      id: uuidv4(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: "user",
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
}
