"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  PROPERTY_CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/formatters";
import type { PriceOptionItem } from "@/lib/priceOptions";

const TYPES = Object.keys(PROPERTY_TYPE_LABEL) as (keyof typeof PROPERTY_TYPE_LABEL)[];

type Props = { priceOptions: PriceOptionItem[] };

export default function SearchFilter({ priceOptions }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  // All filter values live in local state; the URL is only updated on submit.
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [type, setType] = useState(params.get("type") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [minArea, setMinArea] = useState(params.get("minArea") ?? "");
  const [maxArea, setMaxArea] = useState(params.get("maxArea") ?? "");

  function applyAll(e: { preventDefault(): void }) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (search)   next.set("search",   search);
    if (category) next.set("category", category);
    if (type)     next.set("type",     type);
    if (city)     next.set("city",     city);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    if (minArea)  next.set("minArea",  minArea);
    if (maxArea)  next.set("maxArea",  maxArea);
    startTransition(() => router.push(`/listings?${next.toString()}`));
  }

  function reset() {
    setSearch(""); setCategory(""); setType(""); setCity("");
    setMinPrice(""); setMaxPrice(""); setMinArea(""); setMaxArea("");
    router.push("/listings");
  }

  return (
    <aside className="bg-white border border-zinc-200 rounded-lg p-4 text-sm sticky top-20">
      <form onSubmit={applyAll} className="space-y-5">
        {/* Search */}
        <div>
          <label className="block font-semibold mb-1">Tìm kiếm</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tỉnh, quận, từ khoá…"
            className="w-full px-2 py-1.5 border border-zinc-300 rounded focus:outline-none focus:border-[var(--color-brand)]"
          />
        </div>

        {/* Category */}
        <div>
          <div className="font-semibold mb-1">Danh mục</div>
          <div className="grid grid-cols-2 gap-1">
            {(["MUA_BAN", "CHO_THUE"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory((prev) => (prev === c ? "" : c))}
                className={`px-2 py-1 rounded border text-xs ${
                  category === c
                    ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                    : "bg-white border-zinc-300 hover:border-[var(--color-brand)]"
                }`}
              >
                {PROPERTY_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Property type */}
        <div>
          <div className="font-semibold mb-1">Loại BĐS</div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-2 py-1.5 border border-zinc-300 rounded"
          >
            <option value="">Tất cả</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <div className="font-semibold mb-1">Tỉnh / Thành phố</div>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="VD: Hà Tĩnh, Hồ Chí Minh"
            className="w-full px-2 py-1.5 border border-zinc-300 rounded"
          />
        </div>

        {/* Price range */}
        <div>
          <div className="font-semibold mb-1">Khoảng giá</div>
          <div className="flex gap-2">
            <select
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1 min-w-0 w-0 px-2 py-1.5 border border-zinc-300 rounded"
            >
              <option value="">Từ</option>
              {priceOptions.map((o) => (
                <option key={o.id} value={String(o.value)}>{o.label}</option>
              ))}
            </select>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 min-w-0 w-0 px-2 py-1.5 border border-zinc-300 rounded"
            >
              <option value="">Đến</option>
              {priceOptions.map((o) => (
                <option key={o.id} value={String(o.value)}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Area */}
        <div>
          <div className="font-semibold mb-1">Diện tích (m²)</div>
          <div className="flex gap-2">
            <input
              type="number"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              placeholder="Từ"
              className="w-1/2 px-2 py-1.5 border border-zinc-300 rounded"
            />
            <input
              type="number"
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
              placeholder="Đến"
              className="w-1/2 px-2 py-1.5 border border-zinc-300 rounded"
            />
          </div>
        </div>

        {/* Actions */}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white rounded font-semibold text-sm disabled:opacity-50"
        >
          {pending ? "Đang tìm…" : "🔍 Tìm kiếm"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="w-full py-2 border border-zinc-300 rounded hover:bg-zinc-50 text-xs"
        >
          Xoá tất cả bộ lọc
        </button>
      </form>
    </aside>
  );
}
