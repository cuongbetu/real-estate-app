import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ImageGallery from "@/components/listings/ImageGallery";
import ContactBox from "@/components/listings/ContactBox";
import FeaturedCarousel from "@/components/listings/FeaturedCarousel";
import {
  DIRECTION_LABEL,
  FURNITURE_LABEL,
  LEGAL_STATUS_LABEL,
  PROPERTY_CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
  formatArea,
  formatPrice,
  formatPricePerM2,
  formatRelativeTime,
} from "@/lib/formatters";

type Params = Promise<{ slug: string }>;

async function getListing(slug: string) {
  return prisma.listing.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Không tìm thấy tin đăng" };
  return {
    title: `${listing.title} | Giá ${formatPrice(listing.price, listing.currency)}`,
    description: `${PROPERTY_TYPE_LABEL[listing.type]} tại ${listing.district}, ${listing.city}. Diện tích ${formatArea(listing.area)}. ${listing.description.slice(0, 120)}`,
    alternates: {
      canonical: `/listings/${listing.slug}`,
    },
    openGraph: {
      title: listing.title,
      description: `${PROPERTY_TYPE_LABEL[listing.type]} tại ${listing.district}, ${listing.city}. Diện tích ${formatArea(listing.area)}.`,
      images: listing.images?.[0] ? [listing.images[0]] : undefined,
      type: "article",
      locale: "vi_VN",
    },
  };
}

