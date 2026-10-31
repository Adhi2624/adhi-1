import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resumeService, ResumeError } from "@/services/resume-service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json([], { status: 200 });
  }
  const resumes = await resumeService.listByUser(session.id);
  return NextResponse.json(resumes);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, latex } = await request.json();
    const resume = await resumeService.create(session.id, name, latex);
    return NextResponse.json(resume, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ResumeError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
