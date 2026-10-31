import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  listUsers,
  setUserRole,
  deleteUser as removeUser,
  type UserRole,
} from "@/lib/user-store";
import { getResumeCountByUser } from "@/lib/resume-store";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = listUsers().map((u) => ({
    ...u,
    resumeCount: getResumeCountByUser(u.id),
  }));

  return NextResponse.json(users);
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, role } = await request.json();
  if (!userId || !role) {
    return NextResponse.json(
      { error: "userId and role required" },
      { status: 400 }
    );
  }

  const updated = setUserRole(userId, role as UserRole);
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await request.json();

  if (userId === session.id) {
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 }
    );
  }

  const ok = removeUser(userId);
  if (!ok) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted" });
}
