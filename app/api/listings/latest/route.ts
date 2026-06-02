import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(parseInt(searchParams.get("page") ?? "1") || 1, 1);
  const rawSize = parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(rawSize, 1), MAX_PAGE_SIZE);
  const skip = (page - 1) * pageSize;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        pricePerM2: true,
        currency: true,
        area: true,
        bedrooms: true,
        city: true,
        district: true,
        ward: true,
        type: true,
        category: true,
        legalStatus: true,
        verified: true,
        featured: true,
        images: true,
        views: true,
        createdAt: true,
      },
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
  ]);

  return Response.json({ listings, total, page, pageSize });
}
