import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { MotionProvider } from "@/components/motion-provider";
import { fullName, monogram, site, siteUrl } from "@/content/site";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], weight: ["800", "900"], variable: "--font-archivo", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${fullName} — ${site.roleLabel}`, template: `%s | ${fullName}` },
  description: site.tagline.replace(/\n/g, " "), alternates: { canonical: "/" },
  robots: site.placeholder ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: { type: "website", locale: "en_US", siteName: fullName, title: `${fullName} — ${site.roleLabel}`, description: site.tagline.replace(/\n/g, " ") },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0139B4" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${archivo.variable} ${inter.variable}`}><MotionProvider>
    <a className="skip-link" href="#main">Skip to content</a><Navigation monogram={monogram} /><main id="main" tabIndex={-1}>{children}</main>
    <footer className="site-footer"><div className="container footer-inner"><Link href="/#home" className="monogram" aria-label={`${monogram} — Return to home`}>{monogram}<span className="monogram-dot" /></Link><p>© {new Date().getFullYear()} {fullName}</p><Link href="/#home" className="text-link">Back to top<ArrowUpRight size={16} /></Link></div></footer>
  </MotionProvider></body></html>;
}
