const CLOUDS = [
  { top: "6%", widthVw: 30, opacityLevel: 0.9, duration: 52, delay: -6, blur: 1 },
  { top: "16%", widthVw: 16, opacityLevel: 0.7, duration: 34, delay: -20, blur: 0.5 },
  { top: "34%", widthVw: 24, opacityLevel: 0.55, duration: 66, delay: -40, blur: 2 },
  { top: "56%", widthVw: 34, opacityLevel: 0.85, duration: 58, delay: -12, blur: 1.5 },
  { top: "72%", widthVw: 18, opacityLevel: 0.6, duration: 40, delay: -28, blur: 1 },
  { top: "84%", widthVw: 26, opacityLevel: 0.75, duration: 48, delay: -34, blur: 2 },
] as const;

/**
 * Slow-drifting cloud silhouettes for the sky backdrop behind the hero /
 * about-us banner art (see .tt-sky-bg in globals.css). Purely decorative —
 * hidden from assistive tech and paused for prefers-reduced-motion.
 */
export function CloudBackground() {
  return (
    <div className="tt-cloud-layer" aria-hidden="true">
      {CLOUDS.map((cloud, i) => (
        <svg
          key={i}
          viewBox="0 0 200 100"
          className="tt-cloud"
          style={{
            top: cloud.top,
            left: 0,
            width: `${cloud.widthVw}vw`,
            minWidth: 140,
            maxWidth: 520,
            opacity: cloud.opacityLevel,
            filter: `blur(${cloud.blur}px)`,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        >
          <ellipse cx="50" cy="62" rx="42" ry="26" fill="#ffffff" />
          <ellipse cx="88" cy="44" rx="52" ry="35" fill="#ffffff" />
          <ellipse cx="138" cy="58" rx="46" ry="30" fill="#ffffff" />
          <ellipse cx="108" cy="70" rx="68" ry="22" fill="#ffffff" />
        </svg>
      ))}
    </div>
  );
}
