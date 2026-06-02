import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import ListingForm from "@/components/portal/ListingForm";

export default async function CreateListingPage() {
  if (!(await isAdminSession())) redirect("/portal/login");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/portal" className="text-sm text-zinc-500 hover:text-[var(--color-brand)]">
        ← Quay lại danh sách
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900 mt-2 mb-6">Đăng tin mới</h1>
      <ListingForm mode={{ kind: "create" }} />
    </div>
  );
}
