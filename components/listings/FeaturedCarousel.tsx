"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ListingSummary } from "@/types/listing";
import ListingCard from "./ListingCard";

type Item = ListingSummary & { legalStatus?: string | null };

const AUTOPLAY_MS = 3000;

function computeVisible(): number {
  if (typeof window === "undefined") return 3;
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

export default function FeaturedCarousel({ items }: { items: Item[] }) {
  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  // Prevents index from going out-of-bounds when buttons are clicked rapidly.
  // Using a ref (not state) so the guard is synchronous within the same event tick.
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

  // Append the first `visible` items at the end so the strip can scroll past
  // the last real item and still display a full row. When the transition lands
  // on the clone group (index === items.length), we snap back to 0 without
  // animation — visually identical, so the loop is seamless.
  const extended = useMemo(
    () => (canLoop ? [...items, ...items.slice(0, visible)] : items),
    [items, visible, canLoop],
  );

  // Re-enable animation after a no-transition snap-back. Two rAFs ensure the
  // browser commits the snapped position before transition flips back on.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimate(true)),
    );
    return () => cancelAnimationFrame(id);
  }, [animate]);

  // If the viewport changes such that scrolling is no longer useful, reset.
  useEffect(() => {
    if (!canLoop) {
      setIndex(0);
      setAnimate(true);
    }
  }, [canLoop]);

  useEffect(() => {
    if (paused || !canLoop) return;
    const id = setInterval(() => {
      if (sliding.current) return; // skip this tick if a slide is in progress
      sliding.current = true;
      setAnimate(true);
      setIndex((i) => i + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, canLoop]);

  function onTransitionEnd() {
    // Always release the lock first so the next action can proceed.
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
      // Snap (no transition) to the clone position, then animate back one
      // step. Same visual content, so the jump is invisible.
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

  if (items.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center text-zinc-500">
        Chưa có tin nổi bật nào. Đăng nhập trang Admin để đánh dấu Featured.
      </div>
    );
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
          className={`flex ${animate ? "transition-transform duration-500 ease-out" : ""}`}
          style={{ transform: `translateX(-${index * (100 / visible)}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((l, i) => (
            <div
              key={`${l.id}-${i}`}
              className="shrink-0 px-2"
              style={{ width: cardWidth }}
            >
              <ListingCard listing={l} variant="grid" />
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

          <div className="mt-3 flex justify-center gap-1">
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
                aria-label={`Chuyển đến tin ${i + 1}`}
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
