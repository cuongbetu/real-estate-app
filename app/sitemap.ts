import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://nhadatgiatot247.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all active listings (only the fields we need)
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const listingUrls: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE}/listings/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...listingUrls,
  ];
}
