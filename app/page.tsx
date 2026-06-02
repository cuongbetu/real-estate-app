import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FeaturedCarousel from "@/components/listings/FeaturedCarousel";
import LatestListingsSection from "@/components/home/LatestListingsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import VisitorStat from "@/components/home/VisitorStat";
import { PROPERTY_TYPE_LABEL } from "@/lib/formatters";

export const dynamic = "force-dynamic";

const QUICK_TYPES: (keyof typeof PROPERTY_TYPE_LABEL)[] = [
  "NHA_PHO",
  "CAN_HO",
  "DAT_NEN",
  "MAT_BANG",
  "KHO_XUONG",
  "DAT_CONG_NGHIEP",
];

const DEFAULT_PAGE_SIZE = 10;

export default async function HomePage() {
  // Read configured page size first so the initial DB fetch uses the right limit.
  const latestPageSizeStat = await prisma.siteStat.findUnique({
    where: { key: "latest_page_size" },
  });
  const pageSize = Math.min(
    Math.max(latestPageSizeStat?.override ?? DEFAULT_PAGE_SIZE, 1),
    50,
  );

  const [featured, latest, latestTotal] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE", featured: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: pageSize,
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div>
      {/* ── Hero search ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#c8242a] to-[#7a1418] text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Tìm kiếm bất động sản trên toàn quốc
          </h1>
          <p className="text-white/80 mb-6">
            Hàng nghìn tin mua bán &amp; cho thuê nhà phố, căn hộ, đất nền, mặt bằng kinh doanh.
          </p>
          <form
            action="/listings"
            className="bg-white rounded-lg p-2 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto"
          >
            <select
              name="category"
              defaultValue=""
              className="px-3 py-2 border border-zinc-200 rounded text-zinc-900 text-sm"
            >
              <option value="">Mua bán / Cho thuê</option>
              <option value="MUA_BAN">Mua bán</option>
              <option value="CHO_THUE">Cho thuê</option>
            </select>
            <input
              name="search"
              placeholder="Tỉnh, quận, từ khoá…"
              className="flex-1 px-3 py-2 border border-zinc-200 rounded text-zinc-900 text-sm"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded font-semibold text-sm"
            >
              🔍 Tìm kiếm
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {QUICK_TYPES.map((t) => (
              <Link
                key={t}
                href={`/listings?type=${t}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs"
              >
                {PROPERTY_TYPE_LABEL[t]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured carousel ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-900">⭐ Tin nổi bật</h2>
          <Link
            href="/listings?featured=true"
            className="text-sm text-[var(--color-brand)] hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
        <FeaturedCarousel items={featured} />
      </section>

      {/* ── Latest listings with load-more ───────────────────────────── */}
      <LatestListingsSection
        initialListings={latest}
        total={latestTotal}
        pageSize={pageSize}
      />

      <TestimonialsSection />
      <VisitorStat />
    </div>
  );
}
