"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  PROPERTY_CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
  LEGAL_STATUS_LABEL,
} from "@/lib/formatters";
import type { PriceOptionItem } from "@/lib/priceOptions";

const TYPES = Object.keys(PROPERTY_TYPE_LABEL) as (keyof typeof PROPERTY_TYPE_LABEL)[];
const LEGALS = Object.keys(LEGAL_STATUS_LABEL) as (keyof typeof LEGAL_STATUS_LABEL)[];

type Props = { priceOptions: PriceOptionItem[] };

export default function MobileFilter({ priceOptions }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  // All values in local state — URL is only updated when submit is pressed.
  const [search,     setSearch]     = useState(params.get("search")     ?? "");
  const [minPrice,   setMinPrice]   = useState(params.get("minPrice")   ?? "");
  const [maxPrice,   setMaxPrice]   = useState(params.get("maxPrice")   ?? "");
  const [category,   setCategory]   = useState(params.get("category")   ?? "");
  const [type,       setType]       = useState(params.get("type")       ?? "");
  const [legalStatus,setLegalStatus]= useState(params.get("legalStatus")?? "");
  const [city,       setCity]       = useState(params.get("city")       ?? "");
  const [minArea,    setMinArea]    = useState(params.get("minArea")    ?? "");
  const [maxArea,    setMaxArea]    = useState(params.get("maxArea")    ?? "");
  const [bedrooms,   setBedrooms]   = useState(params.get("bedrooms")   ?? "");
  const [expanded,   setExpanded]   = useState(false);

  function applyAll(e: { preventDefault(): void }) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (search)      next.set("search",      search);
    if (minPrice)    next.set("minPrice",    minPrice);
    if (maxPrice)    next.set("maxPrice",    maxPrice);
    if (category)    next.set("category",    category);
    if (type)        next.set("type",        type);
    if (legalStatus) next.set("legalStatus", legalStatus);
    if (city)        next.set("city",        city);
    if (minArea)     next.set("minArea",     minArea);
    if (maxArea)     next.set("maxArea",     maxArea);
    if (bedrooms)    next.set("bedrooms",    bedrooms);
    router.push(`/listings?${next.toString()}`);
  }

  function reset() {
    setSearch(""); setMinPrice(""); setMaxPrice("");
    setCategory(""); setType(""); setLegalStatus("");
    setCity(""); setMinArea(""); setMaxArea(""); setBedrooms("");
    router.push("/listings");
  }

  const activeExtraCount =
    [category, type, legalStatus, city, minArea, maxArea, bedrooms].filter(Boolean).length;

  return (
    <div className="lg:hidden sticky top-[57px] z-20 bg-white border-b border-zinc-200 shadow-sm">
      <form onSubmit={applyAll} className="px-3 py-2 space-y-2">
        {/* Row 1 — search + submit */}
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tỉnh, quận, từ khoá…"
            className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:border-[var(--color-brand)]"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[var(--color-brand)] text-white text-sm font-semibold rounded"
          >
            Tìm
          </button>
        </div>

        {/* Row 2 — price selects */}
        <div className="flex gap-2">
          <select
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="flex-1 min-w-0 w-0 px-2 py-2 border border-zinc-300 rounded text-sm"
          >
            <option value="">Giá từ</option>
            {priceOptions.map((o) => (
              <option key={o.id} value={String(o.value)}>{o.label}</option>
            ))}
          </select>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="flex-1 min-w-0 w-0 px-2 py-2 border border-zinc-300 rounded text-sm"
          >
            <option value="">Giá đến</option>
            {priceOptions.map((o) => (
              <option key={o.id} value={String(o.value)}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Row 3 — expand toggle + reset */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-[var(--color-brand)] font-semibold inline-flex items-center gap-1"
            aria-expanded={expanded}
          >
            {expanded ? "▲ Ẩn bộ lọc" : "▼ Bộ lọc nâng cao"}
            {activeExtraCount > 0 && (
              <span className="bg-[var(--color-brand)] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {activeExtraCount}
              </span>
            )}
          </button>
          {(activeExtraCount > 0 || search || minPrice || maxPrice || params.toString()) && (
            <button type="button" onClick={reset} className="text-xs text-zinc-500 underline">
              Xoá tất cả
            </button>
          )}
        </div>
      </form>

      {/* Expanded panel */}
      {expanded && (
        <form onSubmit={applyAll} className="px-3 pb-3 space-y-3 border-t border-zinc-100 pt-3">
          <div>
            <div className="text-xs font-semibold mb-1">Danh mục</div>
            <div className="flex gap-2">
              {(["MUA_BAN", "CHO_THUE"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory((prev) => (prev === c ? "" : c))}
                  className={`flex-1 px-2 py-1.5 rounded border text-xs ${
                    category === c
                      ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                      : "bg-white border-zinc-300"
                  }`}
                >
                  {PROPERTY_CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <div className="text-xs font-semibold mb-1">Loại BĐS</div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full min-w-0 px-2 py-1.5 border border-zinc-300 rounded text-sm"
              >
                <option value="">Tất cả</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold mb-1">Pháp lý</div>
              <select
                value={legalStatus}
                onChange={(e) => setLegalStatus(e.target.value)}
                className="w-full min-w-0 px-2 py-1.5 border border-zinc-300 rounded text-sm"
              >
                <option value="">Tất cả</option>
                {LEGALS.map((l) => (
                  <option key={l} value={l}>{LEGAL_STATUS_LABEL[l]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-1">Tỉnh / Thành phố</div>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="VD: Hà Tĩnh, Hồ Chí Minh"
              className="w-full px-2 py-1.5 border border-zinc-300 rounded text-sm"
            />
          </div>

          <div>
            <div className="text-xs font-semibold mb-1">Diện tích (m²)</div>
            <div className="flex gap-2">
              <input
                type="number"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                placeholder="Từ"
                className="w-1/2 min-w-0 px-2 py-1.5 border border-zinc-300 rounded text-sm"
              />
              <input
                type="number"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                placeholder="Đến"
                className="w-1/2 min-w-0 px-2 py-1.5 border border-zinc-300 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-1">Số phòng ngủ</div>
            <div className="flex gap-1">
              {["1", "2", "3", "4", "5"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBedrooms((prev) => (prev === b ? "" : b))}
                  className={`flex-1 px-2 py-1 rounded border text-xs ${
                    bedrooms === b
                      ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                      : "bg-white border-zinc-300"
                  }`}
                >
                  {b === "5" ? "5+" : b}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded font-semibold text-sm"
          >
            🔍 Tìm kiếm
          </button>
        </form>
      )}
    </div>
  );
}
