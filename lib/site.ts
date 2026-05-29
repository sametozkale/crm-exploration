function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export const siteConfig = {
  name: "Zero",
  title: "Progressive Search",
  fullTitle: "Zero — Progressive Search",
  description:
    "Describe companies in natural language. Zero scans candidates, scores each match, and ranks results into tiers in real time.",
  url: getSiteUrl(),
  ogImage: "/icon.png",
  locale: "en_US",
  keywords: [
    "Zero",
    "progressive search",
    "company search",
    "AI search",
    "startup discovery",
    "candidate ranking",
  ],
} as const
