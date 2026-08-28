import Image from "next/image";
import Link from "next/link";

import { CloudBackground } from "./CloudBackground";

export function Hero() {
  return (
    <section
      className="tt-sky-bg relative flex min-h-[56vh] w-full items-center justify-center overflow-hidden border-b tt-border-light px-6 py-12 sm:min-h-[60vh] sm:py-16"
      aria-label="Featured"
    >
      <CloudBackground />
      <Link
        href="/shop"
        aria-label="Join the tribe — shop Trash Tribe"
        className="relative mx-auto block w-full max-w-[min(94vw,1180px)] transition-transform duration-300 hover:scale-[1.015]"
      >
        <Image
          src="/hero-join-the-tribe.webp"
          alt="Trash Tribe — Join the tribe"
          width={2561}
          height={900}
          sizes="(max-width: 1180px) 94vw, 1180px"
          className="h-auto w-full object-contain"
          priority
        />
      </Link>
    </section>
  );
}
