import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { MotionSwitch } from "@/components/motion-switch";
import { PortfolioMotion } from "@/components/portfolio-motion";
import { fullName, monogram, site, siteUrl } from "@/content/site";
import "./tokens.css";
import "./globals.css";
import heroStyles from "@/components/hero.module.css";
import navStyles from "@/components/nav.module.css";
import cardStyles from "@/components/cards.module.css";
import sectionStyles from "@/components/sections.module.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${fullName} — ${site.roleLabel}`, template: `%s | ${fullName}` },
  description: site.tagline.replace(/\n/g, " "),
  alternates: { canonical: "/" },
  robots: site.placeholder
    ? { index: false, follow: false }
    : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: fullName,
    title: `${fullName} — ${site.roleLabel}`,
    description: site.tagline.replace(/\n/g, " "),
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0139B4",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('portfolio-motion')==='paused'?'paused':'running'}catch{document.documentElement.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'paused':'running'}`,
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${inter.variable} ${mono.variable} ${heroStyles.scope} ${navStyles.scope} ${cardStyles.scope} ${sectionStyles.scope}`}
      >
        <MotionSwitch />
        <PortfolioMotion />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation monogram={monogram} name={`${site.firstName} ${site.lastName}`} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
