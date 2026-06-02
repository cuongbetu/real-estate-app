"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PriceOption } from "@prisma/client";
import { DEFAULT_PRICE_OPTIONS } from "@/lib/priceOptions";

type Props = {
  initialOptions: PriceOption[];
};

type FormState = { label: string; value: string; displayOrder: string };
const EMPTY: FormState = { label: "", value: "", displayOrder: "0" };

function formatValue(v: number): string {
  if (v >= 1_000_000_000) {
    const t = v / 1_000_000_000;
    return `${t % 1 === 0 ? t : t.toFixed(1)} tỉ`;
  }
  if (v >= 1_000_000) return `${v / 1_000_000} triệu`;
  return v.toLocaleString("vi-VN");
}

export default function PriceOptionsPanel({ initialOptions }: Props) {
  const router = useRouter();
  const [options, setOptions] = useState<PriceOption[]>(initialOptions);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const headers = { "Content-Type": "application/json" };

  async function save() {
    const label = form.label.trim();
    const value = parseFloat(form.value);
    if (!label) { setMsg("Nhãn không được để trống."); return; }
    if (!Number.isFinite(value) || value <= 0) { setMsg("Giá trị không hợp lệ."); return; }

    setBusy(true);
    setMsg(null);
    try {
      const body = { label, value, displayOrder: parseInt(form.displayOrder) || 0 };
      let res: Response;
      if (editId) {
        res = await fetch(`/api/price-options/${editId}`, {
          method: "PUT", headers, body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/price-options", {
          method: "POST", headers, body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      setMsg(editId ? "Đã cập nhật." : "Đã thêm.");
      setForm(EMPTY);
      setEditId(null);
      router.refresh();
      // Refetch list
      const fresh = await fetch("/api/price-options").then((r) => r.json());
      setOptions(fresh);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Xoá mục giá này?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/price-options/${id}`, { method: "DELETE", headers });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setOptions((prev) => prev.filter((o) => o.id !== id));
      if (editId === id) { setEditId(null); setForm(EMPTY); }
      setMsg("Đã xoá.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(o: PriceOption) {
    setEditId(o.id);
    setForm({ label: o.label, value: String(o.value), displayOrder: String(o.displayOrder) });
    setMsg(null);
  }

  async function seedDefaults() {
    if (!confirm("Thêm các mức giá mặc định vào danh sách?")) return;
    setBusy(true);
    setMsg(null);
    try {
      for (const opt of DEFAULT_PRICE_OPTIONS) {
        await fetch("/api/price-options", {
          method: "POST", headers,
          body: JSON.stringify(opt),
        });
      }
      const fresh = await fetch("/api/price-options").then((r) => r.json());
      setOptions(fresh);
      router.refresh();
      setMsg("Đã thêm mặc định.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-zinc-900">💰 Tuỳ chọn khoảng giá</h2>
        {options.length === 0 && (
          <button
            type="button"
            onClick={seedDefaults}
            disabled={busy}
            className="text-xs px-3 py-1.5 border border-zinc-300 rounded hover:bg-zinc-50 disabled:opacity-50"
          >
            + Thêm mức mặc định
          </button>
        )}
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        Danh sách hiển thị trong bộ lọc "Khoảng giá" trên trang Tin đăng.
        Khi danh sách trống, hệ thống dùng các mức mặc định tự động.
      </p>

      {/* ── Existing options ─────────────────────────────────────── */}
      {options.length > 0 && (
        <div className="mb-4 divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden">
          {options.map((o) => (
            <div
              key={o.id}
              className={`flex items-center gap-3 px-3 py-2 text-sm ${editId === o.id ? "bg-amber-50" : "bg-white"}`}
            >
              <span className="font-medium text-zinc-900 w-24 shrink-0">{o.label}</span>
              <span className="text-zinc-400 text-xs flex-1">{formatValue(o.value)} VND</span>
              <span className="text-zinc-400 text-xs w-16 shrink-0">thứ tự: {o.displayOrder}</span>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(o)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => remove(o.id)}
                  disabled={busy}
                  className="text-xs text-red-500 hover:underline disabled:opacity-50"
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit form ───────────────────────────────────────── */}
      <div className="border border-zinc-200 rounded-lg p-3 space-y-3">
        <div className="text-sm font-semibold text-zinc-700">
          {editId ? "✏️ Chỉnh sửa mục giá" : "➕ Thêm mức giá mới"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Nhãn hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="VD: 1.5 tỉ"
              className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Giá trị (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder="VD: 1500000000"
              className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={form.displayOrder}
              onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="px-4 py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm rounded font-semibold disabled:opacity-50"
          >
            {busy ? "Đang lưu…" : editId ? "Cập nhật" : "Thêm mới"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setForm(EMPTY); setMsg(null); }}
              className="px-4 py-2 border border-zinc-300 rounded text-sm hover:bg-zinc-50"
            >
              Huỷ
            </button>
          )}
          {msg && <span className="text-sm text-zinc-600">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
