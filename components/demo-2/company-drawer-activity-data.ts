/** Static Activity tab content — Figma 147:25752. */

const ACTIVITY = "/demo-2/company-drawer/activity"

export const DEMO2_COMPANY_DRAWER_ACTIVITY = {
  linkedInFollowers: {
    totalLabel: "820K followers",
    period: "in last 6 months",
    growthBadge: "+29%",
    dataPoints: [
      { month: "Jan", value: 635000 },
      { month: "Feb", value: 648000 },
      { month: "Mar", value: 662000 },
      { month: "Apr", value: 678000 },
      { month: "May", value: 745000 },
      { month: "Jun", value: 820000 },
    ],
  },
  recentPosts: [
    {
      body: "New research: Constitutional AI — training language models to be helpful and harmless without extensive human feedback labeling.",
      likes: "6,783",
      comments: "569",
      postedAgo: "3 days ago",
    },
    {
      body: "Fable 5 is back — our latest model brings stronger reasoning, longer context, and improved safety alignment for enterprise workloads.",
      likes: "1,488",
      comments: "193",
      postedAgo: "4 days ago",
    },
  ],
  openPositions: {
    count: 6,
    roles: [
      {
        title: "Research Engineer, Alignment",
        department: "Research",
        location: "San Francisco, CA",
        postedAgo: "3 days ago",
      },
      {
        title: "Senior Product Manager, Enterprise",
        department: "Product",
        location: "Remote (US)",
        postedAgo: "3 week ago",
      },
    ],
  },
  icons: {
    thumbsUp: `${ACTIVITY}/thumbs-up-icon.svg`,
    comment: `${ACTIVITY}/comment-icon.svg`,
  },
} as const
