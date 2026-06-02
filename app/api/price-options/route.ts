import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  label: z.string().min(1, "Nhãn bắt buộc").max(50),
  value: z
    .union([z.number(), z.string()])
    .transform((v) => parseFloat(String(v)))
    .refine((n) => Number.isFinite(n) && n > 0, { message: "Giá trị phải > 0" }),
  displayOrder: z
    .union([z.number(), z.string(), z.undefined()])
    .transform((v) => (v === undefined || v === "" ? 0 : Math.round(Number(v))))
    .optional(),
  active: z.boolean().default(true),
});

/** GET /api/price-options — public, returns active options */
export async function GET() {
  const rows = await prisma.priceOption.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: "asc" }, { value: "asc" }],
  });
  return Response.json(rows);
}

/** POST /api/price-options — admin, creates a new option */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const row = await prisma.priceOption.create({ data: parsed.data });
  return Response.json(row, { status: 201 });
}
