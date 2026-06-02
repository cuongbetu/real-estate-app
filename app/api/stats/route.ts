import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.siteStat.findMany({ orderBy: { key: "asc" } });
  return Response.json({
    items: items.map((s) => ({
      key: s.key,
      label: s.label,
      value: s.value,
      override: s.override,
      display: s.override ?? s.value,
    })),
  });
}
