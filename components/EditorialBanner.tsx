import Image from "next/image";
import Link from "next/link";

export function EditorialBanner() {
  return (
    <section
      className="relative min-h-[min(52vh,520px)] w-full overflow-hidden border-b border-white/10"
      aria-labelledby="editorial-heading"
    >
      <Image
        src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=85"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center brightness-[0.4]"
      />
      <div
        className="absolute inset-0 bg-[#0a0a0a]/50 mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent" />
      <div className="relative flex min-h-[min(52vh,520px)] flex-col justify-center px-4 py-16 sm:px-8 md:px-12 lg:px-16">
        <h2
          id="editorial-heading"
          className="max-w-xl font-display text-3xl leading-tight tracking-tight uppercase sm:text-4xl md:text-5xl"
        >
          <Link
            href="#shop"
            className="group inline-flex flex-col gap-2 text-[#f5f5f0] transition-colors hover:text-[#ff3c00]"
          >
            <span className="font-mono text-[11px] tracking-[0.35em] text-[#ff3c00] uppercase">
              Editorial
            </span>
            <span>
              Shop the Collection
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </h2>
      </div>
    </section>
  );
}
