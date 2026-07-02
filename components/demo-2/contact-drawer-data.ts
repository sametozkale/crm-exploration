/** Contact drawer profiles — Figma 300:26016 (demo; keyed by company row id). */

import { DEMO2_COMPANIES } from "./demo-2-data"
import { getCompanyTableContact } from "./demo-2-results-contacts"

const DRAWER = "/demo-2/contact-drawer"
const COMPANY_DRAWER = "/demo-2/company-drawer"

export type ContactDrawerTab = "Overview" | "Experience" | "Similar profiles"

const DRAWER_TABS = [
  "Overview",
  "Experience",
  "Similar profiles",
] as const satisfies readonly ContactDrawerTab[]

export type ContactDrawerProfile = {
  contactKey: string
  name: string
  avatar: string
  role: string
  companyName: string
  companyLogo: string
  social: readonly {
    src: string
    variant: "framed" | "boxed"
    label: string
  }[]
  tabs: typeof DRAWER_TABS
  about: string
  seniority: {
    label: string
    value: string
    subtitle: string
  }
  tenure: {
    label: string
    value: string
    subtitle: string
  }
  contactInfo: readonly {
    kind: "email" | "phone"
    title: string
    credits: string
    hint: string
    value: string
  }[]
  location: string
  mapImage: string
  icons: {
    role: string
    company: string
    seniority: string
    tenure: string
    mail: string
    call: string
    enrich: string
    location: string
  }
}

/** Company ids with the full Figma Dario Amodei profile (footer nav still cycles all rows). */
export const DEMO2_CONTACT_DRAWER_FEATURED_KEYS = ["c02"] as const

const SHARED_ICONS = {
  role: `${DRAWER}/icon-user-account.svg`,
  company: `${DRAWER}/icon-building.svg`,
  seniority: `${DRAWER}/icon-diamond.svg`,
  tenure: `${DRAWER}/icon-calendar.svg`,
  mail: `${DRAWER}/icon-mail.svg`,
  call: `${DRAWER}/icon-call.svg`,
  enrich: `${DRAWER}/icon-stars.svg`,
  location: `${DRAWER}/icon-location.svg`,
} as const

const SHARED_SOCIAL = [
  { src: `${COMPANY_DRAWER}/social-linkedin.svg`, variant: "framed" as const, label: "LinkedIn" },
  { src: `${COMPANY_DRAWER}/social-crunchbase-inner.svg`, variant: "boxed" as const, label: "Crunchbase" },
  { src: `${COMPANY_DRAWER}/social-x.svg`, variant: "framed" as const, label: "X" },
  { src: `${COMPANY_DRAWER}/social-github.svg`, variant: "framed" as const, label: "GitHub" },
] as const

const DARIO_DRAWER: ContactDrawerProfile = {
  contactKey: "c02",
  name: "Dario Amodei",
  avatar: `${DRAWER}/avatar-dario.png`,
  role: "CEO & Co-Founder",
  companyName: "Anthropic",
  companyLogo: `${COMPANY_DRAWER}/anthropic-logo.png`,
  social: SHARED_SOCIAL,
  tabs: DRAWER_TABS,
  about:
    "Dario Amodei is an AI researcher and entrepreneur. He co-founded Anthropic in 2021 after leading the GPT-3 and reinforcement learning teams at OpenAI. He holds a PhD in biophysics from Princeton and focuses on AI safety and alignment research.",
  seniority: {
    label: "SENIORITY",
    value: "C-Level",
    subtitle: "Co-founder as well",
  },
  tenure: {
    label: "TENURE",
    value: "4 years 6 months",
    subtitle: "Since Jan 2021",
  },
  contactInfo: [
    {
      kind: "email",
      title: "Get email address",
      credits: "1 credit",
      hint: "Click enrich to see",
      value: "dario@anthropic.com",
    },
    {
      kind: "phone",
      title: "Get phone number",
      credits: "0.5 credit",
      hint: "Click enrich to see",
      value: "+1 (415) 555-0142",
    },
  ],
  location: "San Francisco, US",
  mapImage: `${DRAWER}/location-map.png`,
  icons: SHARED_ICONS,
}

const CONTACT_DRAWER_PROFILES: Record<
  (typeof DEMO2_CONTACT_DRAWER_FEATURED_KEYS)[number],
  ContactDrawerProfile
> = {
  c02: DARIO_DRAWER,
}

export function getContactKeyForCompany(companyId: string): string {
  return companyId
}

export function hasContactDrawerProfile(contactKey: string): boolean {
  return DEMO2_COMPANIES.some((company) => company.id === contactKey)
}

function buildFallbackProfile(contactKey: string): ContactDrawerProfile {
  const company = DEMO2_COMPANIES.find((item) => item.id === contactKey)
  const tableContact = getCompanyTableContact(contactKey)

  return {
    contactKey,
    name: tableContact.name,
    avatar: tableContact.avatar,
    role: "Executive",
    companyName: company?.name ?? "Company",
    companyLogo:
      company?.logoUrl ??
      (company?.domain
        ? `https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`
        : `${COMPANY_DRAWER}/anthropic-logo.png`),
    social: SHARED_SOCIAL,
    tabs: DRAWER_TABS,
    about: company?.description
      ? `${tableContact.name} is a key contact at ${company.name}. ${company.description}`
      : `${tableContact.name} is a key contact at ${company?.name ?? "this company"}.`,
    seniority: {
      label: "SENIORITY",
      value: "Director+",
      subtitle: "Leadership team",
    },
    tenure: {
      label: "TENURE",
      value: "2 years 4 months",
      subtitle: "Current role",
    },
    contactInfo: [
      {
        kind: "email",
        title: "Get email address",
        credits: "1 credit",
        hint: "Click enrich to see",
        value: `${tableContact.name.toLowerCase().replace(/\s+/g, ".")}@${company?.domain ?? "company.com"}`,
      },
      {
        kind: "phone",
        title: "Get phone number",
        credits: "0.5 credit",
        hint: "Click enrich to see",
        value: "+1 (415) 555-0198",
      },
    ],
    location: company?.location ?? "San Francisco, US",
    mapImage: `${DRAWER}/location-map.png`,
    icons: SHARED_ICONS,
  }
}

export function getContactDrawerProfile(contactKey: string): ContactDrawerProfile {
  if (contactKey in CONTACT_DRAWER_PROFILES) {
    return CONTACT_DRAWER_PROFILES[contactKey as (typeof DEMO2_CONTACT_DRAWER_FEATURED_KEYS)[number]]
  }
  return buildFallbackProfile(contactKey)
}

export function getDrawerNavigableContactKeysInTableOrder(tableCompanyIds: readonly string[]) {
  const valid = new Set(DEMO2_COMPANIES.map((company) => company.id))
  return tableCompanyIds.filter((id) => valid.has(id))
}
