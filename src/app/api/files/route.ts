import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStorage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const key = `${session.id}/${Date.now()}-${file.name}`;

  const storage = await getStorage();
  const url = await storage.upload(key, buffer, file.type);

  return NextResponse.json({ key, url, name: file.name, size: file.size });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storage = await getStorage();
  const files = await storage.list(`${session.id}/`);

  return NextResponse.json({ files });
}
