import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { themeInitializationScript } from "@/lib/theme";
import "./globals.css";
import "./hero-preview.css";
import "./feature-motion.css";
import "./scene-motion.css";
import "./site-scene.css";
import "./themes.css";
import "./clarity-network.css";
import "./hero-widgets.css";
import "./fingerprint.css";

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
    "A clearer financial future for Georgia. Convert is building one calm space for loans, bills, taxes, and payment deadlines. Explore the app concept and join the waitlist.",
  applicationName: "Convert",
  openGraph: {
    title: "Convert — Your whole picture. In your pocket.",
    description:
      "Loans, bills, taxes, and a little more peace of mind. A new financial companion for Georgia. Coming to iOS and Android.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ka_GE",
    siteName: "Convert",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert — Less juggling. More living.",
    description:
      "One calm space for your financial obligations. Coming soon to Georgia.",
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
  themeColor: "#f5efdf",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${georgian.variable} ${georgianAccent.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
