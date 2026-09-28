import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { siteInfo } from "@/data/site-info";
import { siteUrl } from "@/lib/site-url";
import { jsonLdString, venueJsonLd } from "@/lib/jsonld";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Enoteca Ombra — Italian wine bar in Maastricht", template: "%s · Enoteca Ombra" },
  description: siteInfo.description,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: siteInfo.name,
    title: "Enoteca Ombra — Italian wine bar in Maastricht",
    description: siteInfo.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#14100D",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Reveal animations only hide content once JS is running. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(venueJsonLd()) }} />
      </head>
      <body className="min-h-screen bg-bg font-body text-ink">
        <a href="#main" className="skip-link btn btn-primary btn-sm">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <SmoothScroll />
      </body>
    </html>
  );
}
