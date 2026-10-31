import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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

const users = new Map<string, User>();
const emailIndex = new Map<string, string>();

function seed() {
  if (emailIndex.has("admin@typeset.app")) return;
  const id = uuidv4();
  const hash = bcrypt.hashSync("admin123", 10);
  const admin: User = {
    id,
    name: "Admin",
    email: "admin@typeset.app",
    passwordHash: hash,
    role: "admin",
    createdAt: new Date().toISOString(),
  };
  users.set(id, admin);
  emailIndex.set(admin.email, id);
}

seed();

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<SafeUser | { error: string }> {
  if (emailIndex.has(email)) {
    return { error: "Email already registered" };
  }
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id,
    name,
    email,
    passwordHash,
    role: "user",
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  emailIndex.set(email, id);
  return toSafe(user);
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const id = emailIndex.get(email);
  if (!id) return null;
  const user = users.get(id);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? toSafe(user) : null;
}

export function getUserById(id: string): SafeUser | undefined {
  const user = users.get(id);
  return user ? toSafe(user) : undefined;
}

export function listUsers(): SafeUser[] {
  return Array.from(users.values())
    .map(toSafe)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function setUserRole(id: string, role: UserRole): SafeUser | null {
  const user = users.get(id);
  if (!user) return null;
  user.role = role;
  users.set(id, user);
  return toSafe(user);
}

export function deleteUser(id: string): boolean {
  const user = users.get(id);
  if (!user) return false;
  emailIndex.delete(user.email);
  return users.delete(id);
}

export function getUserCount(): number {
  return users.size;
}

function toSafe(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}
