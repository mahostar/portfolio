import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { MotionProvider } from "@/components/motion-provider";
import { PortfolioMotion } from "@/components/portfolio-motion";
import { WelcomeScreen } from "@/components/welcome-screen";
import { GlassLab } from "@/components/glass-lab";
import { fullName, monogram, site, siteUrl } from "@/content/site";
import "./globals.css";
import "./motion-design.css";
import "./refinement.css";
import "./pcb-motion.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-archivo",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
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
        <script async src="/welcome-startup.js" fetchPriority="high" />
      </head>
      <body className={`${archivo.variable} ${inter.variable}`}>
        <MotionProvider>
          <WelcomeScreen name={fullName} />
          <PortfolioMotion />
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Navigation monogram={monogram} name={`${site.firstName} ${site.lastName}`} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          {process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_GLASS_LAB === "1" && <GlassLab />}
        </MotionProvider>
      </body>
    </html>
  );
}
