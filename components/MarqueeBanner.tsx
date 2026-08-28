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
      role="marquee"
      aria-label={content.replace(/★/g, "").trim()}
      className={`relative flex h-11 w-full items-center overflow-hidden sm:h-14 ${bgClassName} ${textClassName}`}
    >
      <div className="tt-marquee-track" data-direction={direction}>
        {block}
        {block}
      </div>
    </div>
  );
}
