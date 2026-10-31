import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json([], { status: 200 });
  }
  const db = await getDb();
  return NextResponse.json(await db.listResumesByUser(session.id));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, latex } = await request.json();
  if (!name || !latex) {
    return NextResponse.json(
      { error: "name and latex are required" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const resume = await db.createResume(session.id, name, latex);
  return NextResponse.json(resume, { status: 201 });
}
