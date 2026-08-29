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
        {/* Same "JOIN THE TRIBE" artwork as always — nothing about how it
            looks changes. This renders that exact crop of the source image
            a second time as its own element (via a background-image, sized
            and positioned with the math below to line up pixel-for-pixel
            with the pill baked into the full hero image underneath), so it
            can move independently on hover/tap while pointing at Shop All
            instead of signup. Crop window: x:832-1703, y:657-801 of
            2561x900 (left 32.5%, top 73%, width 34%, height 16%). */}
        <Link
          href="/shop"
          aria-label="Shop all — trashtribe"
          className="absolute block bg-no-repeat transition-transform duration-200 ease-out hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.98]"
          style={{
            left: "32.5%",
            top: "73%",
            width: "34%",
            height: "16%",
            backgroundImage: "url(/hero-join-the-tribe.webp)",
            backgroundSize: "294.1176% auto",
            backgroundPosition: "49.2424% 86.9048%",
          }}
        />
      </div>
    </section>
  );
}
