import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminService } from "@/services/admin-service";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stats = await adminService.getStats();
  return NextResponse.json(stats);
}
