"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SiteStat } from "@prisma/client";

type Props = {
  initialStats: SiteStat[];
};

export default function StatsPanel({ initialStats }: Props) {
  const router = useRouter();

  // ── Footer contact info ───────────────────────────────────────────────────
  const hotlineStat = initialStats.find((s) => s.key === "footer_hotline");
  const emailStat   = initialStats.find((s) => s.key === "footer_email");
  const [hotline, setHotline] = useState(hotlineStat?.label ?? "");
  const [email,   setEmail]   = useState(emailStat?.label   ?? "");
  const [contactBusy, setContactBusy] = useState(false);
  const [contactMsg,  setContactMsg]  = useState<string | null>(null);

  async function saveContact() {
    setContactBusy(true);
    setContactMsg(null);
    try {
      await Promise.all([
        fetch("/api/stats/footer_hotline", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ override: null, label: hotline || null }),
        }),
        fetch("/api/stats/footer_email", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ override: null, label: email || null }),
        }),
      ]);
      setContactMsg("Đã lưu.");
      router.refresh();
    } catch {
      setContactMsg("Lỗi khi lưu.");
    } finally {
      setContactBusy(false);
    }
  }

  // ── Homepage stats (visitors + listings + sold) ──────────────────────────
  const visitors =
    initialStats.find((s) => s.key === "visitors") ?? {
      key: "visitors",
      value: 0,
      override: null,
      label: "Khách truy cập",
      updatedAt: new Date(),
    };
  const statListingsStat = initialStats.find((s) => s.key === "stat_listings");
  const statSoldStat     = initialStats.find((s) => s.key === "stat_sold");

  const [visitorsOverride, setVisitorsOverride] = useState<string>(visitors.override?.toString() ?? "");
  const [visitorsLabel,    setVisitorsLabel]    = useState<string>(visitors.label ?? "Khách truy cập");
  const [listingsOverride, setListingsOverride] = useState<string>(statListingsStat?.override?.toString() ?? "");
  const [listingsLabel,    setListingsLabel]    = useState<string>(statListingsStat?.label ?? "Tin đăng đang hiển thị");
  const [soldOverride,     setSoldOverride]     = useState<string>(statSoldStat?.override?.toString() ?? "");
  const [soldLabel,        setSoldLabel]        = useState<string>(statSoldStat?.label ?? "Đã giao dịch thành công");
  const [statsBusy, setStatsBusy] = useState(false);
  const [statsMsg,  setStatsMsg]  = useState<string | null>(null);

  async function saveAllStats() {
    setStatsBusy(true);
    setStatsMsg(null);
    try {
      await Promise.all([
        fetch("/api/stats/visitors", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            override: visitorsOverride === "" ? null : Number(visitorsOverride),
            label: visitorsLabel || null,
          }),
        }),
        fetch("/api/stats/stat_listings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            override: listingsOverride === "" ? null : Number(listingsOverride),
            label: listingsLabel || null,
          }),
        }),
        fetch("/api/stats/stat_sold", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            override: soldOverride === "" ? null : Number(soldOverride),
            label: soldLabel || null,
          }),
        }),
      ]);
      setStatsMsg("Đã lưu.");
      router.refresh();
    } catch {
      setStatsMsg("Lỗi khi lưu.");
    } finally {
      setStatsBusy(false);
    }
  }

  // ── Latest page size ──────────────────────────────────────────────────────
  const latestPageSizeStat = initialStats.find((s) => s.key === "latest_page_size");
  const [pageSizeVal, setPageSizeVal] = useState<string>(
    (latestPageSizeStat?.override ?? 10).toString(),
  );
  const [pageSizeBusy, setPageSizeBusy] = useState(false);
  const [pageSizeMsg, setPageSizeMsg] = useState<string | null>(null);

  async function savePageSize() {
    const n = parseInt(pageSizeVal) || 10;
    const clamped = Math.min(Math.max(n, 1), 50);
    setPageSizeBusy(true);
    setPageSizeMsg(null);
    try {
      const res = await fetch(`/api/stats/latest_page_size`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          override: clamped,
          label: "Số tin mỗi trang (Tin mới đăng)",
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      setPageSizeVal(clamped.toString());
      setPageSizeMsg("Đã lưu.");
      router.refresh();
    } catch (e) {
      setPageSizeMsg(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setPageSizeBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Footer contact info ──────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4">
        <h2 className="font-bold text-zinc-900 mb-1">📞 Thông tin liên hệ Footer</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Số hotline và địa chỉ email hiển thị ở cuối trang web.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Hotline
            </label>
            <input
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              placeholder="VD: 0900 000 000"
              className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: contact@nhadatgiatot247.com"
              className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled={contactBusy}
            onClick={saveContact}
            className="px-4 py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm rounded font-semibold disabled:opacity-50"
          >
            {contactBusy ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
          {contactMsg && <span className="text-sm text-zinc-600">{contactMsg}</span>}
        </div>
      </div>

      {/* ── Homepage stats — unified card ────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4">
        <h2 className="font-bold text-zinc-900 mb-1">📊 Thống kê trang chủ</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Ba ô thống kê trong mục &quot;Số lượng khách hàng truy cập&quot; ở trang chủ.
          Để trống giá trị tuỳ chỉnh để dùng số thực từ cơ sở dữ liệu.
        </p>

        <div className="divide-y divide-zinc-100">
          {/* ── Row 1: Khách truy cập ── */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="sm:w-52 shrink-0">
              <p className="text-sm font-semibold text-zinc-800">👥 Khách truy cập</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Đếm tự động: <span className="font-medium text-zinc-600">{visitors.value.toLocaleString("vi-VN")}</span>
                {" · "}Hiển thị: <span className="font-medium text-[var(--color-brand)]">{(visitors.override ?? visitors.value).toLocaleString("vi-VN")}</span>
              </p>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Giá trị tuỳ chỉnh</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={visitorsOverride}
                  onChange={(e) => setVisitorsOverride(e.target.value)}
                  placeholder="Để trống = tự động đếm"
                  className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Nhãn hiển thị</label>
                <input
                  value={visitorsLabel}
                  onChange={(e) => setVisitorsLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* ── Row 2: Tin đăng ── */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="sm:w-52 shrink-0">
              <p className="text-sm font-semibold text-zinc-800">🏠 Tin đăng đang hiển thị</p>
              <p className="text-xs text-zinc-400 mt-0.5">Để trống = số thực từ DB</p>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Giá trị tuỳ chỉnh</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={listingsOverride}
                  onChange={(e) => setListingsOverride(e.target.value)}
                  placeholder="Để trống = số thực"
                  className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Nhãn hiển thị</label>
                <input
                  value={listingsLabel}
                  onChange={(e) => setListingsLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* ── Row 3: Giao dịch ── */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="sm:w-52 shrink-0">
              <p className="text-sm font-semibold text-zinc-800">🤝 Đã giao dịch thành công</p>
              <p className="text-xs text-zinc-400 mt-0.5">Để trống = số thực từ DB</p>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Giá trị tuỳ chỉnh</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={soldOverride}
                  onChange={(e) => setSoldOverride(e.target.value)}
                  placeholder="Để trống = số thực"
                  className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Nhãn hiển thị</label>
                <input
                  value={soldLabel}
                  onChange={(e) => setSoldLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            disabled={statsBusy}
            onClick={saveAllStats}
            className="px-4 py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm rounded font-semibold disabled:opacity-50"
          >
            {statsBusy ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
          {statsMsg && <span className="text-sm text-zinc-600">{statsMsg}</span>}
        </div>
      </div>

      {/* ── Latest page size card ────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4">
        <h2 className="font-bold text-zinc-900 mb-1">📋 Số tin mỗi trang — Tin mới đăng</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Số tin hiển thị mỗi lần tải trên trang chủ (nút "Xem thêm"). Tối thiểu 1, tối đa 50.
          Thay đổi có hiệu lực ngay sau khi lưu.
        </p>

        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Số tin mỗi trang
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              value={pageSizeVal}
              onChange={(e) => setPageSizeVal(e.target.value)}
              className="w-28 px-3 py-2 border border-zinc-300 rounded text-sm"
            />
          </div>
          <button
            type="button"
            disabled={pageSizeBusy}
            onClick={savePageSize}
            className="px-4 py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm rounded font-semibold disabled:opacity-50"
          >
            {pageSizeBusy ? "Đang lưu…" : "Lưu"}
          </button>
          {pageSizeMsg && (
            <span className="text-sm text-zinc-600">{pageSizeMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
}
