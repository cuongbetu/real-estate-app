"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { v: "newest", l: "Mới nhất" },
  { v: "priceAsc", l: "Giá tăng dần" },
  { v: "priceDesc", l: "Giá giảm dần" },
  { v: "areaDesc", l: "Diện tích lớn nhất" },
];

export default function SortSelect({ current = "newest" }: { current?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    next.delete("page");
    router.push(`/listings?${next.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 max-w-full px-2 py-1 border border-zinc-300 rounded text-sm"
    >
      {OPTIONS.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}
