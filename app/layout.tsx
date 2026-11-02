import "@/styles/globals.css"
import { Metadata } from "next"
import { siteConfig } from "@/config"
import { GeistSans } from "geist/font/sans"
import HolyLoader from "holy-loader"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { GridBg } from "@/components/grid-bg"
import { ScrollTop } from "@/components/scroll-top"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { DynamicProviders } from "@/components/dynamic-providers"
import { AdBlockNotice } from "@/components/adblock-notice"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export const runtime = "nodejs"

export const revalidate = 604800 

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/icons/icon-192.png"],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable
        )}
      >
        <HolyLoader color="#ccc" />
          <div className="relative flex min-h-screen flex-col theme-ocean" data-sq-theme="ocean" vaul-drawer-wrapper="">
            <GridBg />
            <SiteHeader />
            <AdBlockNotice />
            <div className="relative flex-1 px-0 pb-24 pt-4 lg:pb-4">{children}</div>
            <SiteFooter />
            <MobileBottomNav />
          </div>
          <TailwindIndicator />
          <ScrollTop />
          <DynamicProviders />
        
        <Toaster />
      </body>
    </html>
  )
}
