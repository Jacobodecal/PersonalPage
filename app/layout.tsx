import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import KonamiGame from "@/components/KonamiGame";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Jacobo De Cal",
  description: "Former VC Investor and now building global B2B payments powered by stablecoins at @Lumx",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <KonamiGame />
      </body>
    </html>
  );
}
