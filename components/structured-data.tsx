import { absoluteUrl, siteConfig } from "@/lib/site"

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function StructuredData() {
  const url = siteConfig.url
  const image = absoluteUrl(siteConfig.ogImage)

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: siteConfig.fullTitle,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url,
    },
  }

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    url,
    name: siteConfig.fullTitle,
    description: siteConfig.description,
    isPartOf: { "@id": `${url}/#website` },
    inLanguage: siteConfig.language,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: image,
    },
  }

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.fullTitle,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: siteConfig.shortDescription,
    url,
    image,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Natural-language company search prompt",
      "Progressive scan with tiered results (High, Medium, Low)",
      "Discarded drawer with restore",
      "Filter, sort, and keyboard navigation",
      "Light and dark themes",
    ],
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    codeRepository: siteConfig.repository,
    isAccessibleForFree: true,
  }

  return (
    <>
      <JsonLd data={webSite} />
      <JsonLd data={webPage} />
      <JsonLd data={software} />
    </>
  )
}
