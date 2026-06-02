import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";
import { listingUpdateSchema } from "@/lib/validations";
import { makeListingSlug } from "@/lib/slug";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(listing);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = listingUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const nextSlug =
    data.title && data.title !== existing.title
      ? makeListingSlug(data.title, existing.id)
      : undefined;

  const updated = await prisma.listing.update({
    where: { id },
    data: { ...data, ...(nextSlug && { slug: nextSlug }) },
  });
  return Response.json(updated);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await prisma.listing.delete({ where: { id } }).catch(() => null);
  return Response.json({ ok: true });
}
