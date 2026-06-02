"use client";

import { useRouter, useSearchParams } from "next/navigation";

const DEFAULT_PER_PAGE = 20;

type Props = {
  current: number;
  options: number[];
};

export default function PerPageSelect({ current, options }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    const n = parseInt(value);
    if (n === DEFAULT_PER_PAGE) next.delete("pageSize");
    else next.set("pageSize", value);
    next.delete("page"); // reset to page 1 when page size changes
    router.push(`/listings?${next.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 max-w-full px-2 py-1 border border-zinc-300 rounded text-sm"
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {n} / trang
        </option>
      ))}
    </select>
  );
}
