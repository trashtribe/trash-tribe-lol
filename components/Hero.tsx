import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative min-h-[100dvh] w-full overflow-hidden bg-background sm:min-h-0"
      aria-label="Featured"
    >
      {/* The source art is a very wide 2561x900 banner — at mobile widths
          that makes it a short, squat strip next to everything else on the
          page. The section itself is locked to min-h-[100dvh], so the hero
          always fills the whole first screen on phones (everything else —
          the rest of the page — only shows up on scroll), with the
          leftover height above/below the art filled by the page background
          instead of stretching or cropping the art.

          Within that, the wrapper (image + button together, so the
          button's % position stays perfectly aligned) is rendered 2.6x
          wider than the viewport and centered with position:absolute +
          translate(-50%, -50%) on BOTH axes — not flex/grid alignment.
          A flex `items-center` here fights with the wrapper's own
          horizontal centering math and double-shifts it (that's what
          produced the earlier cropped/off-center button); an absolute
          top:50%/left:50% + translate is unaffected by the parent's
          layout mode, so it centers correctly no matter what.

          2.6x is the measured ceiling: checked the actual opaque pixels of
          the "JOIN THE TRIBE" pill cutout and it spans ~33.6%-65.4% of the
          source image width, so cropping in any further would start
          cutting into the button itself — this keeps a comfortable margin
          on both sides. Back to full width/static position from sm: up,
          where the banner shape already reads fine and the section
          shouldn't be forced full-height. */}
      <div className="absolute left-1/2 top-1/2 w-[260%] -translate-x-1/2 -translate-y-1/2 sm:static sm:left-auto sm:top-auto sm:w-full sm:translate-x-0 sm:translate-y-0">
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
