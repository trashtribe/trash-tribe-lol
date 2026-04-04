"use client";

export function NewsletterForm() {
  return (
    <form
      className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label htmlFor="footer-email" className="sr-only">
        Email
      </label>
      <input
        id="footer-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        className="min-h-[44px] flex-1 border border-[#111111]/20 bg-[#ffffff] px-4 text-[12px] text-[#111111] placeholder:text-[#888888] focus:outline-none focus:ring-1 focus:ring-[#f0325a]"
      />
      <button
        type="submit"
        className="min-h-[44px] bg-[#f0325a] px-6 text-[10px] font-bold tracking-[0.18em] text-[#ffffff] uppercase transition-opacity hover:opacity-90"
      >
        Join
      </button>
    </form>
  );
}
