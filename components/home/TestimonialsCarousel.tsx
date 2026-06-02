"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Testimonial } from "@prisma/client";

const AUTOPLAY_MS = 5000;

function Stars({ n }: { n: number }) {
  const clamped = Math.max(0, Math.min(5, n));
  return (
    <div className="text-amber-400 text-sm" aria-label={`${clamped}/5 sao`}>
      {"★".repeat(clamped)}
      <span className="text-zinc-300">{"★".repeat(5 - clamped)}</span>
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col h-full">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-200 shrink-0">
          {item.avatarUrl ? (
            <Image
              src={item.avatarUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-zinc-500 font-semibold text-lg">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-zinc-900 truncate">{item.name}</div>
          <Stars n={item.rating} />
        </div>
      </div>
      <p className="mt-3 text-sm text-zinc-700 leading-6 line-clamp-5">
        "{item.comment}"
      </p>
    </article>
  );
}

function computeVisible(): number {
  if (typeof window === "undefined") return 3;
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

export default function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const sliding = useRef(false);

  useEffect(() => {
    function update() {
      setVisible(computeVisible());
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const canLoop = items.length > visible;

  const extended = useMemo(
    () => (canLoop ? [...items, ...items.slice(0, visible)] : items),
    [items, visible, canLoop],
  );

  // Re-enable transition after a no-animation snap-back.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimate(true)),
    );
    return () => cancelAnimationFrame(id);
  }, [animate]);

  // Reset when looping becomes impossible (e.g. viewport grows).
  useEffect(() => {
    if (!canLoop) {
      setIndex(0);
      setAnimate(true);
    }
  }, [canLoop]);

  // Autoplay
  useEffect(() => {
    if (paused || !canLoop) return;
    const id = setInterval(() => {
      if (sliding.current) return;
      sliding.current = true;
      setAnimate(true);
      setIndex((i) => i + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, canLoop]);

  function onTransitionEnd() {
    sliding.current = false;
    if (index >= items.length) {
      setAnimate(false);
      setIndex(0);
    }
  }

  function goNext() {
    if (!canLoop || sliding.current) return;
    sliding.current = true;
    setAnimate(true);
    setIndex((i) => i + 1);
  }

  function goPrev() {
    if (!canLoop || sliding.current) return;
    sliding.current = true;
    if (index === 0) {
      setAnimate(false);
      setIndex(items.length);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(items.length - 1);
        }),
      );
    } else {
      setAnimate(true);
      setIndex((i) => i - 1);
    }
  }

  const cardWidth = `${100 / visible}%`;
  const activeDot = items.length > 0 ? index % items.length : 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className={`flex items-stretch ${animate ? "transition-transform duration-500 ease-out" : ""}`}
          style={{ transform: `translateX(-${index * (100 / visible)}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="shrink-0 px-2"
              style={{ width: cardWidth }}
            >
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {canLoop && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Trước"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 grid place-items-center rounded-full bg-white border border-zinc-200 shadow-md hover:bg-zinc-50 z-10"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Tiếp"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 grid place-items-center rounded-full bg-white border border-zinc-200 shadow-md hover:bg-zinc-50 z-10"
          >
            ›
          </button>

          <div className="mt-4 flex justify-center gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (sliding.current) return;
                  sliding.current = true;
                  setAnimate(true);
                  setIndex(i);
                }}
                aria-label={`Chuyển đến phản hồi ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeDot
                    ? "bg-[var(--color-brand)] w-6"
                    : "bg-zinc-300 w-2"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
