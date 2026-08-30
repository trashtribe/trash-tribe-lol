import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-background"
      aria-label="Featured"
    >
      {/* The source art is a very wide 2561x900 banner — at mobile widths
          that makes it a short, squat strip next to everything else on the
          page. Rendering this wrapper (image + button together, so the
          button's % position stays perfectly aligned) 2x wider than the
          viewport and re-centering it makes the hero fill roughly a third
          of the screen height on phones instead of a sliver; the section's
          own overflow-hidden clips the left/right overflow instead of
          cropping top/bottom. Checked against the source art: this crops
          in right up to the edge of the star and the corner mascot without
          cutting into either. Back to full width from sm: up, where the
          banner shape already reads fine. */}
      <div className="relative -ml-[50%] w-[200%] sm:ml-0 sm:w-full">
        <Image
          src="/hero-join-the-tribe.webp"
          alt="trashtribe — Join the tribe"
          width={2561}
          height={900}
          sizes="100vw"
          className="h-auto w-full object-contain"
          priority
        />
        {/* hero-shop-all-pill.png is a cutout of just the "JOIN THE TRIBE"
            pill (flood-filled to transparent outside its black outline —
            no rectangle, no halo, just the pill shape itself), positioned
            to sit pixel-for-pixel on top of the same pill baked into the
            full hero image below. At rest it's indistinguishable from the
            static artwork. The animation is a pure scale (transform-origin
            center, no translate), so it only ever GROWS beyond its resting
            footprint — it can never uncover anything, so there's no way for
            the static pill underneath to peek out during the transition,
            and the "TRIBE" text right above stays clear no matter how far
            it grows. Box matches the crop used to make the PNG: left
            32.5%, top 73%, width 34%, height 16% of the 2561x900 source. */}
        <Link
          href="/shop"
          aria-label="Shop all — trashtribe"
          className="group absolute block"
          style={{ left: "32.5%", top: "73%", width: "34%", height: "16%" }}
        >
          {/* unoptimized: this is a tiny (871x144) high-contrast cutout —
              black outline, flat green fill, bold white text. Next's image
              optimizer re-encodes it to WebP, and that recompression was
              introducing visible blur/pixelation around the edges. Serving
              the source PNG as-is keeps it crisp; the file's small enough
              that skipping optimization costs nothing. */}
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
  );
}
