import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";
import { testimonialCreateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const admin = isAdminRequest(req);
  const items = await prisma.testimonial.findMany({
    where: admin ? {} : { published: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return Response.json({ items });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = testimonialCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await prisma.testimonial.create({ data: parsed.data });
  return Response.json(created, { status: 201 });
}
