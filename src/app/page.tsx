import { Hero } from "@/components/hero";
import { SignalPortfolio } from "@/components/signal-portfolio";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/content/site";

export default function Home() {
  const site = getSite();
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.fullName,
    jobTitle: site.roleLabel,
    url: siteUrl,
    sameAs: [site.github, site.linkedin].filter(Boolean),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(person).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <SignalPortfolio />
    </>
  );
}
