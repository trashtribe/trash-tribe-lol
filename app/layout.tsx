import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Trash Tribe | Posters, Tees & Gear",
  description:
    "Print-on-demand posters, t-shirts, hats, and accessories. Independent artist merch—dark, loud, unpolished.",
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
