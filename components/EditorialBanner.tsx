import Image from "next/image";
import Link from "next/link";

export function EditorialBanner() {
  return (
    <section
      className="relative min-h-[min(52vh,520px)] w-full overflow-hidden border-b border-[#111111]/10"
      aria-labelledby="editorial-heading"
    >
      <Image
        src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=85"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center brightness-[0.85]"
      />
      <div
        className="absolute inset-0 bg-white/82 backdrop-blur-[2px]"
        aria-hidden
      />
      <div className="relative flex min-h-[min(52vh,520px)] flex-col justify-center px-4 py-16 sm:px-8 md:px-12 lg:px-16">
        <h2
          id="editorial-heading"
          className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#111111] uppercase sm:text-4xl md:text-5xl"
        >
          <Link
            href="#shop"
            className="group inline-flex flex-col gap-2 text-[#111111] transition-colors hover:text-[color:var(--tt-accent)]"
          >
            <span className="font-mono text-[11px] tracking-[0.35em] text-[color:var(--tt-accent)] uppercase">
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
