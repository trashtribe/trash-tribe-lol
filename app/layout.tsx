import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://trash-tribe.lol";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const title = "Trash Tribe | Independent Merch";
const description =
  "Print-on-demand posters, t-shirts, hats and accessories. Independent merch for people who live loud.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Trash Tribe",
  },
  description,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/tt.png", type: "image/png" }],
    apple: "/tt.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: siteUrl,
    siteName: "Trash Tribe",
    title,
    description,
    images: [{ url: "/ttt.png", alt: "Trash Tribe" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/ttt.png"],
  },
};

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
