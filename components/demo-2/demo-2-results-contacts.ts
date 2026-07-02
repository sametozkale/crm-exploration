export type Demo2TableContact = {
  name: string
  avatar: string
  starred: boolean
}

const CONTACT_NAMES = [
  "Niclas Garry",
  "Marry Collin",
  "Sarah Chen",
  "James Wilson",
  "Elena Vasquez",
  "David Park",
  "Amira Hassan",
  "Lucas Meyer",
  "Priya Shah",
  "Tom Bradley",
  "Nina Kowalski",
  "Omar Farouk",
] as const

const CONTACT_AVATARS = [
  "/demo-2/results/contacts/avatar-1.png",
  "/demo-2/results/contacts/avatar-2.png",
  "/demo-2/results/contacts/avatar-3.jpg",
  "/demo-2/results/contacts/avatar-4.jpg",
  "/demo-2/results/contacts/avatar-5.jpg",
  "/demo-2/results/contacts/avatar-6.jpg",
  "/demo-2/results/contacts/avatar-7.jpg",
  "/demo-2/results/contacts/avatar-8.jpg",
] as const

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

const TABLE_CONTACT_OVERRIDES: Record<string, Demo2TableContact> = {
  c02: {
    name: "Dario Amodei",
    avatar: "/demo-2/contact-drawer/avatar-dario.png",
    starred: false,
  },
}

/** Deterministic contact for a company row — some with green star badge, some without. */
export function getCompanyTableContact(companyId: string): Demo2TableContact {
  const override = TABLE_CONTACT_OVERRIDES[companyId]
  if (override) return override

  const seed = hashString(companyId)
  const name = CONTACT_NAMES[seed % CONTACT_NAMES.length]!
  const avatar = CONTACT_AVATARS[seed % CONTACT_AVATARS.length]!
  const starred = seed % 2 === 0

  return { name, avatar, starred }
}
