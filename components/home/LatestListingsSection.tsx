"use client";

import Link from "next/link";
import { useState } from "react";
import type { ListingSummary } from "@/types/listing";
import ListingGrid from "@/components/listings/ListingGrid";

type Props = {
  initialListings: ListingSummary[];
  total: number;
  pageSize: number;
};

export default function LatestListingsSection({
  initialListings,
  total,
  pageSize,
}: Props) {
  const [listings, setListings] = useState<ListingSummary[]>(initialListings);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchTotal, setFetchTotal] = useState(total);

  const hasMore = listings.length < fetchTotal;
  const remaining = fetchTotal - listings.length;

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/listings/latest?page=${nextPage}&pageSize=${pageSize}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { listings: ListingSummary[]; total: number } =
        await res.json();
      setListings((prev) => [...prev, ...data.listings]);
      setFetchTotal(data.total); // keep in sync in case new listings appeared
      setPage(nextPage);
    } catch {
      // silently ignore — user can tap again
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 pb-12" id="latest">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl font-bold text-zinc-900">🆕 Tin mới đăng</h2>
        <Link
          href="/listings"
          className="text-sm text-[var(--color-brand)] hover:underline"
        >
          Xem tất cả →
        </Link>
      </div>

      <ListingGrid listings={listings} variant="row" />

      {hasMore ? (
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-2.5 border-2 border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
          >
            {loading ? "Đang tải…" : "Xem thêm"}
          </button>
          <span className="text-xs text-zinc-400">
            Đang hiển thị {listings.length.toLocaleString("vi-VN")}/
            {fetchTotal.toLocaleString("vi-VN")} tin
            {remaining > 0 && ` · còn ${remaining.toLocaleString("vi-VN")} tin`}
          </span>
        </div>
      ) : (
        fetchTotal > pageSize && (
          <p className="mt-4 text-center text-xs text-zinc-400">
            Đã hiển thị tất cả {fetchTotal.toLocaleString("vi-VN")} tin
          </p>
        )
      )}
    </section>
  );
}
