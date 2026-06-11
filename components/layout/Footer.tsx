import { prisma } from "@/lib/prisma";

export default async function Footer() {
  const contactStats = await prisma.siteStat.findMany({
    where: { key: { in: ["footer_hotline", "footer_email"] } },
  });

  const hotline =
    contactStats.find((s) => s.key === "footer_hotline")?.label ??
    "0900 000 000";
  const email =
    contactStats.find((s) => s.key === "footer_email")?.label ??
    "contact@nhadatgiatot247.com";

  return (
    <footer className="bg-zinc-900 text-zinc-400 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="text-white font-bold mb-3">Nhà đất giá tốt 24h</div>
          <p className="leading-6">
            Nền tảng bất động sản: mua bán & cho thuê nhà phố, căn hộ, đất nền,
            mặt bằng kinh doanh trên toàn quốc.
          </p>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">Liên hệ</div>
          <p>Hotline: {hotline}</p>
          <p>Email: {email}</p>
        </div>
        <div>
          <div className="text-white font-semibold mb-3">Theo loại BĐS</div>
          <ul className="space-y-1">
            <li><a href="/listings?type=NHA_PHO" className="hover:text-white">Nhà phố</a></li>
            <li><a href="/listings?type=CAN_HO" className="hover:text-white">Căn hộ chung cư</a></li>
            <li><a href="/listings?type=DAT_NEN" className="hover:text-white">Đất nền</a></li>
            <li><a href="/listings?type=MAT_BANG" className="hover:text-white">Mặt bằng kinh doanh</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs">
        © {new Date().getFullYear()} Nhà đất giá tốt 24h · nhadatgiatot247.com
      </div>
    </footer>
  );
}
