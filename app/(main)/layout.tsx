"use client";

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useUser } from "@clerk/clerk-react";
import { redirect, usePathname } from "next/navigation";
import { AppSidebar } from "@/components/ui/new-sidebar-inset/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import AIStoryCreator from "@/ai/ai-chat";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
  const initializeTemplates = useMutation(api.templates.initializeSystemTemplates);

  useEffect(() => {
    // Initialize system templates when the main layout mounts
    initializeTemplates();
  }, [initializeTemplates]);

  const paths = pathname?.split('/').filter(Boolean) || [];
  const isDocumentPage = paths.includes('documents');
  const isWorkItemsPage = paths.includes('work-items');
  const documentId = isDocumentPage ? paths[paths.length - 1] : null;
  
  // Get work item ID from URL if we're on work items page
  const workItemId = isWorkItemsPage ? new URLSearchParams(window.location.search).get('id') : null;

  // Query for work item details if we have an ID
  const workItem = useQuery(
    api.workItems.get,
    workItemId ? { id: workItemId as Id<"workItems"> } : "skip"
  );

  // Query for parent work item if current item has a parent
  const parentWorkItem = useQuery(
    api.workItems.get,
    workItem?.parentId ? { id: workItem.parentId as Id<"workItems"> } : "skip"
  );

  // Only query if documentId is a valid Convex ID
  const document = useQuery(
    api.documents.getDocumentById, 
    documentId && documentId.startsWith("k") ? 
      { documentId: documentId as Id<"knowledgeBase"> } : 
      "skip"
  );

  // Generate breadcrumb items based on pathname and work item hierarchy
  const getBreadcrumbs = () => {
    const breadcrumbs = paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      let label = path;
      
      // Format the label
      label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const isLast = index === paths.length - 1;
      
      return {
        label,
        url,
        isLast
      };
    });

    // If we're on work items page and have a selected item
    if (isWorkItemsPage && workItem) {
      // Keep only the "Work Items" breadcrumb and modify its URL
      breadcrumbs.splice(1);
      breadcrumbs[0].url = '/work-items';
      breadcrumbs[0].isLast = false;

      // Add parent work item if it exists
      if (parentWorkItem) {
        breadcrumbs.push({
          label: parentWorkItem.title,
          url: `/work-items?id=${parentWorkItem._id}`,
          isLast: false
        });
      }

      // Add current work item
      breadcrumbs.push({
        label: workItem.title,
        url: `/work-items?id=${workItem._id}`,
        isLast: true
      });
    }
    // Handle document page case
    else if (isDocumentPage && document) {
      breadcrumbs[breadcrumbs.length - 1].label = document.title || "Untitled";
    }

    return breadcrumbs;
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return redirect("/");
  }

  const showAIChat = pathname?.includes('/documents/') || pathname?.includes('/work-items/');
  const breadcrumbs = getBreadcrumbs();

  return (
    <DndProvider backend={HTML5Backend}>
      <SidebarProvider className="h-screen overflow-hidden">
        <AppSidebar className="bg-slate-200"/>
        <SidebarInset className={cn(
          showAIChat ? (isAIChatCollapsed ? "flex-[0.95]" : "flex-[0.7]") : "flex-1",
          "transition-all duration-300 rounded-xl flex flex-col bg-white"
        )}>
          <header className="flex h-10 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <BreadcrumbItem key={crumb.url}>
                      {!crumb.isLast ? (
                        <>
                          <BreadcrumbLink asChild>
                            <Link href={crumb.url}>{crumb.label}</Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 overflow-auto relative min-h-0">
            {children}
          </div>
        </SidebarInset>

        {showAIChat && (
          <div className={cn(
            "flex-[0.3] max-w-[600px] min-w-[400px] bg-slate-100 transition-all duration-300 h-full pr-2 pt-2 pb-2",
            isAIChatCollapsed && "!flex-[0.05] !min-w-[80px] !max-w-[80px]"
          )}>
            <AIStoryCreator
              onInsertMarkdown={async (markdown: string) => {
                // Implement insert logic
                console.log("Inserting markdown:", markdown);
              }}
              selectedItemContent=""
              selectedItemType="document"
              selectedItemId=""
              selectedEpic={null}
              isCollapsed={isAIChatCollapsed}
              toggleCollapse={() => setIsAIChatCollapsed(!isAIChatCollapsed)}
              workspaceId={null}
            />
          </div>
        )}
      </SidebarProvider>
    </DndProvider>
  )
}
