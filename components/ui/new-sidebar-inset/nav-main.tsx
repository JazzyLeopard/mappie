"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    defaultExpanded?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.defaultExpanded || item.isActive} className="items-center">
            <SidebarMenuItem className="items-center">
              <div
                className={cn(
                  "flex items-center justify-start w-full px-4 py-2 text-sm cursor-pointer",
                  "hover:relative hover:before:absolute hover:before:left-1 hover:before:top-1/2 hover:before:-translate-y-1/2 hover:before:h-6 hover:before:w-1 hover:before:rounded-full hover:before:bg-gradient-to-b hover:before:from-blue-400 hover:before:to-pink-400 hover:text-primary",
                  item.isActive && "font-semibold relative before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-full before:bg-gradient-to-b from-blue-400 to-pink-400 text-primary"
                )}
              >
                {item.url === "#" ? (
                  // Render without Link for Knowledge Base
                  <div className="flex items-center justify-center">
                    <item.icon
                      className={cn(
                        "h-5 w-5 mr-2",
                        "hover:[&>path]:stroke-[url(#blue-pink-gradient)]",
                        item.isActive && "[&>path]:stroke-[url(#blue-pink-gradient)]"
                      )}
                    />
                    <svg width="0" height="0">
                      <linearGradient id="blue-pink-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </svg>
                    <span>{item.title}</span>
                  </div>
                ) : (
                  // Render with Link for other items
                  <Link href={item.url} className="flex items-center justify-center">
                    <item.icon
                      className={cn(
                        "h-5 w-5 mr-2",
                        "hover:[&>path]:stroke-[url(#blue-pink-gradient)]",
                        item.isActive && "[&>path]:stroke-[url(#blue-pink-gradient)]"
                      )}
                    />
                    <svg width="0" height="0">
                      <linearGradient id="blue-pink-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </svg>
                    <span>{item.title}</span>
                  </Link>
                )}
                {item.items?.length ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="h-5 w-5 transition-transform data-[state=open]:rotate-90">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                ) : null}
              </div>
              {item.items?.length && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          variant="secondary"
                          className={cn(
                            "hover:text-primary hover:before:bg-gradient-to-b hover:before:from-blue-400 hover:before:to-pink-400",
                            subItem.isActive && "font-semibold text-primary"
                          )}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
