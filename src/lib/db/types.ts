export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
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
