import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";
import PortalTabs from "@/components/portal/PortalTabs";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

async function logoutAction() {
  "use server";
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/portal/login");
}

export default async function PortalPage() {
  if (!(await isAdminSession())) redirect("/portal/login");

  const [all, active, sold, hidden, listings, stats, testimonials, priceOptions] =
    await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.listing.count({ where: { status: "SOLD" } }),
      prisma.listing.count({ where: { status: "HIDDEN" } }),
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
      }),
      prisma.siteStat.findMany(),
      prisma.testimonial.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.priceOption.findMany({
        orderBy: [{ displayOrder: "asc" }, { value: "asc" }],
      }),
    ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Page header ─────────────────────────────── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Portal</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Trang quản trị nội bộ — yêu cầu đăng nhập.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/portal/create"
            className="px-5 py-2.5 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded font-semibold text-sm"
          >
            ➕ Đăng tin mới
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2.5 border border-zinc-300 rounded text-sm text-zinc-600 hover:bg-zinc-50 font-medium"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </div>

      {/* ── Tabbed content ──────────────────────────── */}
      <PortalTabs
        initialListings={listings}
        listingsTotal={all}
        countAll={all}
        countActive={active}
        countSold={sold}
        countHidden={hidden}
        stats={stats}
        testimonials={testimonials}
        priceOptions={priceOptions}
      />
    </div>
  );
}
