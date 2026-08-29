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
        {/* Back to a fully transparent hit area over the "JOIN THE TRIBE"
            pill baked into the artwork — nothing is drawn here, so there's
            no risk of it ever looking misaligned with the actual image.
            The "movement" comes from a soft glow ring + a small scale pop
            on the (still invisible) box itself, not from redrawing any
            part of the artwork. Positioned as a % of the image so it
            tracks the button at any viewport width (pill spans roughly
            x:867-1668, y:673-783 of the 2561x900 source). */}
        <Link
          href="/shop"
          aria-label="Shop all — trashtribe"
          className="absolute rounded-full transition-all duration-200 ease-out hover:scale-[1.04] hover:shadow-[0_0_0_6px_rgba(0,0,0,0.15)] active:scale-[0.97]"
          style={{ left: "32.5%", top: "73%", width: "34%", height: "16%" }}
        />
      </div>
    </section>
  );
}
