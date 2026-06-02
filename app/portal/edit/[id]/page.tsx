import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/auth";
import ListingForm from "@/components/portal/ListingForm";

type Params = Promise<{ id: string }>;

export default async function EditListingPage({ params }: { params: Params }) {
  if (!(await isAdminSession())) redirect("/portal/login");

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/portal" className="text-sm text-zinc-500 hover:text-[var(--color-brand)]">
        ← Quay lại danh sách
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900 mt-2 mb-6">
        Sửa tin: <span className="text-zinc-600 font-normal">{listing.title}</span>
      </h1>
      <ListingForm mode={{ kind: "edit", id: listing.id }} initial={listing} />
    </div>
  );
}
