/** Static People tab content — Figma 147:18982, 279:32904. */

const PEOPLE = "/demo-2/company-drawer/people"

export const DEMO2_COMPANY_DRAWER_PEOPLE = {
  bestMatchContacts: [
    {
      id: "samet",
      name: "Samet Özkale",
      location: "San Francisco, US",
      avatar: `${PEOPLE}/contact-samet.jpg`,
      badge: "Key Decision Maker",
      role: "Head of Research",
      tenure: "for 3 years",
    },
    {
      id: "sally",
      name: "Sally McCarthy",
      location: "Seattle, US",
      avatar: `${PEOPLE}/contact-sally.jpg`,
      role: "VP of Product",
      tenure: "for 2 years",
    },
    {
      id: "alex",
      name: "Alex Richardhill",
      location: "San Francisco, US",
      avatar: `${PEOPLE}/contact-alex.jpg`,
      role: "AI Researcher",
      tenure: "for 1 years",
    },
  ],
  icons: {
    userStar: `${PEOPLE}/icon-user-star.svg`,
    userAccount: `${PEOPLE}/icon-user-account.svg`,
    userRemove: `${PEOPLE}/icon-user-remove.svg`,
    menuUserStar: `${PEOPLE}/icon-menu-user-star.svg`,
    menuMail: `${PEOPLE}/icon-menu-mail.svg`,
    menuCall: `${PEOPLE}/icon-menu-call.svg`,
    menuUserRemove: `${PEOPLE}/icon-menu-user-remove.svg`,
    add: `${PEOPLE}/icon-add.svg`,
    mail: `${PEOPLE}/icon-mail.svg`,
    call: `${PEOPLE}/icon-call.svg`,
    more: `${PEOPLE}/icon-more.svg`,
  },
  teamComposition: {
    legend: [
      { label: "Engineering", color: "#0090ff", count: 473, percent: "45%" },
      { label: "Research", color: "#8b5cf6", count: 231, percent: "22%" },
      { label: "Operations", color: "#00cd71", count: 126, percent: "12%" },
      { label: "Sales & GTM", color: "#f59e0b", count: 105, percent: "10%" },
      { label: "Policy & Safety", color: "#ec4899", count: 84, percent: "8%" },
      { label: "Other", color: "#969696", count: 31, percent: "3%" },
    ],
  },
  employeeGrowth: {
    totalEmployees: "1050 employees",
    period: "in last 6 months",
    growthBadge: "+148%",
    dataPoints: [
      { month: "Jan", employees: 423 },
      { month: "Feb", employees: 428 },
      { month: "Mar", employees: 425 },
      { month: "Apr", employees: 435 },
      { month: "May", employees: 720 },
      { month: "Jun", employees: 1050 },
    ],
  },
  recentHires: [
    {
      name: "Samet Özkale",
      location: "San Francisco, CA",
      avatar: `${PEOPLE}/hire-avatar-1.jpg`,
      company: "OpenAI",
      companyIcon: `${PEOPLE}/company-building.svg`,
      hiredAgo: "3 days ago",
    },
    {
      name: "Maya Chen",
      location: "London, UK",
      avatar: "/demo-2/results/contacts/avatar-4.jpg",
      company: "DeepMind",
      companyIcon: `${PEOPLE}/company-building.svg`,
      hiredAgo: "2 weeks ago",
    },
    {
      name: "James Okonkwo",
      location: "New York, NY",
      avatar: "/demo-2/results/contacts/avatar-6.jpg",
      company: "Google",
      companyIcon: `${PEOPLE}/company-building.svg`,
      hiredAgo: "1 month ago",
    },
  ],
} as const
