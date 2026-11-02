"use client"

import Link from "next/link"
import { NavItem, navigation } from "@/config"
import { useActiveNav } from "@/hooks"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const SiteNav = () => {
  return (
    <div className="flex min-w-0 items-center">
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {navigation.items.map((item) =>
            item.items ? (
              <SiteNavItem key={item.title} {...item} />
            ) : (
              <SiteNavItemSingle key={item.title} {...item} />
            )
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const SiteNavItem = ({ title, icon, items, href, description }: NavItem) => {
  const isActive = useActiveNav(href)
  const Icon = icon

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          "bg-transparent hover:bg-white/[0.06] data-[state=open]:bg-white/[0.06] text-zinc-400 hover:text-white data-[active]:bg-transparent data-[state=open]:text-white transition-all rounded-md px-2.5 h-9 text-[10px] font-black uppercase tracking-[0.14em] gap-2 border border-transparent select-none",
          isActive && "border-cyan-300/25 bg-cyan-300/10 hover:bg-cyan-300/15 text-cyan-100 hover:text-cyan-100 shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
        )}
      >
        <Icon className={cn("size-4", isActive ? "text-primary" : "text-zinc-400 group-hover:text-white")} /> {title}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="p-6 pb-0">
          <Icon className="mr-1 inline size-4" /> {title}
          <p className="mt-2 text-sm">{description}</p>
        </div>
        <div className="grid w-[650px] grid-cols-2 p-4">
          {items?.map((item) => (
            <SiteNavListItem key={item.title} {...item} />
          ))}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

const SiteNavItemSingle = ({ title, icon, href }: NavItem) => {
  const isActive = useActiveNav(href)
  const Icon = icon

  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref prefetch={false}>
        <NavigationMenuLink
          className={cn(
            "inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200 gap-2 border border-transparent select-none",
            isActive && "border-cyan-300/25 bg-cyan-300/10 hover:bg-cyan-300/15 text-cyan-100 hover:text-cyan-100 shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
          )}
        >
          <Icon className={cn("size-4", isActive ? "text-primary" : "text-zinc-400 group-hover:text-white")} /> {title}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  )
}

const SiteNavListItem = ({ title, icon, description, href }: NavItem) => {
  const Icon = icon

  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        prefetch={false}
        className="select-none space-y-2 rounded-xl border border-transparent p-3 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-accent-foreground"
      >
        <div className="text-sm font-medium leading-none">
          <Icon className="mr-1 inline size-3" /> {title}
          {title === "Discover" && (
            <Badge className="ml-2 px-1 py-0 text-[9px] leading-normal tracking-wide">
              NEW
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {description}
        </p>
      </Link>
    </NavigationMenuLink>
  )
}

export { SiteNav }
