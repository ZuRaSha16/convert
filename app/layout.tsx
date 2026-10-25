import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { themeInitializationScript } from "@/lib/theme";
import { PageScrollbar } from "@/components/page-scrollbar";
import "./globals.css";
import "./hero-preview.css";
import "./feature-motion.css";
import "./scene-motion.css";
import "./site-scene.css";
import "./themes.css";
import "./clarity-network.css";
import "./hero-widgets.css";
import "./fingerprint.css";
import "./page-scrollbar.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
const georgian = localFont({
  src: "./fonts/alk-sanet.ttf",
  variable: "--font-georgian",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
  // Keep the site's Latin typography and numbers when languages are mixed.
  declarations: [{ prop: "unicode-range", value: "U+10D0-10F0" }],
});
const georgianAccent = localFont({
  src: "./fonts/geo-dedaena.ttf",
  variable: "--font-georgian-accent",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://convert-ten-roan.vercel.app"),
  title: "Convert — Less juggling. More living.",
  description:
    "Your loans, bills, taxes, and everything in between. Finally, one place to make sense of it all.",
  applicationName: "Convert",
  openGraph: {
    title: "Convert — Less juggling. More living.",
    description:
      "Your loans, bills, taxes, and everything in between. Finally, one place to make sense of it all.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ka_GE",
    siteName: "Convert",
    images: [{ url: "/social/convert-hero-dark.png", width: 1200, height: 630, alt: "Convert — Less juggling. More living. The dark landing page with the app preview." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert — Less juggling. More living.",
    description:
      "Your loans, bills, taxes, and everything in between. Finally, one place to make sense of it all.",
    images: [{ url: "/social/convert-hero-dark.png", width: 1200, height: 630, alt: "Convert — Less juggling. More living. The dark landing page with the app preview." }],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
export const viewport: Viewport = {
  themeColor: "#111b2c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${georgian.variable} ${georgianAccent.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>{children}<PageScrollbar /></body>
    </html>
  );
}
