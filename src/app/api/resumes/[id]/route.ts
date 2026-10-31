import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resumeService, ResumeError } from "@/services/resume-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const resume = await resumeService.getById(id, session.id);
    return NextResponse.json(resume);
  } catch (err: unknown) {
    if (err instanceof ResumeError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to get resume" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const resume = await resumeService.update(id, session.id, body);
    return NextResponse.json(resume);
  } catch (err: unknown) {
    if (err instanceof ResumeError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await resumeService.delete(id, session.id);
    return NextResponse.json({ message: "Deleted" });
  } catch (err: unknown) {
    if (err instanceof ResumeError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
