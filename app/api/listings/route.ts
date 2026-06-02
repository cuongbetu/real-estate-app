import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";
import { listingCreateSchema } from "@/lib/validations";
import { makeListingSlug } from "@/lib/slug";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const search = sp.get("search");
  const where: Prisma.ListingWhereInput = {};

  const includeHidden = isAdminRequest(req);
  if (!includeHidden) where.status = "ACTIVE";

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { district: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  const cat = sp.get("category");
  if (cat) where.category = cat as Prisma.ListingWhereInput["category"];

  const type = sp.get("type");
  if (type) where.type = type as Prisma.ListingWhereInput["type"];

  const city = sp.get("city");
  if (city) where.city = { contains: city, mode: "insensitive" };
  const district = sp.get("district");
  if (district) where.district = { contains: district, mode: "insensitive" };

  const legal = sp.get("legalStatus");
  if (legal) where.legalStatus = legal as Prisma.ListingWhereInput["legalStatus"];

  const bedrooms = sp.get("bedrooms");
  if (bedrooms) {
    const n = parseInt(bedrooms);
    if (Number.isFinite(n)) {
      where.bedrooms = n >= 5 ? { gte: 5 } : n;
    }
  }

  if (sp.get("featured") === "true") where.featured = true;

  // price is stored as a String — numeric range filtering is not supported.
  // minPrice / maxPrice params are accepted but ignored.

  const minArea = sp.get("minArea");
  const maxArea = sp.get("maxArea");
  if (minArea || maxArea) {
    where.area = {
      ...(minArea && { gte: parseFloat(minArea) }),
      ...(maxArea && { lte: parseFloat(maxArea) }),
    };
  }

  const sort = sp.get("sort") ?? "newest";
  const orderBy: Prisma.ListingOrderByWithRelationInput =
    sort === "priceAsc"
      ? { price: "asc" }
      : sort === "priceDesc"
        ? { price: "desc" }
        : sort === "areaDesc"
          ? { area: "desc" }
          : { createdAt: "desc" };

  const limit = Math.min(parseInt(sp.get("limit") ?? "20") || 20, 100);
  const offset = Math.max(parseInt(sp.get("offset") ?? "0") || 0, 0);

  const [items, total] = await Promise.all([
    prisma.listing.findMany({ where, orderBy, skip: offset, take: limit }),
    prisma.listing.count({ where }),
  ]);

  return Response.json({ items, total, limit, offset });
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

  const parsed = listingCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const created = await prisma.listing.create({
    data: {
      ...data,
      slug: "_pending_",
    },
  });

  const slug = makeListingSlug(data.title, created.id);
  const updated = await prisma.listing.update({
    where: { id: created.id },
    data: { slug },
  });

  return Response.json(updated, { status: 201 });
}
