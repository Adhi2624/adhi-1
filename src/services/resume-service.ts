import { getDb } from "@/lib/db";
import type { Resume, UpdateResumeInput } from "@/lib/db/types";

export class ResumeService {
  async create(userId: string, name: string, latex: string): Promise<Resume> {
    if (!name || !latex) {
      throw new ResumeError("name and latex are required", 400);
    }
    const db = await getDb();
    return db.createResume(userId, name, latex);
  }

  async getById(id: string, userId: string): Promise<Resume> {
    const db = await getDb();
    const resume = await db.getResume(id);
    if (!resume || resume.userId !== userId) {
      throw new ResumeError("Not found", 404);
    }
    return resume;
  }

  async update(id: string, userId: string, updates: UpdateResumeInput): Promise<Resume> {
    const db = await getDb();
    const existing = await db.getResume(id);
    if (!existing || existing.userId !== userId) {
      throw new ResumeError("Not found", 404);
    }
    const updated = await db.updateResume(id, updates);
    if (!updated) {
      throw new ResumeError("Update failed", 500);
    }
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const db = await getDb();
    const existing = await db.getResume(id);
    if (!existing || existing.userId !== userId) {
      throw new ResumeError("Not found", 404);
    }
    await db.deleteResume(id);
  }

  async listByUser(userId: string): Promise<Resume[]> {
    const db = await getDb();
    return db.listResumesByUser(userId);
  }

  async getCount(): Promise<number> {
    const db = await getDb();
    return db.getResumeCount();
  }

  async getCountByUser(userId: string): Promise<number> {
    const db = await getDb();
    return db.getResumeCountByUser(userId);
  }
}

export class ResumeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ResumeError";
  }
}

export const resumeService = new ResumeService();
