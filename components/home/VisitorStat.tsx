import { prisma } from "@/lib/prisma";

export default async function VisitorStat() {
  const [visitors, statListings, statSold, listingsCount, soldCount] = await Promise.all([
    prisma.siteStat.findUnique({ where: { key: "visitors" } }),
    prisma.siteStat.findUnique({ where: { key: "stat_listings" } }),
    prisma.siteStat.findUnique({ where: { key: "stat_sold" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
  ]);

  const visitorsValue = visitors?.override ?? visitors?.value ?? 0;
  const visitorsLabel = visitors?.label ?? "Khách truy cập";

  const listingsValue = statListings?.override ?? listingsCount;
  const listingsLabel = statListings?.label ?? "Tin đăng đang hiển thị";

  const soldValue = statSold?.override ?? soldCount;
  const soldLabel = statSold?.label ?? "Đã giao dịch thành công";

  const stats = [
    { label: visitorsLabel, value: visitorsValue, icon: "👥" },
    { label: listingsLabel, value: listingsValue, icon: "🏠" },
    { label: soldLabel, value: soldValue, icon: "🤝" },
  ];

  return (
    <section style={{ background: "#fafafa" }}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-1 text-center text-zinc-900">
          🌐 Số lượng khách hàng truy cập
        </h2>
        <p className="text-center text-zinc-500 text-sm mb-6">
          Nhà đất giá tốt 24h đang được tin tưởng bởi hàng ngàn khách hàng trên cả nước.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-zinc-200 rounded-lg p-5 text-center shadow-sm"
            >
              <div className="text-3xl">{s.icon}</div>
              <div className="text-3xl font-bold mt-1 text-[var(--color-brand)]">
                {s.value.toLocaleString("vi-VN")}
              </div>
              <div className="text-sm text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
