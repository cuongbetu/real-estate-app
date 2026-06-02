import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";
import { siteStatUpdateSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ key: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key } = await ctx.params;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = siteStatUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const stat = await prisma.siteStat.upsert({
    where: { key },
    update: parsed.data,
    create: { key, ...parsed.data, value: 0 },
  });
  return Response.json(stat);
}
