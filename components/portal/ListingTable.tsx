"use client";

import { useState } from "react";
import Link from "next/link";
import type { Listing } from "@prisma/client";
import {
  PROPERTY_TYPE_LABEL,
  formatPrice,
  formatRelativeTime,
} from "@/lib/formatters";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 20;

type Props = {
  initialListings: Listing[];
  total: number;
};

const STATUS_LABEL: Record<Listing["status"], string> = {
  ACTIVE: "Hiển thị",
  SOLD: "Đã bán",
  HIDDEN: "Ẩn",
  EXPIRED: "Hết hạn",
};

export default function ListingTable({ initialListings, total }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [fetchTotal, setFetchTotal] = useState(total);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(fetchTotal / pageSize));

  // ps is passed explicitly so callers can use a NEW size before state has updated
  async function fetchPage(p: number, ps: number = pageSize) {
    setLoading(true);
    try {
      const offset = (p - 1) * ps;
      const res = await fetch(`/api/listings?limit=${ps}&offset=${offset}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setListings(data.items ?? []);
      setFetchTotal(data.total ?? 0);
      setPage(p);
    } catch {
      /* ignore – stale data shown */
    } finally {
      setLoading(false);
    }
  }

  function handlePageSizeChange(newSize: number) {
    setPageSize(newSize);
    fetchPage(1, newSize); // pass newSize explicitly — state update is async
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(id);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Lỗi: ${data.error ?? res.status}`);
        return;
      }
      fetchPage(page);
    } finally {
      setBusy(null);
    }
  }

  async function del(id: string) {
    if (!confirm("Xoá vĩnh viễn tin này?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Lỗi: ${data.error ?? res.status}`);
        return;
      }
      const newTotal = fetchTotal - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize));
      fetchPage(Math.min(page, newTotalPages));
    } finally {
      setBusy(null);
    }
  }

  /* ── Build page-number array with ellipsis ─── */
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Tin đăng</th>
              <th className="text-left px-3 py-2">Giá</th>
              <th className="text-left px-3 py-2">Loại</th>
              <th className="text-left px-3 py-2">Vị trí</th>
              <th className="text-left px-3 py-2">Trạng thái</th>
              <th className="text-left px-3 py-2">Đăng</th>
              <th className="text-right px-3 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50 pointer-events-none" : ""}>
            {listings.map((l) => (
              <tr key={l.id} className="border-t border-zinc-100">
                <td className="px-3 py-2 max-w-xs">
                  <Link
                    href={`/listings/${l.slug}`}
                    className="font-medium text-zinc-900 hover:text-[var(--color-brand)] line-clamp-1"
                  >
                    {l.title}
                  </Link>
                  <div className="text-xs text-zinc-400 flex gap-2">
                    {l.featured && (
                      <span className="text-amber-600">⭐ Nổi bật</span>
                    )}
                    {l.verified && (
                      <span className="text-green-600">✅ Xác thực</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-[var(--color-brand)] font-semibold whitespace-nowrap">
                  {formatPrice(l.price, l.currency)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {PROPERTY_TYPE_LABEL[l.type]}
                </td>
                <td className="px-3 py-2 text-zinc-600 whitespace-nowrap">
                  {l.district}, {l.city}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      l.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : l.status === "HIDDEN"
                          ? "bg-zinc-200 text-zinc-700"
                          : l.status === "SOLD"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {STATUS_LABEL[l.status]}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-500 whitespace-nowrap">
                  {formatRelativeTime(l.createdAt)}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link
                    href={`/portal/edit/${l.id}`}
                    className="text-zinc-600 hover:text-[var(--color-brand)] px-2"
                  >
                    Sửa
                  </Link>
                  <button
                    disabled={busy === l.id}
                    onClick={() =>
                      patch(l.id, {
                        status: l.status === "HIDDEN" ? "ACTIVE" : "HIDDEN",
                      })
                    }
                    className="text-zinc-600 hover:text-amber-600 px-2 disabled:opacity-40"
                  >
                    {l.status === "HIDDEN" ? "Hiện" : "Ẩn"}
                  </button>
                  <button
                    disabled={busy === l.id}
                    onClick={() => del(l.id)}
                    className="text-zinc-600 hover:text-red-600 px-2 disabled:opacity-40"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {listings.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="text-center text-zinc-500 py-8">
                  Chưa có tin đăng. Bấm &quot;Đăng tin mới&quot; để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination bar ───────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-3 border-t border-zinc-100 flex-wrap gap-2">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>
            Trang {page}/{totalPages} · {fetchTotal} tin
          </span>
          <label className="flex items-center gap-1 min-w-0">
            <span className="shrink-0">Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="ml-1 min-w-0 max-w-full px-2 py-1 border border-zinc-300 rounded text-xs"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / trang
                </option>
              ))}
            </select>
          </label>
        </div>

        {totalPages > 1 && (
          <nav className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => fetchPage(page - 1)}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded text-sm bg-white border border-zinc-300 hover:bg-zinc-50 disabled:opacity-40"
            >
              ‹
            </button>
            {pages.map((p, i) =>
              p === "…" ? (
                <span
                  key={`e-${i}`}
                  className="px-2 py-1.5 text-sm text-zinc-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => p !== page && fetchPage(p as number)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded text-sm disabled:opacity-40 ${
                    p === page
                      ? "bg-[var(--color-brand)] text-white"
                      : "bg-white border border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => fetchPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded text-sm bg-white border border-zinc-300 hover:bg-zinc-50 disabled:opacity-40"
            >
              ›
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
