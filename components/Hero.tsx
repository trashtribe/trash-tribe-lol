import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <>
      {/* Mobile: the real illustration (sky, both mascots, the wordmark,
          the button) — not the flat standalone logo I tried first, which
          lost the illustrated richness. hero-mobile.webp is a one-time
          static crop of the source banner (x 24%-76%, y 4%-92%) that trims
          the mostly-empty sky on the sides while keeping the full
          illustration; that alone takes it from a 2561x900 (2.85:1) strip
          down to 1331x792 (1.68:1), a much more phone-friendly shape.

          On top of that static crop, the wrapper below is zoomed to 145%
          width and centered (position:absolute + translate(-50%,-50%), so
          it centers correctly regardless of the parent's layout — see the
          note further down about why not flex). That zoom is the ceiling
          for keeping "TRASH TRIBE" and the button fully safe: the button
          sits at 16.3%-81.7% of hero-mobile.webp's width, so anything
          past ~150% starts cutting into it. The two mascots and the star,
          which already sit close to the crop's edges, are the first
          things to get trimmed by that zoom — which is the point: cut the
          decorative sides, not the wordmark or the CTA.

          min-h-[100dvh] on the section means the hero still fills the
          whole first screen on phones (rest of the page on scroll).
          Hidden from sm: up, where the original banner below is used. */}
      <section
        className="relative min-h-[100dvh] w-full overflow-hidden bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_12%,var(--tt-bg-light))] sm:hidden"
        aria-label="Featured"
      >
        <div className="absolute left-1/2 top-1/2 w-[145%] -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/hero-mobile.webp"
            alt="trashtribe — Join the tribe"
            width={1331}
            height={792}
            sizes="145vw"
            className="h-auto w-full object-contain"
            priority
          />
          {/* Same overlay technique as the desktop button below: a
              transparent-cutout copy of the pill sitting pixel-for-pixel
              on top of the same pill baked into hero-mobile.webp, so at
              rest it's indistinguishable from the static art, and the
              pure-scale hover/tap animation can only ever grow beyond its
              own footprint (never uncovers the static pill underneath).
              Box is the button's original crop box (32.5%, 73%, 34%, 16%
              of the 2561x900 source) remapped into hero-mobile.webp's own
              24%-76% / 4%-92% crop window. */}
          <Link
            href="/shop"
            aria-label="Shop all — trashtribe"
            className="group absolute block"
            style={{ left: "16.35%", top: "78.41%", width: "65.38%", height: "18.18%" }}
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
