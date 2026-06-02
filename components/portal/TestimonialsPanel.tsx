"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Testimonial } from "@prisma/client";

type Props = {
  initialItems: Testimonial[];
};

type Draft = {
  id?: string;
  name: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  displayOrder: number;
  published: boolean;
};

const EMPTY: Draft = {
  name: "",
  avatarUrl: "",
  rating: 5,
  comment: "",
  displayOrder: 0,
  published: true,
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const DEFAULT_PAGE_SIZE = 5;

export default function TestimonialsPanel({ initialItems }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(initialItems.length / pageSize));

  // Clamp page when item count or page size changes
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(initialItems.length / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [initialItems.length, pageSize, page]);

  const paginatedItems = initialItems.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // Build page-number array with ellipsis
  const pageNums: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    pageNums.push(1);
    if (page > 3) pageNums.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pageNums.push(i);
    if (page < totalPages - 2) pageNums.push("…");
    pageNums.push(totalPages);
  }

  async function save(draft: Draft) {
    setBusy(true);
    setErr(null);
    try {
      const isEdit = Boolean(draft.id);
      const res = await fetch(
        isEdit ? `/api/testimonials/${draft.id}` : "/api/testimonials",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.name,
            avatarUrl: draft.avatarUrl || null,
            rating: draft.rating,
            comment: draft.comment,
            displayOrder: draft.displayOrder,
            published: draft.published,
          }),
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      setEditing(null);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setBusy(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Xoá phản hồi này?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        headers: {},
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(`Lỗi: ${d.error ?? res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {},
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const url = data.urls?.[0];
      if (url && editing) setEditing({ ...editing, avatarUrl: url });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi tải ảnh");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-bold text-zinc-900">💬 Phản hồi của khách hàng</h2>
          <p className="text-xs text-zinc-500">
            Quản lý các phản hồi hiển thị ở trang chủ.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(EMPTY)}
            className="px-3 py-1.5 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm rounded font-semibold"
          >
            ➕ Thêm phản hồi
          </button>
        )}
      </div>

      {editing && (
        <div className="bg-zinc-50 border border-zinc-200 rounded p-3 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Tên khách hàng
              </label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Đánh giá
              </label>
              <select
                value={editing.rating}
                onChange={(e) =>
                  setEditing({ ...editing, rating: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                    {"☆".repeat(5 - n)} ({n})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={editing.displayOrder}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    displayOrder: Number(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Avatar
            </label>
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                {editing.avatarUrl ? (
                  <Image
                    src={editing.avatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-zinc-400 text-xs">
                    Chưa có
                  </div>
                )}
              </div>
              <input
                value={editing.avatarUrl}
                onChange={(e) =>
                  setEditing({ ...editing, avatarUrl: e.target.value })
                }
                placeholder="URL ảnh hoặc tải lên"
                className="flex-1 px-3 py-2 border border-zinc-300 rounded text-sm"
              />
              <label className="px-3 py-2 border border-zinc-300 rounded text-sm cursor-pointer hover:bg-zinc-100">
                {uploading ? "Đang tải…" : "📁 Tải lên"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAvatar(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nội dung phản hồi
            </label>
            <textarea
              value={editing.comment}
              onChange={(e) =>
                setEditing({ ...editing, comment: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.published}
              onChange={(e) =>
                setEditing({ ...editing, published: e.target.checked })
              }
            />
            Hiển thị trên trang chủ
          </label>

          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {err}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => save(editing)}
              className="px-4 py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm rounded font-semibold disabled:opacity-50"
            >
              {busy ? "Đang lưu…" : editing.id ? "Lưu thay đổi" : "Tạo mới"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setErr(null);
              }}
              className="px-4 py-2 border border-zinc-300 text-sm rounded"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {initialItems.length === 0 ? (
        <p className="text-sm text-zinc-500 italic py-3">Chưa có phản hồi nào.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {paginatedItems.map((t) => (
            <li key={t.id} className="py-3 flex items-start gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                {t.avatarUrl ? (
                  <Image
                    src={t.avatarUrl}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-zinc-500 text-sm font-semibold">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-zinc-900">{t.name}</span>
                  <span className="text-amber-500 text-sm">
                    {"★".repeat(t.rating)}
                    <span className="text-zinc-300">
                      {"★".repeat(5 - t.rating)}
                    </span>
                  </span>
                  {!t.published && (
                    <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded">
                      Ẩn
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">
                    Thứ tự: {t.displayOrder}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 mt-1 line-clamp-3">
                  {t.comment}
                </p>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      id: t.id,
                      name: t.name,
                      avatarUrl: t.avatarUrl ?? "",
                      rating: t.rating,
                      comment: t.comment,
                      displayOrder: t.displayOrder,
                      published: t.published,
                    })
                  }
                  className="text-zinc-600 hover:text-[var(--color-brand)]"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => del(t.id)}
                  className="text-zinc-600 hover:text-red-600"
                >
                  Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Pagination ─────────────────────────────── */}
      {initialItems.length > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-2 flex-wrap gap-2">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>
              Trang {page}/{totalPages} · {initialItems.length} phản hồi
            </span>
            <label className="flex items-center gap-1 min-w-0">
              <span className="shrink-0">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded text-sm bg-white border border-zinc-300 hover:bg-zinc-50 disabled:opacity-40"
              >
                ‹
              </button>
              {pageNums.map((p, i) =>
                p === "…" ? (
                  <span key={`e-${i}`} className="px-2 py-1.5 text-sm text-zinc-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`px-3 py-1.5 rounded text-sm ${
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded text-sm bg-white border border-zinc-300 hover:bg-zinc-50 disabled:opacity-40"
              >
                ›
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
