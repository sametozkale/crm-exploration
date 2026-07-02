/** Similar profiles tab content — Figma 305:20777. */

const DRAWER = "/demo-2/contact-drawer/similar"

export type SimilarProfile = {
  id: string
  name: string
  subtitle: string
  avatar: string
  matchPercent: number
}

export type ContactDrawerSimilarProfiles = {
  profiles: readonly SimilarProfile[]
}

const DARIO_SIMILAR: ContactDrawerSimilarProfiles = {
  profiles: [
    {
      id: "sam-altman",
      name: "Sam Altman",
      subtitle: "CEO at OpenAI",
      avatar: `${DRAWER}/avatar-sam-altman.jpg`,
      matchPercent: 92,
    },
    {
      id: "mira-murati",
      name: "Mira Murati",
      subtitle: "Former CTO at OpenAI",
      avatar: `${DRAWER}/avatar-mira-murati.jpg`,
      matchPercent: 85,
    },
    {
      id: "aidan-gomez",
      name: "Aidan Gomez",
      subtitle: "CEO & Co-Founder at Cohere",
      avatar: `${DRAWER}/avatar-aidan-gomez.jpg`,
      matchPercent: 72,
    },
    {
      id: "arthur-mensch",
      name: "Arthur Mensch",
      subtitle: "CEO & Co-Founder at Mistral AI",
      avatar: `${DRAWER}/avatar-arthur-mensch.jpg`,
      matchPercent: 68,
    },
  ],
}

const SIMILAR_BY_KEY: Record<string, ContactDrawerSimilarProfiles> = {
  c02: DARIO_SIMILAR,
}

function buildFallbackSimilarProfiles(contactName: string): ContactDrawerSimilarProfiles {
  return {
    profiles: [
      {
        id: "profile-1",
        name: "Alex Richardhill",
        subtitle: "AI Researcher at OpenAI",
        avatar: "/demo-2/company-drawer/people/contact-alex.jpg",
        matchPercent: 88,
      },
      {
        id: "profile-2",
        name: "Sally McCarthy",
        subtitle: "VP of Product at Stripe",
        avatar: "/demo-2/company-drawer/people/contact-sally.jpg",
        matchPercent: 81,
      },
      {
        id: "profile-3",
        name: "Samet Özkale",
        subtitle: "Head of Research at Anthropic",
        avatar: "/demo-2/company-drawer/people/contact-samet.jpg",
        matchPercent: 74,
      },
      {
        id: "profile-4",
        name: contactName === "Alex Richardhill" ? "Maya Chen" : "Priya Shah",
        subtitle: "Director at Google DeepMind",
        avatar: "/demo-2/results/contacts/avatar-3.jpg",
        matchPercent: 66,
      },
    ],
  }
}

export function getContactDrawerSimilarProfiles(
  contactKey: string,
  contactName: string,
): ContactDrawerSimilarProfiles {
  return SIMILAR_BY_KEY[contactKey] ?? buildFallbackSimilarProfiles(contactName)
}
