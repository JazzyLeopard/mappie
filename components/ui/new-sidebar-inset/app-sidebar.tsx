"use client"

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
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import {
  BookOpen,
  Command,
  FileCode,
  FolderKanban,
  Home,
  ListTodo,
  Settings2,
  Trash2
} from "lucide-react"
import Link from 'next/link'
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { useEffect, useState } from "react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const workspaces = useQuery(api.workspaces.getWorkspaces)
  const [selectedWorkspace, setSelectedWorkspace] = useState<String | null>(null)

  const currentWorkspace = useQuery(api.workspaces.getWorkspaceById,
    selectedWorkspace ? { workspaceId: selectedWorkspace as Id<"workspaces"> } : "skip"
  )

  useEffect(() => {
    const updateSelectedProject = () => {
      const pathParts = pathname?.split('/') || [];
      const workspaceIdFromUrl = pathParts[pathParts.indexOf('w') + 1];

      if (workspaceIdFromUrl && workspaces) {
        const matchingWorkspace = workspaces.find((w: any) => w._id === workspaceIdFromUrl);
        if (matchingWorkspace) {
          setSelectedWorkspace(matchingWorkspace._id);
        }
      } else if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(workspaces[0]._id);
      }
    };

    updateSelectedProject();
  }, [workspaces, pathname]);

  useEffect(() => {
    router.refresh();
  }, [pathname]);

  const getNavItems = () => {
    // Convert currentWorkspace to string if it exists
    const workspaceIdString = currentWorkspace ? String(currentWorkspace._id) : '';

    return [
      {
        title: "Overview",
        url: `/w/${workspaceIdString}`,
        icon: Home,
        isActive: pathname === `/w/${workspaceIdString}`,
      },
      {
        title: "Knowledge Base",
        url: workspaceIdString ? `/w/${workspaceIdString}/knowledge-base` : "/w",
        icon: BookOpen,
        isActive: pathname?.startsWith(`/w/${workspaceIdString}/knowledge-base`) ?? false,
        items: [
          {
            title: "Documents",
            url: workspaceIdString ? `/w/${workspaceIdString}/knowledge-base/documents` : "/w",
            isActive: pathname === `/w/${workspaceIdString}/knowledge-base/documents`,
          },
          {
            title: "Templates",
            url: workspaceIdString ? `/w/${workspaceIdString}/knowledge-base/templates/#system` : "/w",
            isActive: pathname === `/w/${workspaceIdString}/knowledge-base/templates/#system`,
          },
          {
            title: "Files",
            url: workspaceIdString ? `/w/${workspaceIdString}/knowledge-base/files` : "/w",
            isActive: pathname === `/w/${workspaceIdString}/knowledge-base/files`,
          }
        ],
      },
      {
        title: "Work Items",
        url: `/w/${workspaceIdString}/work-items`,
        icon: FolderKanban,
        isActive: pathname?.startsWith(`/w/${workspaceIdString}/work-items`) ?? false,
      },
      {
        title: "Settings",
        url: `/w/${workspaceIdString}/settings`,
        icon: Settings2,
        isActive: pathname?.startsWith(`/w/${workspaceIdString}/settings`) ?? false,
        items: [
          {
            title: "Workspace",
            url: `/w/${workspaceIdString}/settings/workspace`,
            isActive: pathname === `/w/${workspaceIdString}/settings/workspace`,
          },
          {
            title: "Templates",
            url: `/w/${workspaceIdString}/settings/templates`,
            isActive: pathname === `/w/${workspaceIdString}/settings/templates`,
          },
          {
            title: "Team",
            url: `/w/${workspaceIdString}/settings/team`,
            isActive: pathname === `/w/${workspaceIdString}/settings/team`,
          }
        ],
      },
      {
        title: "Trash",
        url: workspaceIdString ? `/w/${workspaceIdString}/trash` : "/trash",
        icon: Trash2,
        isActive: pathname === `/w/${workspaceIdString}/trash`,
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
              <Link href="/w">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentWorkspace?.name || "Workspace"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Project Workspace
                  </span>
                </div>
              </Link>
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
