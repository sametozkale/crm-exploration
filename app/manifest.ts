import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.fullTitle,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#e6c200",
    lang: siteConfig.language,
    categories: ["business", "productivity"],
    icons: [
      {
        src: siteConfig.icon,
        sizes: "200x200",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