export default async function ListingDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing || listing.status === "HIDDEN") notFound();

  // increment view count (fire and forget)
  prisma.listing
    .update({ where: { id: listing.id }, data: { views: { increment: 1 } } })
    .catch(() => null);

  const related = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      id: { not: listing.id },
      OR: [{ city: listing.city }, { type: listing.type }],
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const specRows: [string, string | null][] = [
    ["Loại BĐS", PROPERTY_TYPE_LABEL[listing.type]],
    ["Danh mục", PROPERTY_CATEGORY_LABEL[listing.category]],
    ["Diện tích", formatArea(listing.area)],
    listing.areaUsable ? ["Diện tích sử dụng", formatArea(listing.areaUsable)] : null,
    listing.areaLand ? ["Diện tích đất", formatArea(listing.areaLand)] : null,
    listing.width ? ["Chiều ngang", `${listing.width} m`] : null,
    listing.length ? ["Chiều dài", `${listing.length} m`] : null,
    listing.floors ? ["Số tầng", String(listing.floors)] : null,
    listing.bedrooms != null ? ["Số phòng ngủ", String(listing.bedrooms)] : null,
    listing.bathrooms != null ? ["Số phòng tắm", String(listing.bathrooms)] : null,
    ["Mức giá", formatPrice(listing.price, listing.currency)],
    listing.pricePerM2
      ? ["Giá/m²", formatPricePerM2(listing.pricePerM2, listing.currency)]
      : null,
    listing.minLotSize ? ["Tách lô tối thiểu", `${listing.minLotSize} ha`] : null,
    listing.legalStatus ? ["Pháp lý", LEGAL_STATUS_LABEL[listing.legalStatus]] : null,
    listing.furniture ? ["Nội thất", FURNITURE_LABEL[listing.furniture]] : null,
    listing.direction ? ["Hướng", DIRECTION_LABEL[listing.direction]] : null,
    [
      "Địa chỉ",
      [listing.address, listing.ward, listing.district, listing.city]
        .filter(Boolean)
        .join(", "),
    ],
  ].filter(Boolean) as [string, string][];

  // Build the Google Maps embed URL.

  // Priority: mapsUrl field → lat/lng → full address fallback.
  // Short URLs (maps.app.goo.gl, goo.gl/maps) are resolved server-side
  // because appending ?output=embed to a redirect URL doesn't work.
  let resolvedMapsUrl = listing.mapsUrl ?? null;
  if (resolvedMapsUrl && /maps\.app\.goo\.gl|goo\.gl\/maps/.test(resolvedMapsUrl)) {
    try {
      const res = await fetch(resolvedMapsUrl, {
        redirect: "follow",
        next: { revalidate: 3600 },
      });
      resolvedMapsUrl = res.url || resolvedMapsUrl;
    } catch {
      // keep original; will fall through to address-based embed
    }
  }

  const mapEmbed = (() => {
    if (resolvedMapsUrl) {
      const url = resolvedMapsUrl.trim();
      // Already an embed URL — use as-is
      if (url.includes("/maps/embed")) return url;
      // URL with @lat,lng coordinates (standard desktop/mobile share link)
      const coords = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coords) {
        return `https://www.google.com/maps?q=${coords[1]},${coords[2]}&z=15&output=embed`;
      }
      // Full Google Maps URL — append output=embed
      try {
        const u = new URL(url);
        if (u.hostname.includes("google.com")) {
          u.searchParams.set("output", "embed");
          return u.toString();
        }
      } catch { /* fall through */ }
    }
    if (listing.mapLat && listing.mapLng) {
      return `https://www.google.com/maps?q=${listing.mapLat},${listing.mapLng}&z=15&output=embed`;
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(
      `${listing.address}, ${listing.district}, ${listing.city}`,
    )}&output=embed`;
  })();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: `/listings/${listing.slug}`,
    image: listing.images,
    offers: {
      "@type": "Offer",
      price: parseFloat(String(listing.price).replace(/,/g, "")) || listing.price,
      priceCurrency: listing.currency,
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.area,
      unitCode: "MTK",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.district,
      addressRegion: listing.city,
      addressCountry: "VN",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className="text-xs text-zinc-500 mb-3">
        <a href="/" className="hover:underline">Trang chủ</a> ›{" "}
        <a href="/listings" className="hover:underline">Tin đăng</a> ›{" "}
        <a href={`/listings?city=${encodeURIComponent(listing.city)}`} className="hover:underline">
          {listing.city}
        </a>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <article>
          <ImageGallery images={listing.images} title={listing.title} />

          <div className="mt-5">
            <h1 className="text-2xl font-bold text-zinc-900 leading-snug">
              {listing.title}
            </h1>
            <div className="text-sm text-zinc-500 mt-1">
              📍 {listing.address}, {listing.district}, {listing.city}
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex flex-wrap gap-x-3 gap-y-1 items-center">
              <span>🕐 Đăng {formatRelativeTime(listing.createdAt)}</span>
              <span>👁 {listing.views.toLocaleString("vi-VN")} khách hàng đã xem</span>
              {listing.verified && (
                <span className="text-green-600">✅ Đã xác thực</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <div className="text-3xl font-bold text-[var(--color-brand)]">
              {formatPrice(listing.price, listing.currency)}
            </div>
            {listing.pricePerM2 && (
              <div className="text-zinc-500 text-sm">
                ({formatPricePerM2(listing.pricePerM2, listing.currency)})
              </div>
            )}
            {listing.priceNegotiable && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Có thương lượng
              </span>
            )}
          </div>

          <div className="mt-4 bg-white border border-zinc-200 rounded-lg p-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span>📐 <strong>{formatArea(listing.area)}</strong></span>
            {listing.bedrooms != null && (
              <span>🛏 <strong>{listing.bedrooms}</strong> phòng ngủ</span>
            )}
            {listing.bathrooms != null && (
              <span>🚿 <strong>{listing.bathrooms}</strong> phòng tắm</span>
            )}
            {listing.direction && (
              <span>🧭 <strong>{DIRECTION_LABEL[listing.direction]}</strong></span>
            )}
            {listing.legalStatus && (
              <span>📋 <strong>{LEGAL_STATUS_LABEL[listing.legalStatus]}</strong></span>
            )}
          </div>

          <section className="mt-6">
            <h2 className="font-bold text-lg mb-2">Mô tả chi tiết</h2>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 text-zinc-700 whitespace-pre-line leading-7">
              {listing.description}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-bold text-lg mb-2">Thông tin bất động sản</h2>
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {specRows.map(([k, v]) => (
                    <tr key={k} className="border-b border-zinc-100 last:border-0">
                      <td className="py-2 px-3 text-zinc-500 w-40">{k}</td>
                      <td className="py-2 px-3 font-medium text-zinc-800">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {listing.videoUrl && (
            <section className="mt-6">
              <h2 className="font-bold text-lg mb-2">Video</h2>
              <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden aspect-video">
                {isYouTubeUrl(listing.videoUrl) ? (
                  <iframe
                    src={toYouTubeEmbed(listing.videoUrl)}
                    className="w-full h-full border-0"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={listing.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            </section>
          )}

          <section className="mt-6">
            <h2 className="font-bold text-lg mb-2">Bản đồ</h2>
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <iframe
                src={mapEmbed}
                className="w-full h-72 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          {/* Mobile-only ContactBox — renders above Tin tương tự on phone */}
          <div className="lg:hidden mt-6">
            <ContactBox
              name={listing.contactName}
              phone={listing.contactPhone}
              phone2={listing.contactPhone2}
            />
          </div>

          {related.length > 0 && (
            <section className="mt-8">
              <h2 className="font-bold text-lg mb-2">Tin tương tự</h2>
              <FeaturedCarousel items={related} />
            </section>
          )}
        </article>

        <aside className="hidden lg:block">
          <ContactBox
            name={listing.contactName}
            phone={listing.contactPhone}
            phone2={listing.contactPhone2}
          />
        </aside>
      </div>
    </div>
  );
}

function isYouTubeUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "youtu.be" || hostname.includes("youtube.com");
  } catch {
    return false;
  }
}

function toYouTubeEmbed(url: string): string {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return url;
      id = u.searchParams.get("v");
    }
    if (id) return `https://www.youtube.com/embed/${id}`;
  } catch { /* fall through */ }
  return url;
}
