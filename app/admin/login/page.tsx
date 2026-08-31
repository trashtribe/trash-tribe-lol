import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        method="POST"
        action="/api/admin/login"
        className="w-full max-w-sm border tt-border-light p-8"
      >
        <h1 className="text-lg font-bold tracking-[0.2em] tt-text-on-light uppercase">Admin</h1>

        {error ? (
          <p className="mt-3 text-[12px] font-bold tracking-[0.05em] text-red-600">
            Wrong password.
          </p>
        ) : null}

        <input type="hidden" name="next" value={next ?? "/admin/products"} />

        <label className="mt-6 block">
          <span className="text-[11px] font-bold tracking-[0.14em] tt-text-on-light uppercase">
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="mt-2 w-full border tt-border-light bg-background px-3 py-2 text-sm tt-text-on-light"
          />
        </label>

        <button
          type="submit"
          className="mt-6 w-full tt-bg-dark px-4 py-3 text-[11px] font-bold tracking-[0.2em] tt-text-primary uppercase transition-opacity hover:opacity-90"
        >
          Log in
        </button>
      </form>
    </main>
  );
}
