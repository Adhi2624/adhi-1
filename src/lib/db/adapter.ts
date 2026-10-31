import type {
  User,
  SafeUser,
  UserRole,
  Resume,
  CreateUserInput,
  UpdateResumeInput,
} from "./types";

export interface DbAdapter {
  // Users
  createUser(input: CreateUserInput): Promise<SafeUser>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<SafeUser | null>;
  listUsers(): Promise<SafeUser[]>;
  updateUserRole(id: string, role: UserRole): Promise<SafeUser | null>;
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
}

export type { User, SafeUser, UserRole, Resume, CreateUserInput, UpdateResumeInput };
