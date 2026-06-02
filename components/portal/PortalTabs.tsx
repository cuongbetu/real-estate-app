"use client";

import { useState } from "react";
import ListingTable from "./ListingTable";
import StatsPanel from "./StatsPanel";
import PriceOptionsPanel from "./PriceOptionsPanel";
import TestimonialsPanel from "./TestimonialsPanel";
import type { Listing, SiteStat, Testimonial, PriceOption } from "@prisma/client";

type Tab = "listings" | "config";

type Props = {
  initialListings: Listing[];
  listingsTotal: number;
  countAll: number;
  countActive: number;
  countSold: number;
  countHidden: number;
  stats: SiteStat[];
  testimonials: Testimonial[];
  priceOptions: PriceOption[];
};

export default function PortalTabs({
  initialListings,
  listingsTotal,
  countAll,
  countActive,
  countSold,
  countHidden,
  stats,
  testimonials,
  priceOptions,
}: Props) {
  const [tab, setTab] = useState<Tab>("listings");

  return (
    <div>
      {/* ── Tab bar ─────────────────────────────────── */}
      <div className="flex border-b border-zinc-200 mb-6">
        <TabBtn active={tab === "listings"} onClick={() => setTab("listings")}>
          Quản Lý Tin Đăng
        </TabBtn>
        <TabBtn active={tab === "config"} onClick={() => setTab("config")}>
          Cấu Hình Chung
        </TabBtn>
      </div>

      {/* ── Listings tab ─────────────────────────────── */}
      {tab === "listings" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Tổng" value={countAll} />
            <StatCard label="Đang hiển thị" value={countActive} tone="green" />
            <StatCard label="Đã bán" value={countSold} tone="blue" />
            <StatCard label="Ẩn" value={countHidden} tone="zinc" />
          </div>
          <ListingTable initialListings={initialListings} total={listingsTotal} />
        </>
      )}

      {/* ── Config tab ───────────────────────────────── */}
      {tab === "config" && (
        <div className="space-y-6">
          <StatsPanel initialStats={stats} />
          <PriceOptionsPanel initialOptions={priceOptions} />
          <TestimonialsPanel initialItems={testimonials} />
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
        active
          ? "border-[var(--color-brand)] text-[var(--color-brand)]"
          : "border-transparent text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "green" | "blue" | "zinc";
}) {
  const toneClass =
    tone === "green"
      ? "text-green-600"
      : tone === "blue"
        ? "text-blue-600"
        : tone === "zinc"
          ? "text-zinc-600"
          : "text-[var(--color-brand)]";
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold ${toneClass} mt-1`}>{value}</div>
    </div>
  );
}
