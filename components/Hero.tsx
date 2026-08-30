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
          <Image
            src="/hero-shop-all-pill.png"
            alt=""
            fill
            sizes="(max-width: 640px) 40vw, 20vw"
            className="object-contain transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95"
          />
        </Link>
      </div>
    </section>
  );
}
