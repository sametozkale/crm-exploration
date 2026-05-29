import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeColorMeta } from "@/components/theme-color-meta"
import { Toaster } from "@/components/ui/sonner"
import { StructuredData } from "@/components/structured-data"
import { absoluteUrl, siteConfig } from "@/lib/site"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fullTitle,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  keywords: [...siteConfig.keywords],
  icons: {
    icon: [{ url: siteConfig.ogImage, type: "image/png", sizes: "200x200" }],
    shortcut: siteConfig.ogImage,
    apple: siteConfig.ogImage,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.fullTitle,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 200,
        height: 200,
        alt: `${siteConfig.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteConfig.fullTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    types: {
      "text/plain": siteConfig.paths.llms,
    },
  },
  category: "technology",
  other: {
    "llms-txt": absoluteUrl(siteConfig.paths.llms),
    "llms-full-txt": absoluteUrl(siteConfig.paths.llmsFull),
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} bg-background font-inter antialiased`}
      >
        <StructuredData />
        <ThemeProvider>
          <ThemeColorMeta />
          {children}
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
