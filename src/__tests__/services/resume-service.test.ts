import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResumeService, ResumeError } from "@/services/resume-service";

const mockResumes = new Map<string, { id: string; userId: string; name: string; latex: string; createdAt: string; updatedAt: string }>();
let resumeCounter = 0;

vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockResolvedValue({
    createResume: vi.fn().mockImplementation(async (userId: string, name: string, latex: string) => {
      resumeCounter++;
      const resume = { id: `resume-${resumeCounter}`, userId, name, latex, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockResumes.set(resume.id, resume);
      return resume;
    }),
    getResume: vi.fn().mockImplementation(async (id: string) => {
      return mockResumes.get(id) || null;
    }),
    updateResume: vi.fn().mockImplementation(async (id: string, updates: { name?: string; latex?: string }) => {
      const resume = mockResumes.get(id);
      if (!resume) return null;
      if (updates.name) resume.name = updates.name;
      if (updates.latex) resume.latex = updates.latex;
      resume.updatedAt = new Date().toISOString();
      return resume;
    }),
    deleteResume: vi.fn().mockImplementation(async (id: string) => {
      return mockResumes.delete(id);
    }),
    listResumesByUser: vi.fn().mockImplementation(async (userId: string) => {
      return Array.from(mockResumes.values()).filter((r) => r.userId === userId);
    }),
    getResumeCount: vi.fn().mockImplementation(async () => mockResumes.size),
    getResumeCountByUser: vi.fn().mockImplementation(async (userId: string) => {
      return Array.from(mockResumes.values()).filter((r) => r.userId === userId).length;
    }),
  }),
}));

describe("ResumeService", () => {
  let service: ResumeService;

  beforeEach(() => {
    service = new ResumeService();
    mockResumes.clear();
    resumeCounter = 0;
  });

  describe("create", () => {
    it("creates a resume for a user", async () => {
      const resume = await service.create("user-1", "My Resume", "\\documentclass{article}");
      expect(resume.id).toBe("resume-1");
      expect(resume.userId).toBe("user-1");
      expect(resume.name).toBe("My Resume");
      expect(resume.latex).toBe("\\documentclass{article}");
    });

    it("throws ResumeError for missing name", async () => {
      await expect(service.create("user-1", "", "\\doc")).rejects.toThrow(ResumeError);
    });

    it("throws ResumeError for missing latex", async () => {
      await expect(service.create("user-1", "Name", "")).rejects.toThrow(ResumeError);
    });
  });

  describe("getById", () => {
    it("returns the resume when user owns it", async () => {
      await service.create("user-1", "Resume A", "latex-a");
      const resume = await service.getById("resume-1", "user-1");
      expect(resume.name).toBe("Resume A");
    });

    it("throws ResumeError when user does not own it", async () => {
      await service.create("user-1", "Resume A", "latex-a");
      await expect(service.getById("resume-1", "user-2")).rejects.toThrow(ResumeError);

      try {
        await service.getById("resume-1", "user-2");
      } catch (err) {
        expect((err as ResumeError).status).toBe(404);
      }
    });

    it("throws ResumeError for non-existent resume", async () => {
      await expect(service.getById("nonexistent", "user-1")).rejects.toThrow(ResumeError);
    });
  });

  describe("update", () => {
    it("updates resume name", async () => {
      await service.create("user-1", "Original", "latex");
      const updated = await service.update("resume-1", "user-1", { name: "Updated" });
      expect(updated.name).toBe("Updated");
    });

    it("rejects update from non-owner", async () => {
      await service.create("user-1", "Original", "latex");
      await expect(service.update("resume-1", "user-2", { name: "Hacked" })).rejects.toThrow(ResumeError);
    });
  });

  describe("delete", () => {
    it("deletes a resume owned by user", async () => {
      await service.create("user-1", "To Delete", "latex");
      await service.delete("resume-1", "user-1");
      await expect(service.getById("resume-1", "user-1")).rejects.toThrow(ResumeError);
    });

    it("rejects deletion by non-owner", async () => {
      await service.create("user-1", "Protected", "latex");
      await expect(service.delete("resume-1", "user-2")).rejects.toThrow(ResumeError);
    });
  });

  describe("listByUser", () => {
    it("returns only resumes owned by the user", async () => {
      await service.create("user-1", "R1", "l1");
      await service.create("user-2", "R2", "l2");
      await service.create("user-1", "R3", "l3");

      const user1Resumes = await service.listByUser("user-1");
      expect(user1Resumes).toHaveLength(2);
      expect(user1Resumes.every((r) => r.userId === "user-1")).toBe(true);
    });

    it("returns empty array for user with no resumes", async () => {
      const resumes = await service.listByUser("user-nobody");
      expect(resumes).toHaveLength(0);
    });
  });

  describe("getCountByUser", () => {
    it("returns correct count", async () => {
      await service.create("user-1", "R1", "l1");
      await service.create("user-1", "R2", "l2");
      expect(await service.getCountByUser("user-1")).toBe(2);
      expect(await service.getCountByUser("user-2")).toBe(0);
    });
  });
});
