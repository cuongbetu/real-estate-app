import Link from "next/link";
import Image from "next/image";
import type { ListingSummary } from "@/types/listing";
import {
  formatArea,
  formatPrice,
  formatPricePerM2,
  formatRelativeTime,
  LEGAL_STATUS_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/lib/formatters";

type Props = {
  listing: ListingSummary & { legalStatus?: string | null };
  variant?: "grid" | "row";
};

const PLACEHOLDER = "/placeholder-listing.svg";

export default function ListingCard({ listing, variant = "row" }: Props) {
  const cover = listing.images?.[0] || PLACEHOLDER;
  const isExternal = cover.startsWith("http");

  if (variant === "grid") {
    return (
      <Link
        href={`/listings/${listing.slug}`}
        className="bg-white rounded-lg border border-zinc-200 overflow-hidden hover:shadow-md transition"
      >
        <div className="relative aspect-[4/3] bg-zinc-100">
          <Image src={cover} alt={listing.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" unoptimized={!isExternal} />
          {listing.featured && (
            <span className="absolute top-2 left-2 bg-[var(--color-brand)] text-white text-xs font-semibold px-2 py-0.5 rounded">
              Nổi bật
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-zinc-900 line-clamp-2 leading-snug">
            {listing.title}
          </h3>
          <div className="mt-1 text-[var(--color-brand)] font-bold">
            {formatPrice(listing.price, listing.currency)}
            {listing.pricePerM2 && (
              <span className="text-xs text-zinc-500 font-normal ml-1">
                ({formatPricePerM2(listing.pricePerM2, listing.currency)})
              </span>
            )}
            {listing.priceNegotiable && (
              <span className="bg-amber-100 text-amber-800 text-xs font-normal ml-1">Có thương lượng</span>
            )}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            📍 {[listing.address, listing.ward, listing.district, listing.city].filter(Boolean).join(", ")}
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            📐 {formatArea(listing.area)}
            {listing.bedrooms != null && ` • 🛏 ${listing.bedrooms} PN`}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="flex gap-4 bg-white rounded-lg border border-zinc-200 p-3 hover:shadow-md transition"
    >
      <div className="relative w-40 h-32 shrink-0 bg-zinc-100 rounded overflow-hidden">
        <Image src={cover} alt={listing.title} fill className="object-cover" sizes="160px" unoptimized={!isExternal} />
        {listing.featured && (
          <span className="absolute top-1 left-1 bg-[var(--color-brand)] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            Nổi bật
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 line-clamp-2 leading-snug">
          {listing.title}
        </h3>
        <div className="text-sm text-zinc-500 mt-1">
          📍 {[listing.address, listing.ward, listing.district, listing.city].filter(Boolean).join(", ")}
        </div>
        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
          <span className="text-[var(--color-brand)] font-bold text-lg">
            💰 {formatPrice(listing.price, listing.currency)}
          </span>
          {listing.pricePerM2 && (
            <span className="text-xs text-zinc-500">
              {formatPricePerM2(listing.pricePerM2, listing.currency)}
            </span>
          )}
          {listing.priceNegotiable && (
            <span className="text-xs bg-amber-100 text-amber-800">Có thương lượng</span>
          )}
          <span className="text-zinc-700 text-sm">• 📐 {formatArea(listing.area)}</span>
          {listing.bedrooms != null && (
            <span className="text-zinc-700 text-sm">• 🛏 {listing.bedrooms} PN</span>
          )}
        </div>
        <div className="mt-1 text-xs text-zinc-600 flex flex-wrap gap-x-3 gap-y-1">
          <span>🏷 {PROPERTY_TYPE_LABEL[listing.type]}</span>
          {listing.legalStatus && (
            <span>📋 {LEGAL_STATUS_LABEL[listing.legalStatus as keyof typeof LEGAL_STATUS_LABEL]}</span>
          )}
          {listing.verified && <span className="text-green-600">✅ Đã xác thực</span>}
        </div>
        <div className="mt-1 text-xs text-zinc-400">
          🕐 Đăng {formatRelativeTime(listing.createdAt)}
        </div>
      </div>
    </Link>
  );
}
