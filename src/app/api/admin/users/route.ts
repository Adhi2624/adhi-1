import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminService, AdminError } from "@/services/admin-service";
import type { UserRole } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await adminService.listUsersWithCounts();
  return NextResponse.json(users);
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId, role } = await request.json();
    const updated = await adminService.updateUserRole(userId, role as UserRole);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof AdminError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId } = await request.json();
    await adminService.deleteUser(userId, session.id);
    return NextResponse.json({ message: "Deleted" });
  } catch (err: unknown) {
    if (err instanceof AdminError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
