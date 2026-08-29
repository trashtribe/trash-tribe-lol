"use client";

import { useEffect, useRef, useState } from "react";

type MarqueeBannerProps = {
  /** Repeating unit, e.g. "SHOP NOW ★". Repeated back-to-back to fill the track. */
  content: string;
  /** Background utility class, e.g. "tt-bg-dark" or "tt-bg-secondary". */
  bgClassName: string;
  /** Text color utility class, e.g. "tt-text-primary" or "tt-text-on-light". */
  textClassName: string;
  direction: "left" | "right";
  /** How many times `content` repeats within one half of the track. */
  repeat?: number;
};

/**
 * Full-bleed animated ticker. Renders two identical, wide blocks of
 * repeated content side by side and slides the track exactly one block's
 * width (-50%) in an infinite linear loop, so the wraparound is seamless.
 */
export function MarqueeBanner({
  content,
  bgClassName,
  textClassName,
  direction,
  repeat = 8,
}: MarqueeBannerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Default to visible so there's no flash-of-stopped-animation before the
  // observer's first callback (banners are near the top of the page and
  // almost always in view on first paint anyway).
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Two infinite animated tracks running continuously, whatever else is
    // on the page, add up to a steady stream of compositor work. Pausing
    // them once they've scrolled well out of view (generous rootMargin so
    // there's no visible pop when they resume) cuts that load down to only
    // when they're actually on screen.
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const block = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {Array.from({ length: repeat }).map((_, i) => (
        <span
          key={i}
          className="whitespace-nowrap px-3 text-[13px] font-bold tracking-[0.2em] uppercase sm:text-[15px]"
        >
          {content}
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={rootRef}
      role="marquee"
      aria-label={content.replace(/★/g, "").trim()}
      className={`relative flex h-11 w-full items-center overflow-hidden sm:h-14 ${bgClassName} ${textClassName}`}
    >
      <div className="tt-marquee-track" data-direction={direction} data-paused={!inView}>
        {block}
        {block}
      </div>
    </div>
  );
}
