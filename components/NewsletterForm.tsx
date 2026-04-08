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
        className="min-h-[44px] flex-1 border tt-border-light bg-[color:var(--tt-bg-light)] px-4 text-[12px] tt-text-on-light placeholder:text-[color:color-mix(in_srgb,var(--tt-text-on-light)_45%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--tt-accent-secondary)]"
      />
      <button type="submit" className="tt-bg-primary min-h-[44px] px-6 text-[10px] font-bold tracking-[0.18em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary">
        Join
      </button>
    </form>
  );
}
