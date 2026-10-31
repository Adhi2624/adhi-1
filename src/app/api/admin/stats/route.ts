import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserCount, listUsers } from "@/lib/user-store";
import { getResumeCount } from "@/lib/resume-store";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = listUsers();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return NextResponse.json({
    totalUsers: getUserCount(),
    totalResumes: getResumeCount(),
    admins: users.filter((u) => u.role === "admin").length,
    recentUsers: users.filter((u) => new Date(u.createdAt) > weekAgo).length,
  });
}

