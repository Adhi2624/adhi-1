import { v4 as uuidv4 } from "uuid";

export interface Resume {
  id: string;
  name: string;
  latex: string;
  createdAt: string;
  updatedAt: string;
}

const resumes = new Map<string, Resume>();

export function createResume(name: string, latex: string): Resume {
  const id = uuidv4();
  const now = new Date().toISOString();
  const resume: Resume = { id, name, latex, createdAt: now, updatedAt: now };
  resumes.set(id, resume);
  return resume;
}

export function getResume(id: string): Resume | undefined {
  return resumes.get(id);
}

export function updateResume(
  id: string,
  updates: { name?: string; latex?: string }
): Resume | undefined {
  const resume = resumes.get(id);
  if (!resume) return undefined;
  if (updates.name) resume.name = updates.name;
  if (updates.latex) resume.latex = updates.latex;
  resume.updatedAt = new Date().toISOString();
  resumes.set(id, resume);
  return resume;
}

export function deleteResume(id: string): boolean {
  return resumes.delete(id);
}

export function listResumes(): Resume[] {
  return Array.from(resumes.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}
