/** SVGL routes keyed by company domain — https://svgl.app */
export type SvglLogoRoute = string | { light: string; dark: string }

export const SVGL_LOGO_BY_DOMAIN: Record<string, SvglLogoRoute> = {
  "anthropic.com": {
    light: "https://svgl.app/library/anthropic_black.svg",
    dark: "https://svgl.app/library/anthropic_white.svg",
  },
  "inflection.ai": {
    light: "https://svgl.app/library/inflectionai_light.svg",
    dark: "https://svgl.app/library/inflectionai_dark.svg",
  },
  "cohere.com": "https://svgl.app/library/cohere.svg",
  "mistral.ai": "https://svgl.app/library/mistral-ai_logo.svg",
  "perplexity.ai": "https://svgl.app/library/perplexity.svg",
  "runwayml.com": "https://svgl.app/library/runway.svg",
  "stability.ai": "https://svgl.app/library/stability-ai.svg",
  "together.ai": {
    light: "https://svgl.app/library/togetherai_light.svg",
    dark: "https://svgl.app/library/togetherai_dark.svg",
  },
  "hume.ai": "https://svgl.app/library/hume-ai.svg",
  "x.ai": {
    light: "https://svgl.app/library/xai_light.svg",
    dark: "https://svgl.app/library/xai_dark.svg",
  },
  "suno.ai": "https://svgl.app/library/suno.svg",
}

export function resolveSvglLogo(
  domain: string,
  colorScheme: "light" | "dark",
): string | null {
  const entry = SVGL_LOGO_BY_DOMAIN[domain]
  if (!entry) return null
  if (typeof entry === "string") return entry
  return colorScheme === "dark" ? entry.dark : entry.light
}
