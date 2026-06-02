import { prisma } from "@/lib/prisma";
import TestimonialsCarousel from "./TestimonialsCarousel";

export default async function TestimonialsSection() {
  const items = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: 12,
  });

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-xl font-bold text-zinc-900 mb-1 text-center">
        💬 Phản hồi của khách hàng
      </h2>
      <p className="text-sm text-zinc-500 mb-6 text-center">
        Những chia sẻ từ khách hàng đã giao dịch qua Nhà đất giá tốt 24h.
      </p>

      <TestimonialsCarousel items={items} />
    </section>
  );
}
