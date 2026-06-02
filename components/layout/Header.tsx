import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-[var(--color-brand)] text-white grid place-items-center font-bold text-xs">
            24h
          </div>
          <span className="font-bold text-lg text-zinc-900 hidden sm:inline">
            Nhà đất giá tốt 24h
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/listings?category=MUA_BAN"
            className="px-3 py-2 rounded-md text-zinc-700 hover:bg-zinc-100"
          >
            Mua bán
          </Link>
          <Link
            href="/listings?category=CHO_THUE"
            className="px-3 py-2 rounded-md text-zinc-700 hover:bg-zinc-100"
          >
            Cho thuê
          </Link>
          <Link
            href="/listings"
            className="px-3 py-2 rounded-md text-zinc-700 hover:bg-zinc-100"
          >
            Tất cả tin
          </Link>
        </nav>
      </div>
    </header>
  );
}
