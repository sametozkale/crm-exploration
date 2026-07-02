/** Experience tab content — Figma 317:23840. */

const DRAWER = "/demo-2/contact-drawer"

export type ContactWorkExperience = {
  id: string
  title: string
  company: string
  current?: boolean
  description?: string
  dateRange?: string
  duration?: string
}

export type ContactEducation = {
  id: string
  school: string
  degree: string
  dateRange: string
}

export type ContactDrawerExperience = {
  work: readonly ContactWorkExperience[]
  education: readonly ContactEducation[]
  icons: {
    briefcase: string
    company: string
    calendar: string
    mortarboard: string
  }
}

const SHARED_EXPERIENCE_ICONS = {
  briefcase: `${DRAWER}/icon-briefcase.svg`,
  company: `${DRAWER}/icon-building.svg`,
  calendar: `${DRAWER}/icon-calendar-experience.svg`,
  mortarboard: `${DRAWER}/icon-mortarboard.svg`,
} as const

const DARIO_EXPERIENCE: ContactDrawerExperience = {
  icons: SHARED_EXPERIENCE_ICONS,
  work: [
    {
      id: "anthropic",
      title: "CEO & Co-founder",
      company: "Anthropic",
      current: true,
      description:
        "Co-founded Anthropic to build reliable, interpretable, and steerable AI systems. Leads company strategy, research direction, and AI safety initiatives.",
      dateRange: "Jan 2021 — Present",
      duration: "4y 6m",
    },
    {
      id: "openai",
      title: "VP of Research",
      company: "OpenAI",
      description:
        "Led research teams on GPT-2, GPT-3, and reinforcement learning from human feedback (RLHF). Oversaw safety and policy research.",
      dateRange: "Jun 2018 — Jan 2021",
      duration: "2y 7m",
    },
    {
      id: "google-brain",
      title: "Research Scientist",
      company: "Google Brain",
      description:
        "Conducted deep learning research on representation learning and neural network scaling. Published work on language model training dynamics.",
      dateRange: "Aug 2014 — May 2018",
      duration: "3y 9m",
    },
    {
      id: "stanford-postdoc",
      title: "Postdoctoral Researcher",
      company: "Stanford University",
      description:
        "Researched computational neuroscience and biophysics applications of machine learning at the Stanford AI Lab.",
      dateRange: "Sep 2013 — Jul 2014",
      duration: "10m",
    },
  ],
  education: [
    {
      id: "princeton",
      school: "Princeton University",
      degree: "PhD, Biophysics",
      dateRange: "2008 — 2013",
    },
    {
      id: "stanford-bs",
      school: "Stanford University",
      degree: "BS, Physics",
      dateRange: "2004 — 2008",
    },
  ],
}

const EXPERIENCE_BY_KEY: Record<string, ContactDrawerExperience> = {
  c02: DARIO_EXPERIENCE,
}

function buildFallbackExperience(companyName: string): ContactDrawerExperience {
  return {
    icons: SHARED_EXPERIENCE_ICONS,
    work: [
      {
        id: "current",
        title: "Executive",
        company: companyName,
        current: true,
        description: `Leads strategic initiatives and cross-functional teams at ${companyName}.`,
        dateRange: "Jan 2022 — Present",
        duration: "3y 2m",
      },
      {
        id: "prior",
        title: "Director",
        company: "Previous Company",
        description:
          "Led cross-functional teams and drove strategic initiatives across product and go-to-market.",
        dateRange: "Jan 2019 — Dec 2022",
        duration: "3y 11m",
      },
    ],
    education: [
      {
        id: "school",
        school: "University",
        degree: "MBA",
        dateRange: "2010 — 2012",
      },
    ],
  }
}

export function getContactDrawerExperience(
  contactKey: string,
  companyName: string,
): ContactDrawerExperience {
  return EXPERIENCE_BY_KEY[contactKey] ?? buildFallbackExperience(companyName)
}
