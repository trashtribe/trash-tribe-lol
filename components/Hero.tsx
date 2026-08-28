import Image from "next/image";
import Link from "next/link";

import { CloudBackground } from "./CloudBackground";

export function Hero() {
  return (
    <section
      className="tt-sky-bg relative w-full overflow-hidden border-b tt-border-light"
      aria-label="Featured"
    >
      <CloudBackground />
      <Link
        href="/shop"
        aria-label="Join the tribe — shop Trash Tribe"
        className="relative mx-auto block w-full max-w-[1180px] px-6 py-10 transition-transform duration-300 hover:scale-[1.015] sm:py-14"
      >
        <Image
          src="/hero-join-the-tribe.webp"
          alt="Trash Tribe — Join the tribe"
          width={2561}
          height={900}
          sizes="(max-width: 1180px) 100vw, 1180px"
          className="h-auto w-full object-contain"
          priority
        />
      </Link>
    </section>
  );
}
