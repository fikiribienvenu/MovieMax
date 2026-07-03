// src/app/layout.tsx
import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IWACUFLIX — Your Premium Movie Destination",
  description:
    "Stream thousands of movies in 4K Ultra HD. Watch trailers, subscribe for full access, and enjoy premium cinema from home.",
  keywords: "movies, streaming, cinema, 4K, IWACUFLIX",
  openGraph: {
    title: "IWACUFLIX — Your Premium Movie Destination",
    description: "Stream thousands of movies in 4K Ultra HD.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${bebasNeue.variable} ${dmSans.variable} font-body bg-bg-primary text-text-primary antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
