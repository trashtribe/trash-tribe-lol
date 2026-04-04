import Link from "next/link";

export function WelcomeSection() {
  return (
    <section
      id="welcome"
      className="border-b border-[#111111]/10 bg-[#ffffff] px-6 py-20 sm:py-28"
      aria-labelledby="welcome-heading"
    >
      <div className="mx-auto max-w-[600px] text-center">
        <h2
          id="welcome-heading"
          className="bg-gradient-to-r from-[#f0325a] to-[#ff6b8a] bg-clip-text text-xl font-bold tracking-[0.2em] text-transparent uppercase sm:text-2xl"
        >
          Welcome
        </h2>
        <p className="mt-8 text-[13px] leading-relaxed tracking-[0.06em] text-[#444444] sm:text-[14px]">
          Trash Tribe is independent merch for people who live loud in small
          rooms. Posters, apparel, and gear — printed on demand, shipped with
          intent.
        </p>
        <p className="mt-4 text-[13px] leading-relaxed tracking-[0.06em] text-[#444444] sm:text-[14px]">
          No polish required. Just work that holds up on a wall and on the
          street.
        </p>
        <Link
          href="#shop"
          className="mt-12 inline-block bg-[#f0325a] px-10 py-4 text-[11px] font-bold tracking-[0.2em] text-[#ffffff] uppercase transition-opacity hover:opacity-90"
        >
          Explore all products
        </Link>
      </div>
    </section>
  );
}
