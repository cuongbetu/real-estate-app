import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  value: z
    .union([z.number(), z.string()])
    .transform((v) => parseFloat(String(v)))
    .refine((n) => Number.isFinite(n) && n > 0)
    .optional(),
  displayOrder: z
    .union([z.number(), z.string()])
    .transform((v) => Math.round(Number(v)))
    .optional(),
  active: z.boolean().optional(),
});

/** PUT /api/price-options/[id] — admin update */
export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const row = await prisma.priceOption.update({ where: { id }, data: parsed.data });
    return Response.json(row);
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}

/** DELETE /api/price-options/[id] — admin delete */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  try {
    await prisma.priceOption.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
