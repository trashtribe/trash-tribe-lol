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
        className="min-h-[44px] flex-1 border border-[color:color-mix(in_srgb,#111111_20%,transparent)] bg-background px-4 text-[12px] text-[#111111] placeholder:text-[color:color-mix(in_srgb,#111111_45%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--tt-accent)_45%,transparent)]"
      />
      <button
        type="submit"
        className="tt-bg-accent min-h-[44px] px-6 text-[10px] font-bold tracking-[0.18em] text-[#111111] uppercase transition-opacity hover:opacity-90"
      >
        Join
      </button>
    </form>
  );
}
