import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as store from "@/lib/resume-store";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json([], { status: 200 });
  }
  return NextResponse.json(store.listResumesByUser(session.id));
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
  const resume = store.createResume(session.id, name, latex);
  return NextResponse.json(resume, { status: 201 });
}
