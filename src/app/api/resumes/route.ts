import { NextRequest, NextResponse } from "next/server";
import * as store from "@/lib/resume-store";

export async function GET() {
  return NextResponse.json(store.listResumes());
}

export async function POST(request: NextRequest) {
  const { name, latex } = await request.json();
  if (!name || !latex) {
    return NextResponse.json(
      { error: "name and latex are required" },
      { status: 400 }
    );
  }
  const resume = store.createResume(name, latex);
  return NextResponse.json(resume, { status: 201 });
}
