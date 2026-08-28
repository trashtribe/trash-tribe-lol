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
        {/* Clickable hit area limited to the "JOIN THE TRIBE" pill baked
            into the artwork — positioned as a % of the image so it tracks
            the button at any viewport width. Coordinates measured from the
            source .webp (pill spans x:867-1668, y:673-783 of 2561x900). */}
        <Link
          href="/login?tab=signup"
          aria-label="Join the tribe — create an account"
          className="absolute transition-opacity hover:opacity-80"
          style={{ left: "32.5%", top: "73%", width: "34%", height: "16%" }}
        />
      </div>
    </section>
  );
}
