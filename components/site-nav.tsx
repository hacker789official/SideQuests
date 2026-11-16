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
      <NavigationMenu className="hidden 2xl:flex">
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
          "h-10 select-none gap-2 rounded-xl border border-transparent bg-transparent px-3 text-[11px] font-extrabold uppercase tracking-widest text-zinc-300 transition-all hover:bg-cyan-300/[0.08] hover:text-white data-[active]:bg-transparent data-[state=open]:bg-cyan-300/[0.08] data-[state=open]:text-white",
          isActive &&
            "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_24px_hsl(var(--primary)/0.16)] hover:bg-cyan-300/15 hover:text-cyan-100"
        )}
      >
        <Icon
          className={cn(
            "size-4",
            isActive ? "text-primary" : "group-hover:text-white text-zinc-400"
          )}
        />{" "}
        {title}
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
            "inline-flex h-10 w-max select-none items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3 text-[11px] font-extrabold uppercase tracking-widest text-zinc-300 transition-all duration-200 hover:bg-cyan-300/[0.08] hover:text-white",
            isActive &&
              "border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_24px_hsl(var(--primary)/0.16)] hover:bg-cyan-300/15 hover:text-cyan-100"
          )}
        >
          <Icon
            className={cn(
              "size-4",
              isActive ? "text-primary" : "group-hover:text-white text-zinc-400"
            )}
          />{" "}
          {title}
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
