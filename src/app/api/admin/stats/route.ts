import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = await getDb();
  const [users, totalUsers, totalResumes] = await Promise.all([
    db.listUsers(),
    db.getUserCount(),
    db.getResumeCount(),
  ]);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return NextResponse.json({
    totalUsers,
    totalResumes,
    admins: users.filter((u) => u.role === "admin").length,
    recentUsers: users.filter((u) => new Date(u.createdAt) > weekAgo).length,
  });
}
