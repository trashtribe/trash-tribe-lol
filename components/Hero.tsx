import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <>
      {/* Mobile: the plain wordmark+star logo and the "JOIN THE TRIBE"
          button, stacked and centered — this is the version from earlier
          in this thread that got reverted when "the original" turned out
          to mean this logo, not the character-illustrated banner. Not
          forcing min-h-[100dvh] this time: that was centering these same
          two elements inside a full-viewport box, which is exactly what
          produced the big empty margins above/below that prompted this
          revert. Sized as large as the elements can go at full viewport
          width, with padding in line with the rest of the site (compare
          CategoryLinksCta's py-10/py-14), so what's left reads as normal
          section breathing room rather than a stretched gap. Hidden from
          sm: up, where the original banner below is used instead. */}
      <section
        className="relative flex w-full flex-col items-center justify-center gap-10 overflow-hidden bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_12%,var(--tt-bg-light))] px-6 py-14 sm:hidden"
        aria-label="Featured"
      >
        <Image
          src="/hero-wordmark.png"
          alt="trashtribe"
          width={4983}
          height={2266}
          sizes="90vw"
          className="h-auto w-[88vw] max-w-[520px] object-contain"
          priority
        />
        {/* Same "JOIN THE TRIBE" cutout as the desktop button, but here it's
            the only copy of the art (not an overlay sitting on top of a
            duplicate baked into a banner), so there's nothing underneath
            it that a scale/rotate could ever uncover — safe to animate the
            same way JoinTribeCta's button does. unoptimized: skips Next's
            re-encode, which introduced blur on this small, high-contrast
            PNG (black outline, flat fill, bold text) in earlier testing. */}
        <span className="tt-join-bounce inline-block w-[76vw] max-w-[400px]">
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
