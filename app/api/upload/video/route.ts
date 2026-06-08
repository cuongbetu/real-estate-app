import { NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { isAdminRequest } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

const EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
};

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded (field 'file')" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return Response.json(
      { error: `Định dạng không hỗ trợ: ${file.type || "unknown"}. Chấp nhận: MP4, WebM, OGG, MOV` },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `File quá lớn (tối đa ${MAX_BYTES / 1024 / 1024}MB): ${file.name}` },
      { status: 400 },
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = EXT[file.type] ?? "mp4";
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, safe), buf);

  return Response.json({ url: `/uploads/${safe}` }, { status: 201 });
}
