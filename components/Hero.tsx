import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-background"
      aria-label="Featured"
    >
      <div className="relative w-full">
        <Image
          src="/hero-join-the-tribe.webp"
          alt="trashtribe — Join the tribe"
          width={2561}
          height={900}
          sizes="100vw"
          className="h-auto w-full object-contain"
          priority
        />
        {/* Real button, sized/positioned as a % of the image so it tracks
            at any viewport width. Its footprint fully covers the "JOIN THE
            TRIBE" pill baked into the artwork (measured at x:867-1668,
            y:673-783 of 2561x900) — same green, same spot, but now a real
            element so it can move on hover/tap and point at Shop All. */}
        <Link
          href="/shop"
          aria-label="Shop all — trashtribe"
          className="tt-bg-tribe-green absolute flex items-center justify-center rounded-full border-2 border-black text-center font-bold text-white uppercase tracking-[0.12em] shadow-[0_4px_0_rgba(0,0,0,0.35)] transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_7px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.35)]"
          style={{
            left: "32.5%",
            top: "73%",
            width: "34%",
            height: "16%",
            fontSize: "clamp(11px, 2.1vw, 26px)",
          }}
        >
          Shop All
        </Link>
      </div>
    </section>
  );
}
