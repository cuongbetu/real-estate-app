import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "ez_visited";
const ONE_DAY = 60 * 60 * 24;

export async function POST() {
  const store = await cookies();
  const already = store.get(COOKIE);

  if (already) {
    const stat = await prisma.siteStat.findUnique({ where: { key: "visitors" } });
    return Response.json({
      counted: false,
      value: stat?.override ?? stat?.value ?? 0,
    });
  }

  const stat = await prisma.siteStat.upsert({
    where: { key: "visitors" },
    update: { value: { increment: 1 } },
    create: { key: "visitors", value: 1, label: "Khách truy cập" },
  });

  store.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY * 90,
  });

  return Response.json({
    counted: true,
    value: stat.override ?? stat.value,
  });
}
