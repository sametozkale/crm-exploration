/** Static Signals tab content — Figma 148:19466. */

const SIGNALS = "/demo-2/company-drawer/signals"

export const DEMO2_COMPANY_DRAWER_SIGNALS = {
  keySignals: [
    {
      title: "Recent Mega-Round",
      description: "Raised $4.0B Series E at $60.0B valuation",
      icon: `${SIGNALS}/icon-mega-round.svg`,
      iconBg: "rgba(0, 144, 255, 0.07)",
    },
    {
      title: "Aggressive Hiring",
      description: "6 open positions across 6 departments — hiring in 4 cities",
      icon: `${SIGNALS}/icon-hiring.svg`,
      iconBg: "rgba(0, 205, 113, 0.07)",
    },
    {
      title: "Social Momentum",
      description: "LinkedIn following grew 28.5% — from 580K to 820K",
      icon: `${SIGNALS}/icon-social.svg`,
      iconBg: "rgba(105, 119, 244, 0.07)",
    },
    {
      title: "Website Traffic Surge",
      description: "Monthly visits grew from 38.2M to 95.7M — a 150% increase",
      icon: `${SIGNALS}/icon-traffic.svg`,
      iconBg: "rgba(255, 176, 58, 0.07)",
    },
  ],
  recentNews: [
    {
      image: `${SIGNALS}/news-1.png`,
      title: "How Anthropic Became the Most Disruptive Company in the World",
      source: "TIME",
      postedAgo: "3 days ago",
    },
    {
      image: `${SIGNALS}/news-2.png`,
      title: "Anthropic IPO: Everything You Need to Know About Anthropic",
      source: "MarketBeat",
      postedAgo: "2 days ago",
    },
    {
      image: `${SIGNALS}/news-3.png`,
      title: "Anthropic's existential question: Is a big ethical AI company possible?",
      source: "MarketBeat",
      postedAgo: "3 days ago",
    },
    {
      image: `${SIGNALS}/news-4.png`,
      title: "AI: Could Germany adopt Anthropic?",
      source: "DW",
      postedAgo: "3 days ago",
    },
  ],
} as const
