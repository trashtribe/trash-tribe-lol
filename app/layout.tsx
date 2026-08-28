import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { Providers } from "@/components/Providers";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://www.trashtribe.lol";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const title = "trashtribe | Independent Merch";
const description =
  "Print-on-demand posters, t-shirts, hats and accessories. Independent merch for people who live loud.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | trashtribe",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: siteUrl,
    siteName: "trashtribe",
    title,
    description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "trashtribe — Join the tribe" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
};

// Deliberately NOT async / no data fetching here. Any dynamic fetch directly
// in the root layout forces the whole app into dynamic rendering, which made
// Next re-fetch/re-render this layout on every navigation — remounting
// AuthProvider/CartProvider/WishlistProvider and resetting their state (lost
// session on navigating away from /account, wishlist items reappearing from
// a stale local snapshot). Anything that needs live product data fetches it
// itself (leaf pages call getProducts() directly; SearchModal calls
// /api/products on demand).
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} h-full antialiased`}>
      <body
        className={`${spaceMono.className} flex min-h-full flex-col bg-background text-foreground`}
      >
        <AuthProvider>
          <Providers>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
