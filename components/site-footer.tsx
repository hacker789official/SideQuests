"use client"

import { ComponentProps, useEffect, useState } from "react"
import Link from "next/link"
import { navigation, siteConfig } from "@/config"

import { Icons } from "@/components/icons"
import { InstallAppButton } from "@/components/install-app-button"

export const SiteFooter: React.FC<ComponentProps<"footer">> = () => {
  const [disclaimerUrl, setDisclaimerUrl] = useState(
    siteConfig.links.disclaimer
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentSiteUrl = window.location.origin
      setDisclaimerUrl(
        siteConfig.links.disclaimer.replace(
          "{current.site.url}",
          currentSiteUrl
        )
      )
    }
  }, [])

  return (
    <footer className="relative mt-32 border-t border-t-transparent bg-background pt-16 pb-12 overflow-hidden">
      
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[4px] bg-primary/30 blur-sm rounded-full pointer-events-none" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 flex flex-col px-8 sm:px-12 md:px-16">
        
        <div className="flex flex-col md:flex-row items-start justify-center gap-10 md:gap-16 mb-12">
          
          <div className="flex flex-col gap-5 md:max-w-xs">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-primary">SideQuests</p>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Discover your next obsession, keep your place, and return to every story in style.
            </p>
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
            >
              <Icons.Tmdb className="size-3.5 fill-current" />
              This product uses the TMDB API but is not endorsed or certified
              by TMDB.
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 sm:gap-32">
            {navigation.items.slice(1).filter(item => item.title !== "People" && item.title !== "My Library").map((item) => (
              <div className="flex flex-col gap-4" key={item.title}>
                <p className="text-xs font-bold tracking-wider uppercase text-foreground border-l-2 border-primary pl-2">
                  {item.title}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {item.items?.map((subitem) => (
                    <li key={subitem.href}>
                      <Link
                        href={subitem.href}
                        prefetch={false}
                        className="inline-block text-sm text-muted-foreground hover:text-primary transition-all duration-300 ease-out hover:translate-x-1.5"
                      >
                        {subitem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full select-none overflow-visible py-4 text-center my-6 px-4">
          <h1 className="text-[10vw] md:text-[9vw] lg:text-[8vw] xl:text-[96px] font-black uppercase leading-none tracking-tighter bg-gradient-to-b from-foreground via-foreground/80 to-transparent bg-clip-text text-transparent transition-all duration-500 hover:from-primary hover:via-primary/80 hover:to-transparent select-none cursor-default font-sans">
            SideQuests
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/30">
          <div className="text-xs md:text-sm text-muted-foreground text-center sm:text-left">
            <p>
              &copy; 2026 SideQuests &mdash; Built by {""}
              <a
                href={siteConfig.author.web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-semibold hover:text-primary transition-colors duration-200"
              >
                {siteConfig.author.name}
              </a>
              . All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-bold text-primary backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/60 hover:bg-primary/10"
            >
              Contact / Credits
            </Link>
            <InstallAppButton />
            <a
              href="https://drive.usercontent.google.com/download?id=14vhX0IDju2eK14ajdBtqQqD2PMdPj5gZ&export=download&confirm=t"
              download
              className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
            >
              Download Android APK
            </a>
            <Link
              href="/status"
              className="inline-flex items-center justify-center rounded-full border border-border/60 bg-background/50 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary"
            >
              Provider status
            </Link>
            <a
              href={disclaimerUrl}
              className="inline-flex items-center justify-center rounded-full border border-border/60 bg-background/50 px-4 py-2 text-xs md:text-sm font-medium text-foreground backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
