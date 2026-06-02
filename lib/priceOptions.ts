import { prisma } from "@/lib/prisma";

export type PriceOptionItem = {
  id: string;
  label: string;
  value: number;
  displayOrder: number;
  active: boolean;
};

/** Hardcoded defaults — used when the DB table is empty. */
export const DEFAULT_PRICE_OPTIONS: Omit<PriceOptionItem, "id">[] = [
  { label: "500 triệu",  value: 500_000_000,    displayOrder: 0,  active: true },
  { label: "1 tỉ",       value: 1_000_000_000,  displayOrder: 1,  active: true },
  { label: "1.5 tỉ",     value: 1_500_000_000,  displayOrder: 2,  active: true },
  { label: "2 tỉ",       value: 2_000_000_000,  displayOrder: 3,  active: true },
  { label: "3 tỉ",       value: 3_000_000_000,  displayOrder: 4,  active: true },
  { label: "4 tỉ",       value: 4_000_000_000,  displayOrder: 5,  active: true },
  { label: "5 tỉ",       value: 5_000_000_000,  displayOrder: 6,  active: true },
  { label: "7 tỉ",       value: 7_000_000_000,  displayOrder: 7,  active: true },
  { label: "10 tỉ",      value: 10_000_000_000, displayOrder: 8,  active: true },
  { label: "15 tỉ",      value: 15_000_000_000, displayOrder: 9,  active: true },
  { label: "20 tỉ",      value: 20_000_000_000, displayOrder: 10, active: true },
];

/**
 * Returns active price options from the DB.
 * Falls back to DEFAULT_PRICE_OPTIONS when the table is empty.
 * Server-side only.
 */
export async function getPriceOptions(): Promise<PriceOptionItem[]> {
  const rows = await prisma.priceOption.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: "asc" }, { value: "asc" }],
  });
  if (rows.length === 0) return DEFAULT_PRICE_OPTIONS.map((o, i) => ({ ...o, id: String(i) }));
  return rows;
}
