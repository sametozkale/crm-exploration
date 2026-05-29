import type { MetadataRoute } from "next"
import { absoluteUrl, siteConfig } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const allowAll = { userAgent: "*", allow: "/" as const }

  const aiCrawlers = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "anthropic-ai",
    "Google-Extended",
    "PerplexityBot",
    "Applebot-Extended",
    "cohere-ai",
  ].map((userAgent) => ({
    userAgent,
    allow: "/" as const,
  }))

  return {
    rules: [allowAll, ...aiCrawlers],
    sitemap: absoluteUrl(siteConfig.paths.sitemap),
    host: siteConfig.url,
  }
}
