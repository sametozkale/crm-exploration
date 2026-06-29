import { DEMO2_ASSETS } from "./demo-2-assets"

export type Demo2Company = {
  id: string
  name: string
  industry: string
  foundedYear: number | null
  employees: number
  headcountGrowth: number
  location: string
  score: number
  website: string
  logoHue?: number
  logoUrl?: string
  description?: string
  lastFundingType?: string
}

export const DEMO2_COMPANIES: Demo2Company[] = [
  {
    id: "clearline",
    name: "Clearline",
    industry: "Software Development",
    foundedYear: null,
    employees: 5,
    headcountGrowth: 150,
    location: "Toronto, Canada",
    score: 93,
    website: "https://useclearline.com",
    logoHue: 210,
    logoUrl: DEMO2_ASSETS.companyClearline,
    description:
      "Clearline is a multiplayer AI agent platform for coding tasks that interprets customer feedback and automates the process of generating production-ready pull requests by understanding the codebase.",
    lastFundingType: "Seed",
  },
  {
    id: "riot",
    name: "Riot",
    industry: "Computer and Network Security",
    foundedYear: 2020,
    employees: 245,
    headcountGrowth: 9,
    location: "San Francisco, CA, United States",
    score: 88,
    website: "https://tryriot.com",
    logoHue: 12,
    logoUrl: DEMO2_ASSETS.companyRiot,
  },
  {
    id: "vouch",
    name: "Vouch Insurance",
    industry: "Insurance",
    foundedYear: 2018,
    employees: 145,
    headcountGrowth: 3,
    location: "San Francisco, CA, United States",
    score: 82,
    website: "http://www.vouch.us",
    logoHue: 280,
    logoUrl: DEMO2_ASSETS.companyVouch,
  },
  {
    id: "wefunder",
    name: "Wefunder",
    industry: "Technology, Information and Internet",
    foundedYear: 2011,
    employees: 138,
    headcountGrowth: 5,
    location: "Gun Barrel City, TX, United States",
    score: 79,
    website: "https://wefunder.com/",
    logoUrl: DEMO2_ASSETS.companyWefunder,
  },
  {
    id: "mandel",
    name: "Mandel AI",
    industry: "Technology, Information and Internet",
    foundedYear: 2024,
    employees: 15,
    headcountGrowth: 7,
    location: "San Francisco, CA, United States",
    score: 68,
    website: "https://mandel.ai",
    logoUrl: DEMO2_ASSETS.companyMandel,
  },
  {
    id: "keynua",
    name: "Keynua",
    industry: "Technology, Information and Internet",
    foundedYear: 2019,
    employees: 14,
    headcountGrowth: 8,
    location: "Lima, Peru",
    score: 68,
    website: "http://www.keynua.com",
    logoUrl: DEMO2_ASSETS.companyKeynua,
  },
  {
    id: "yesgraph",
    name: "YesGraph",
    industry: "Technology, Information and Internet",
    foundedYear: 2012,
    employees: 1,
    headcountGrowth: 0,
    location: "San Francisco, CA, United States",
    score: 58,
    website: "http://www.yesgraph.com",
    logoUrl: DEMO2_ASSETS.companyYesgraph,
  },
  {
    id: "powermatrix",
    name: "PowerMatrix",
    industry: "Appliances, Electrical, and Electronics Manufacturing",
    foundedYear: null,
    employees: 4,
    headcountGrowth: -20,
    location: "Cambridge, United Kingdom",
    score: 73,
    website: "https://pwrmatrix.com/",
    logoHue: 55,
    logoUrl: DEMO2_ASSETS.companyPowerMatrix,
    description:
      "PowerMatrix removes barriers to powering futuristic technologies by providing compact and efficient DC-DC power supplies for industries such as aerospace, datacenter, UAV, and UUV.",
    lastFundingType: "Pre seed",
  },
  {
    id: "mentorcam",
    name: "Mentorcam",
    industry: "Technology, Information and Internet",
    foundedYear: 2019,
    employees: 5,
    headcountGrowth: -17,
    location: "Los Angeles, CA, United States",
    score: 55,
    website: "https://mentor.cam",
    logoUrl: DEMO2_ASSETS.companyMentorcam,
  },
  {
    id: "pando",
    name: "Pando Bioscience (YC W23)",
    industry: "Biotechnology Research",
    foundedYear: 2023,
    employees: 5,
    headcountGrowth: -17,
    location: "Watertown, MA, United States",
    score: 55,
    website: "https://pando.bio",
    logoUrl: DEMO2_ASSETS.companyPando,
  },
  {
    id: "mtailor",
    name: "MTailor",
    industry: "Apparel & Fashion",
    foundedYear: 2012,
    employees: 57,
    headcountGrowth: -3,
    location: "San Francisco, CA, United States",
    score: 55,
    website: "https://mtailor.com",
    logoUrl: DEMO2_ASSETS.companyMtailor,
  },
  {
    id: "padlet",
    name: "Padlet",
    industry: "Software Development",
    foundedYear: null,
    employees: 80,
    headcountGrowth: 3,
    location: "San Francisco, CA, United States",
    score: 55,
    website: "https://padlet.com",
    logoUrl: DEMO2_ASSETS.companyPadlet,
  },
  {
    id: "monte",
    name: "Monte (YC S25)",
    industry: "Software Development",
    foundedYear: 2026,
    employees: 3,
    headcountGrowth: 0,
    location: "San Francisco, CA, United States",
    score: 55,
    website: "https://monte.ai",
    logoUrl: DEMO2_ASSETS.companyMonte,
  },
  {
    id: "pointone",
    name: "PointOne",
    industry: "Software Development",
    foundedYear: 2023,
    employees: 23,
    headcountGrowth: 77,
    location: "New York, NY, United States",
    score: 55,
    website: "https://pointone.com",
    logoUrl: DEMO2_ASSETS.companyPointone,
  },
  {
    id: "promptloop",
    name: "PromptLoop AI",
    industry: "Technology, Information and Internet",
    foundedYear: null,
    employees: 12,
    headcountGrowth: 15,
    location: "San Francisco, CA, United States",
    score: 62,
    website: "https://promptloop.com",
    logoUrl: DEMO2_ASSETS.companyPromptloop,
  },
]

export function scoreBarColors(score: number): string[] {
  const green = "#05d052"
  const yellow = "#fed047"
  const empty = "#eee"

  const filled =
    score >= 93 ? 5 : score >= 80 ? 4 : score >= 73 ? 3 : score >= 58 ? 2 : 1
  const active = score >= 80 ? green : yellow

  return Array.from({ length: 5 }, (_, i) => (i < filled ? active : empty))
}
