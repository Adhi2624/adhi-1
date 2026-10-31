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

export class MemoryAdapter implements DbAdapter {
  private users = new Map<string, User>();
  private emailIndex = new Map<string, string>();
  private resumes = new Map<string, Resume>();

  async createUser(input: CreateUserInput): Promise<SafeUser> {
    if (this.emailIndex.has(input.email)) {
      throw new Error("Email already registered");
    }
    const id = uuidv4();
    const user: User = {
      id,
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    this.emailIndex.set(input.email, id);
    return toSafe(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const id = this.emailIndex.get(email);
    if (!id) return null;
    return this.users.get(id) || null;
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    const user = this.users.get(id);
    return user ? toSafe(user) : null;
  }

  async listUsers(): Promise<SafeUser[]> {
    return Array.from(this.users.values())
      .map(toSafe)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async updateUserRole(id: string, role: UserRole): Promise<SafeUser | null> {
    const user = this.users.get(id);
    if (!user) return null;
    user.role = role;
    this.users.set(id, user);
    return toSafe(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    this.emailIndex.delete(user.email);
    return this.users.delete(id);
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async createResume(
    userId: string,
    name: string,
    latex: string
  ): Promise<Resume> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const resume: Resume = { id, userId, name, latex, createdAt: now, updatedAt: now };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResume(id: string): Promise<Resume | null> {
    return this.resumes.get(id) || null;
  }

  async updateResume(
    id: string,
    updates: UpdateResumeInput
  ): Promise<Resume | null> {
    const resume = this.resumes.get(id);
    if (!resume) return null;
    if (updates.name) resume.name = updates.name;
    if (updates.latex) resume.latex = updates.latex;
    resume.updatedAt = new Date().toISOString();
    this.resumes.set(id, resume);
    return resume;
  }

  async deleteResume(id: string): Promise<boolean> {
    return this.resumes.delete(id);
  }

  async listResumes(): Promise<Resume[]> {
    return Array.from(this.resumes.values()).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async listResumesByUser(userId: string): Promise<Resume[]> {
    return Array.from(this.resumes.values())
      .filter((r) => r.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  async getResumeCount(): Promise<number> {
    return this.resumes.size;
  }

  async getResumeCountByUser(userId: string): Promise<number> {
    return Array.from(this.resumes.values()).filter(
      (r) => r.userId === userId
    ).length;
  }
}
