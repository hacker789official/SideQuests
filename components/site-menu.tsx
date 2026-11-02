"use client"

import Link from "next/link"
import { NavItem, navigation } from "@/config"
import { useDialog } from "@/hooks"
import { MenuIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"

export const SiteMenu = () => {
  const [open, setOpen] = useDialog()

  return (
    <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button size="icon" variant="outline" className="size-10 rounded-md border-cyan-300/20 bg-white/[0.04] text-zinc-300 shadow-[0_0_18px_hsl(var(--primary)/0.08)] hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-cyan-100 transition-all">
          <MenuIcon className="size-4" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="border-cyan-300/15 bg-zinc-950/98 pb-6">
        <DrawerHeader className="px-5 pb-3 pt-5 text-left">
          <DrawerTitle className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">SideQuests Menu</DrawerTitle>
        </DrawerHeader>

        <Accordion type="multiple" className="space-y-1 px-3">
          {navigation.items.map((item) =>
            item.items ? (
              <MultipleMenuItem key={item.title} {...item} />
            ) : (
              <MenuItem key={item.title} {...item} />
            )
          )}
        </Accordion>

        <Separator className="mt-4" />
      </DrawerContent>
    </Drawer>
  )
}

const MenuItem = ({ title, href, icon: Icon }: NavItem) => {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "min-h-12 w-full justify-between rounded-md px-4 text-sm font-bold uppercase tracking-[0.08em] text-zinc-300 hover:bg-cyan-300/10 hover:text-cyan-100 hover:no-underline"
      )}
    >
      <div className={cn("flex items-center justify-start")}>
        <Icon className="mr-2 size-4" />
        {title}
      </div>
    </Link>
  )
}

const MultipleMenuItem = ({ title, items, icon: Icon }: NavItem) => {
  return (
    <AccordionItem className="border-b-0" value={title}>
      <AccordionTrigger
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "min-h-12 w-full justify-between rounded-md px-4 text-sm font-bold uppercase tracking-[0.08em] text-zinc-300 hover:bg-cyan-300/10 hover:text-cyan-100 hover:no-underline"
        )}
      >
        <div className={cn("flex items-center justify-start")}>
          <Icon className="mr-2 size-4" />
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="border-l border-cyan-300/20 pl-3">
        {items?.map((item) => (
          <MenuItem key={item.title} {...item} />
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}
