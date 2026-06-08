"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const safe = images.length ? images : ["/placeholder-listing.svg"];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="relative block w-full aspect-[16/10] bg-zinc-100 rounded-lg overflow-hidden"
      >
        <Image
          src={safe[active]}
          alt={`${title} — ảnh ${active + 1}`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
          unoptimized={safe[active].startsWith("/uploads/")}
        />
      </button>
      {safe.length > 1 && (
        <div className="grid grid-cols-6 gap-2 mt-2">
          {safe.slice(0, 6).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-[4/3] rounded overflow-hidden border-2 ${
                active === i ? "border-[var(--color-brand)]" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="100px" unoptimized={src.startsWith("/uploads/")} />
              {i === 5 && safe.length > 6 && (
                <span className="absolute inset-0 bg-black/60 text-white grid place-items-center text-sm font-semibold">
                  +{safe.length - 6}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4"
        >
          <div className="relative w-full max-w-5xl aspect-[16/10]">
            <Image
              src={safe[active]}
              alt=""
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized={safe[active].startsWith("/uploads/")}
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white text-xl"
            onClick={() => setLightbox(false)}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
