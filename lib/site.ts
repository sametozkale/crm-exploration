function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

const siteUrl = getSiteUrl()

export const siteConfig = {
  name: "Zero",
  title: "Progressive Search",
  fullTitle: "Zero — Progressive Search",
  description:
    "Describe companies in natural language. Zero scans candidates, scores each match, and ranks results into tiers in real time.",
  shortDescription:
    "Interactive demo of progressive company search: natural-language prompts, live tiered scoring, and a Discarded drawer for weak matches.",
  url: siteUrl,
  locale: "en_US",
  language: "en",
  ogImage: "/icon.png",
  ogImageAlt: "Zero logo",
  icon: "/icon.png",
  keywords: [
    "Zero",
    "progressive search",
    "company search",
    "AI search",
    "startup discovery",
    "candidate ranking",
    "natural language search",
    "tiered results",
  ],
  repository:
    "https://github.com/sametozkale/progressive-search",
  author: {
    name: "Samet Özkale",
    url: "https://github.com/sametozkale",
  },
  /** Paths served at site root for crawlers and LLMs */
  paths: {
    llms: "/llms.txt",
    llmsFull: "/llms-full.txt",
    robots: "/robots.txt",
    sitemap: "/sitemap.xml",
    manifest: "/manifest.webmanifest",
  },
} as const

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}
