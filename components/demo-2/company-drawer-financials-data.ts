/** Static Financials tab content — Figma 147:28446. */

const FINANCIALS = "/demo-2/company-drawer/financials"

export const DEMO2_COMPANY_DRAWER_FINANCIALS = {
  summary: {
    totalRaised: {
      label: "Total Raised",
      value: "$7.3B",
      meta: "across 6 rounds",
      icon: `${FINANCIALS}/total-raised-icon.svg`,
    },
    estRevenue: {
      label: "Est. Revenue",
      value: "$1B+",
      meta: "annual run-rate",
      icon: `${FINANCIALS}/est-revenue-icon.svg`,
    },
  },
  websiteTraffic: {
    totalLabel: "95.7M monthly visits",
    period: "in last 6 months",
    growthBadge: "+150%",
    dataPoints: [
      { month: "Jan", value: 38_300_000 },
      { month: "Feb", value: 40_100_000 },
      { month: "Mar", value: 42_500_000 },
      { month: "Apr", value: 45_800_000 },
      { month: "May", value: 68_200_000 },
      { month: "Jun", value: 95_700_000 },
    ],
    metrics: [
      { label: "Bounce Rate", value: "42.3%" },
      { label: "Pages/Visit", value: "3.8" },
      { label: "Avg Duration", value: "4m 12s" },
    ],
  },
  fundingRounds: [
    {
      name: "Series E",
      amount: "$4.0B",
      amountStyle: "primary" as const,
      date: "Mar 2024",
      valuation: "$60.0B",
      lead: "Amazon",
      latest: true,
      icon: "flash" as const,
    },
    {
      name: "Strategic",
      amount: "$2.0B",
      amountStyle: "muted" as const,
      date: "Sep 2023",
      valuation: "$30.0B",
      lead: "Google",
      icon: "dot" as const,
      dotColor: "#ccc",
    },
    {
      name: "Series D",
      amount: "$450M",
      amountStyle: "muted" as const,
      date: "May 2023",
      valuation: "$5.0B",
      lead: "Spark Capital",
      icon: "dot" as const,
      dotColor: "#ccc",
    },
    {
      name: "Series C",
      amount: "$580M",
      amountStyle: "muted" as const,
      date: "Jan 2023",
      valuation: "$3.5B",
      lead: "Fidelity",
      icon: "dot" as const,
      dotColor: "#ccc",
    },
    {
      name: "Series B",
      amount: "$124M",
      amountStyle: "muted" as const,
      date: "May 2022",
      valuation: "$1.3B",
      lead: "Coatue",
      icon: "dot" as const,
      dotColor: "#ccc",
    },
    {
      name: "Series A",
      amount: "$124M",
      amountStyle: "muted" as const,
      date: "Aug 2021",
      valuation: "$880M",
      lead: "Spark Capital",
      icon: "dot" as const,
      dotColor: "#ccc",
    },
  ],
  icons: {
    flash: `${FINANCIALS}/flash-icon.svg`,
  },
} as const
