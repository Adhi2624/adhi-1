import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import * as store from "@/lib/resume-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const resume = store.getResume(id);
  if (!resume || resume.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(resume);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = store.getResume(id);
  if (!existing || existing.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const resume = store.updateResume(id, body);
  return NextResponse.json(resume);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = store.getResume(id);
  if (!existing || existing.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  store.deleteResume(id);
  return NextResponse.json({ message: "Deleted" });
}
