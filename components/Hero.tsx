import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background sm:block sm:min-h-0"
      aria-label="Featured"
    >
      {/* The source art is a very wide 2561x900 banner — at mobile widths
          that makes it a short, squat strip next to everything else on the
          page. The section itself is locked to min-h-[100dvh] and centers
          its content, so the hero always fills the whole first screen on
          phones (everything else — the rest of the page — only shows up on
          scroll), with the leftover height above/below the art filled by
          the page background instead of stretching or cropping the art.
          Within that, the wrapper (image + button together, so the
          button's % position stays perfectly aligned) is rendered 2.6x
          wider than the viewport and re-centered; the section's
          overflow-hidden clips the left/right overflow. 2.6x is the
          measured ceiling: checked the actual opaque pixels of the "JOIN
          THE TRIBE" pill cutout and it spans ~33.6%-65.4% of the source
          image width, so cropping in any further would start cutting into
          the button itself — this keeps a comfortable margin on both
          sides. Back to full width from sm: up, where the banner shape
          already reads fine and the section shouldn't be forced full-height. */}
      <div className="relative -ml-[80%] w-[260%] sm:ml-0 sm:w-full">
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
