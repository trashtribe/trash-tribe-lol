import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <>
      {/* Mobile: a purpose-built vertical composition — the wordmark+star
          logo and the "JOIN THE TRIBE" button as separate, already-
          transparent brand assets, stacked and centered — instead of
          cropping/zooming the wide desktop banner into a phone-shaped
          window. The banner is a 2561x900 landscape strip; no amount of
          CSS crop makes that read well on a portrait screen without
          either cutting into the artwork or leaving big gaps (confirmed
          after a few rounds of trying). Composing fresh from the clean
          assets sidesteps that entirely. min-h-[100dvh] means the hero
          always fills the whole first screen on phones — the rest of the
          page only appears on scroll. Background is the same soft-pink
          tint used on Contact/JoinTribeCta (not plain white, not a bold
          saturated color) — tried a fully saturated pink and lime green
          full-bleed first, but both hurt contrast (the wordmark's pink
          nearly disappeared on pink; the star and the button's green fill
          nearly disappeared on green). This tint keeps the pink/green
          artwork popping the same way it does everywhere else on the
          site. Hidden from sm: up, where the original banner below is
          used instead. */}
      <section
        className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-14 overflow-hidden bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_12%,var(--tt-bg-light))] px-6 py-12 sm:hidden"
        aria-label="Featured"
      >
        <Image
          src="/hero-wordmark.png"
          alt="trashtribe"
          width={4983}
          height={2266}
          sizes="90vw"
          className="h-auto w-[90vw] max-w-[520px] object-contain"
          priority
        />
        {/* Same "JOIN THE TRIBE" cutout as the desktop button, but here it's
            the only copy of the art (not an overlay sitting on top of a
            duplicate baked into a banner), so there's nothing underneath
            it that a scale/rotate could ever uncover — safe to animate the
            same way JoinTribeCta's button does. unoptimized: skips Next's
            re-encode, which introduced blur on this small, high-contrast
            PNG (black outline, flat fill, bold text) in earlier testing. */}
        <span className="tt-join-bounce inline-block w-[78vw] max-w-[420px]">
          <Link
            href="/shop"
            aria-label="Shop all — trashtribe"
            className="block transition-transform duration-200 hover:scale-110 hover:rotate-2"
          >
            <Image
              src="/hero-shop-all-pill.png"
              alt="Join the tribe"
              width={871}
              height={144}
              unoptimized
              className="h-auto w-full object-contain"
            />
          </Link>
        </span>
      </section>

      {/* Desktop / tablet: the original wide banner, with the button
          positioned pixel-for-pixel over the same pill baked into the
          artwork. At rest it's indistinguishable from the static art; the
          animation is a pure scale (transform-origin center, no translate)
          so it only ever grows beyond its resting footprint and can never
          uncover the static pill underneath. */}
      <section
        className="relative hidden w-full overflow-hidden bg-background sm:block"
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
          <Link
            href="/shop"
            aria-label="Shop all — trashtribe"
            className="group absolute block"
            style={{ left: "32.5%", top: "73%", width: "34%", height: "16%" }}
          >
            <Image
              src="/hero-shop-all-pill.png"
              alt=""
              fill
              unoptimized
              className="object-contain transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
