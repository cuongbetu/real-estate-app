import { prisma } from "@/lib/prisma";
import ListingGrid from "@/components/listings/ListingGrid";
import SearchFilter from "@/components/listings/SearchFilter";
import MobileFilter from "@/components/listings/MobileFilter";
import SortSelect from "@/components/listings/SortSelect";
import PerPageSelect from "@/components/listings/PerPageSelect";
import type { Metadata } from "next";

const PER_PAGE_OPTIONS = [10, 20, 50];
const DEFAULT_PER_PAGE = 20;
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { getPriceOptions } from "@/lib/priceOptions";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const parts: string[] = [];
  if (sp.category === "MUA_BAN") parts.push("Mua bán");
  else if (sp.category === "CHO_THUE") parts.push("Cho thuê");
  else parts.push("Mua bán & cho thuê");
  if (sp.type) parts.push(String(sp.type).toLowerCase().replace(/_/g, " "));
  if (sp.district) parts.push(String(sp.district));
  if (sp.city) parts.push(String(sp.city));

  const title = parts.join(" ") + " — Nhà đất giá tốt 24h";
  const description = `Danh sách bất động sản ${parts.slice(1).join(", ")} cập nhật mới nhất. Tìm nhà phố, căn hộ, đất nền giá tốt tại nhadatgiatot247.com`;

  return {
    title,
    description,
    alternates: { canonical: "/listings" },
  };
}

type SearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

function s(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };

  const search = s(sp.search);
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { district: { contains: search, mode: "insensitive" } },
    ];
  }

  const cat = s(sp.category);
  if (cat) where.category = cat as Prisma.ListingWhereInput["category"];
  const type = s(sp.type);
  if (type) where.type = type as Prisma.ListingWhereInput["type"];
  const city = s(sp.city);
  if (city) where.city = { contains: city, mode: "insensitive" };
  const district = s(sp.district);
  if (district) where.district = { contains: district, mode: "insensitive" };
  const legal = s(sp.legalStatus);
  if (legal) where.legalStatus = legal as Prisma.ListingWhereInput["legalStatus"];

  const bedrooms = s(sp.bedrooms);
  if (bedrooms) {
    const n = parseInt(bedrooms);
    if (Number.isFinite(n)) where.bedrooms = n >= 5 ? { gte: 5 } : n;
  }

  if (s(sp.featured) === "true") where.featured = true;

  // price is stored as a String — numeric range filtering is not supported.

  const minArea = s(sp.minArea);
  const maxArea = s(sp.maxArea);
  if (minArea || maxArea) {
    where.area = {
      ...(minArea && { gte: parseFloat(minArea) }),
      ...(maxArea && { lte: parseFloat(maxArea) }),
    };
  }

  const sort = s(sp.sort) ?? "newest";
  const orderBy: Prisma.ListingOrderByWithRelationInput =
    sort === "priceAsc"
      ? { price: "asc" }
      : sort === "priceDesc"
        ? { price: "desc" }
        : sort === "areaDesc"
          ? { area: "desc" }
          : { createdAt: "desc" };

  // Per-page: read from URL, clamp to allowed values, default to 20
  const rawPageSize = parseInt(s(sp.pageSize) ?? "") || DEFAULT_PER_PAGE;
  const pageSize = PER_PAGE_OPTIONS.includes(rawPageSize) ? rawPageSize : DEFAULT_PER_PAGE;

  const page = Math.max(parseInt(s(sp.page) ?? "1") || 1, 1);
  const skip = (page - 1) * pageSize;

  const [items, total, priceOptions] = await Promise.all([
    prisma.listing.findMany({ where, orderBy, skip, take: pageSize }),
    prisma.listing.count({ where }),
    getPriceOptions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageParam = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "page") continue;
      const val = Array.isArray(v) ? v[0] : v;
      if (val) q.set(k, val);
    }
    q.set("page", String(p));
    return `/listings?${q.toString()}`;
  };

  return (
    <div>
      <MobileFilter priceOptions={priceOptions} />
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="hidden lg:block">
          <SearchFilter priceOptions={priceOptions} />
        </div>
        <section>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-y-2 gap-x-3">
            <div className="text-sm text-zinc-600 shrink-0">
              <span className="font-semibold text-zinc-900">{total}</span> tin đăng
              {totalPages > 1 && (
                <span className="text-zinc-400 ml-1">
                  · trang {page}/{totalPages}
                </span>
              )}
            </div>
            {/* Controls — wrap to next line on very narrow screens */}
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-zinc-500 shrink-0">Hiển thị:</span>
                <PerPageSelect current={pageSize} options={PER_PAGE_OPTIONS} />
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-zinc-500 shrink-0">Sắp xếp:</span>
                <SortSelect current={sort} />
              </div>
            </div>
          </div>

          <ListingGrid listings={items} variant="row" />

          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-1 flex-wrap">
              {/* Prev */}
              {page > 1 && (
                <Link
                  href={pageParam(page - 1)}
                  className="px-3 py-1.5 rounded text-sm bg-white border border-zinc-300 hover:bg-zinc-50"
                >
                  ‹
                </Link>
              )}

              {/* Page numbers with ellipsis */}
              {(() => {
                const pages: (number | "…")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push("…");
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                    pages.push(i);
                  }
                  if (page < totalPages - 2) pages.push("…");
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-zinc-400">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={pageParam(p)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        p === page
                          ? "bg-[var(--color-brand)] text-white"
                          : "bg-white border border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      {p}
                    </Link>
                  ),
                );
              })()}

              {/* Next */}
              {page < totalPages && (
                <Link
                  href={pageParam(page + 1)}
                  className="px-3 py-1.5 rounded text-sm bg-white border border-zinc-300 hover:bg-zinc-50"
                >
                  ›
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

