"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  FileText,
  FolderKanban,
  Home,
  Command,
  Settings2,
  BookOpen,
  FileCode,
  ListTodo,
  Trash2
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { NavMain } from "@/components/ui/new-sidebar-inset/nav-main"
import { NavSecondary } from "@/components/ui/new-sidebar-inset/nav-secondary"
import { NavUser } from "@/components/ui/new-sidebar-inset/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const workspaces = useQuery(api.workspaces.getWorkspaces)
  const workspace = workspaces?.[0]

  const getNavItems = () => {
    return [
      {
        title: "Overview",
        url: "/workspace",
        icon: Home,
        isActive: pathname === "/workspace",
      },
      {
        title: "Knowledge Base",
        url: "/knowledge-base",
        icon: BookOpen,
        isActive: pathname?.startsWith("/knowledge-base") ?? false,
        items: [
          {
            title: "Documents",
            url: "/knowledge-base/documents",
            isActive: pathname === "/knowledge-base/documents",
          },
          {
            title: "Templates",
            url: workspace?._id ? `/knowledge-base/templates?workspace=${workspace._id}` : "/knowledge-base/templates",
            isActive: pathname === "/knowledge-base/templates",
          },
          {
            title: "Files",
            url: "/knowledge-base/files",
            isActive: pathname === "/knowledge-base/files",
          }
        ],
      },
      {
        title: "Work Items",
        url: "/work-items",
        icon: FolderKanban,
        isActive: pathname?.startsWith("/work-items") ?? false,
        items: [
          {
            title: "Epics",
            url: "/work-items/epics",
            isActive: pathname === "/work-items/epics",
          },
          {
            title: "Features",
            url: "/work-items/features",
            isActive: pathname === "/work-items/features",
          },
          {
            title: "Stories",
            url: "/work-items/stories",
            isActive: pathname === "/work-items/stories",
          },
          {
            title: "Tasks",
            url: "/work-items/tasks",
            isActive: pathname === "/work-items/tasks",
          }
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        isActive: pathname?.startsWith("/settings") ?? false,
        items: [
          {
            title: "Workspace",
            url: "/settings/workspace",
            isActive: pathname === "/settings/workspace",
          },
          {
            title: "Templates",
            url: "/settings/templates",
            isActive: pathname === "/settings/templates",
          },
          {
            title: "Team",
            url: "/settings/team",
            isActive: pathname === "/settings/team",
          }
        ],
      },
      {
        title: "Trash",
        url: workspace?._id ? `/trash?workspace=${workspace._id}` : "/trash",
        icon: Trash2,
        isActive: pathname === "/trash",
      },
    ]
  }

  const data = {
    user: {
      name: "User",
      email: "user@example.com",
      avatar: "/avatars/user.png",
    },
    navMain: getNavItems(),
    navSecondary: [
      {
        title: "Documentation",
        url: "https://docs.example.com",
        icon: FileCode,
        external: true
      },
      {
        title: "Roadmap",
        url: "https://roadmap.example.com",
        icon: ListTodo,
        external: true
      },
    ],
  }

  return (
    <Sidebar variant="inset" {...props} className="">
      <SidebarHeader className="">
        <SidebarMenu className="">
          <SidebarMenuItem className="">
            <SidebarMenuButton size="lg" asChild>
              <a href="/workspace">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {workspace?.name || "Workspace"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Project Workspace
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
