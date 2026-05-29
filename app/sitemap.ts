import type { MetadataRoute } from "next"
import { absoluteUrl, siteConfig } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl(siteConfig.paths.llms),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl(siteConfig.paths.llmsFull),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]
}
