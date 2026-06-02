import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Không tìm thấy tin đăng</h1>
      <p className="text-zinc-500 mt-2">
        Có thể tin đã bị xoá hoặc đường dẫn không đúng.
      </p>
      <Link
        href="/listings"
        className="inline-block mt-6 px-5 py-2 bg-[var(--color-brand)] text-white rounded-md font-semibold"
      >
        Xem tất cả tin
      </Link>
    </div>
  );
}
