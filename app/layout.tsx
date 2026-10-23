import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import "./themes.css";
import "./hero-preview.css";
import "./feature-motion.css";
import "./ambient-motion.css";

// Resolve the palette before paint. Only the root attribute is changed before
// hydration; the toggle uses an identical server/first-client snapshot.
const themeScript = `(() => {
  let theme;
  try { theme = localStorage.getItem('convert-theme'); } catch {}
  if (theme !== 'dark' && theme !== 'light') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#111b2c' : '#f6f8fc';
})();`;

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
const georgian = Noto_Sans_Georgian({
  variable: "--font-georgian",
  subsets: ["georgian"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
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
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};
export const viewport: Viewport = {
  themeColor: "#f6f8fc",
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
      className={`${geistSans.variable} ${geistMono.variable} ${georgian.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
