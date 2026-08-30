import Link from "next/link";

type ArrowSpec = {
  top: string;
  left: string;
  rotate: number;
  color: string;
  delay: number;
};

// Rough ring around the button — top half points down-ish toward it,
// bottom half points up-ish, positioned as a % of the button's own box
// (negative / over-100 values land outside it on every side).
const ARROWS: ArrowSpec[] = [
  { top: "-55%", left: "2%", rotate: 125, color: "var(--tt-accent-secondary)", delay: 0 },
  { top: "-85%", left: "16%", rotate: 110, color: "var(--tt-text-on-light)", delay: 0.15 },
  { top: "-95%", left: "34%", rotate: 95, color: "var(--tt-accent-primary)", delay: 0.3 },
  { top: "-90%", left: "56%", rotate: 80, color: "var(--tt-accent-secondary)", delay: 0.45 },
  { top: "-70%", left: "76%", rotate: 60, color: "var(--tt-text-on-light)", delay: 0.6 },
  { top: "-40%", left: "94%", rotate: 40, color: "var(--tt-accent-primary)", delay: 0.75 },
  { top: "120%", left: "6%", rotate: -55, color: "var(--tt-accent-primary)", delay: 0.2 },
  { top: "155%", left: "24%", rotate: -75, color: "var(--tt-text-on-light)", delay: 0.35 },
  { top: "170%", left: "48%", rotate: -100, color: "var(--tt-accent-secondary)", delay: 0.5 },
  { top: "160%", left: "70%", rotate: -120, color: "var(--tt-accent-primary)", delay: 0.65 },
  { top: "130%", left: "90%", rotate: -140, color: "var(--tt-text-on-light)", delay: 0.8 },
];

function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="30" height="14" viewBox="0 0 30 14" fill="none" aria-hidden="true">
      <path
        d="M0 7H26M26 7L18 1M26 7L18 13"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Second callout between the product row and the category links. The
 * button itself bounces (same treatment as SHOP ALL); a ring of small
 * arrows around it, each pulsing toward the button along its own pointing
 * direction, fills what was otherwise a lot of quiet space here.
 */
export function JoinTribeCta() {
  return (
    <div className="flex items-center justify-center bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_12%,var(--tt-bg-light))] px-4 py-20 sm:px-6 sm:py-28">
      <div className="relative inline-block">
        {ARROWS.map((arrow, i) => (
          <span
            key={i}
            className="absolute"
            aria-hidden="true"
            style={{ top: arrow.top, left: arrow.left, transform: `rotate(${arrow.rotate}deg)` }}
          >
            <span className="tt-arrow-nudge" style={{ animationDelay: `${arrow.delay}s` }}>
              <ArrowIcon color={arrow.color} />
            </span>
          </span>
        ))}

        <span className="tt-shop-all-bounce inline-block">
          <Link
            href="/shop"
            className="tt-bg-secondary relative z-10 inline-flex items-center gap-4 px-10 py-5 text-base font-bold tracking-[0.2em] tt-text-on-light uppercase transition-transform duration-200 hover:scale-110 hover:rotate-2 sm:gap-6 sm:px-14 sm:py-6 sm:text-lg"
          >
            <span aria-hidden="true">→</span>
            Join our queer tribe
            <span aria-hidden="true">→</span>
          </Link>
        </span>
      </div>
    </div>
  );
}
