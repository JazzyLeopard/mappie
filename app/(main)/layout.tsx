"use client";

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useUser } from "@clerk/clerk-react";
import { redirect, usePathname, useSearchParams } from "next/navigation";
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
import { Suspense, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Maximize2, Minimize2, MoreHorizontal } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Create a motion-enabled version of ResizablePanel
const MotionResizablePanel = motion.create(ResizablePanel);

interface MainLayoutProps {
  params: Promise<{
    workspaceId: Id<"workspaces">
  }>
  children: React.ReactNode
}

function LayoutContent({ children, workspaceId, isMounted }: {
  children: React.ReactNode;
  workspaceId: Id<"workspaces"> | null;
  isMounted: boolean;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
  const [isAIChatPopped, setIsAIChatPopped] = useState(false);
  const initializeTemplates = useMutation(api.templates.initializeSystemTemplates);

  const paths = pathname?.split('/').filter(Boolean) || [];
  const isDocumentPage = paths.includes('documents');
  const isWorkItemsPage = paths.includes('work-items');
  const documentId = isDocumentPage ? paths[paths.length - 1] : null;

  // Get work item ID from URL using useSearchParams
  const workItemId = isWorkItemsPage && isMounted ? searchParams?.get('id') : null;

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

  // Get the workspace
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const workspace = workspaces?.[0];

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

    // Filter out "Knowledge Base" from breadcrumbs
    const filteredBreadcrumbs = breadcrumbs.filter(crumb => 
      crumb.label !== "Knowledge Base"
    ).map((crumb, index, array) => ({
      ...crumb,
      // Update isLast based on new array length
      isLast: index === array.length - 1
    }));

    // If we're on work items page and have a selected item
    if (isWorkItemsPage && workItem) {
      // Keep only the "Work Items" breadcrumb and modify its URL
      filteredBreadcrumbs.splice(1);
      filteredBreadcrumbs[0].url = '/work-items';
      filteredBreadcrumbs[0].isLast = false;

      // Add parent work item if it exists
      if (parentWorkItem) {
        filteredBreadcrumbs.push({
          label: parentWorkItem.title,
          url: `/w/${workspaceId}/work-items?id=${parentWorkItem._id}`,
          isLast: false
        });
      }

      // Add current work item
      filteredBreadcrumbs.push({
        label: workItem.title,
        url: `/w/${workspaceId}/work-items?id=${parentWorkItem?._id}`,
        isLast: true
      });
    }
    // Handle document page case
    else if (isDocumentPage && document) {
      filteredBreadcrumbs[filteredBreadcrumbs.length - 1].label = document.title || "Untitled";
    }

    return filteredBreadcrumbs;
  };

  // Modify the getAIChatProps to handle no selection case
  const getAIChatProps = () => {
    if (isWorkItemsPage) {
      if (workItem) {
        return {
          selectedItemId: workItem._id,
          selectedItemType: workItem.type,
          selectedItemContent: workItem.description || "",
          workspaceId: workspace?._id ?? null,
          selectedEpic: null,
        };
      }
      // Default props for work items page with no selection
      return {
        selectedItemId: "",
        selectedItemType: "task", // or any default type you prefer
        selectedItemContent: "",
        workspaceId: workspace?._id ?? null,
        selectedEpic: null,
      };
    }

    // Default props for document pages
    return {
      selectedItemContent: "",
      selectedItemType: "document",
      selectedItemId: "",
      workspaceId: workspace?._id ?? null,
      selectedEpic: null,
    };
  };

  // Modify showAIChat to be true for the entire work-items route
  const showAIChat = pathname?.includes('/documents/') || pathname?.includes('/work-items');

  // Set initial collapsed state based on route
  useEffect(() => {
    if (pathname?.includes('/work-items')) {
      setIsAIChatCollapsed(!workItemId); // Collapse if no item selected
    }
  }, [pathname, workItemId]);

  if (!isMounted || !isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return redirect("/");
  }

  const breadcrumbs = getBreadcrumbs();

  return (
    <DndProvider backend={HTML5Backend}>
      <SidebarProvider className="h-screen overflow-hidden">
        <AppSidebar className="bg-slate-200" />

        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={70}
            minSize={50}
            className={cn(
              "transition-all duration-300 rounded-xl flex flex-col bg-white m-2"
            )}
          >
            <header className="flex pt-2 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.length > 2 ? (
                      <>
                        <BreadcrumbItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit p-2">
                              {breadcrumbs.slice(0, -2).map((crumb) => (
                                <Link 
                                  key={crumb.url} 
                                  href={crumb.url}
                                  className="block px-2 py-1 text-sm hover:bg-accent rounded-sm"
                                >
                                  {crumb.label}
                                </Link>
                              ))}
                            </PopoverContent>
                          </Popover>
                          <BreadcrumbSeparator />
                        </BreadcrumbItem>
                        {breadcrumbs.slice(-2).map((crumb, index) => (
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
                      </>
                    ) : (
                      breadcrumbs.map((crumb, index) => (
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
                      ))
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex-1 overflow-auto relative min-h-0 h-full">
              {children}
            </div>
          </ResizablePanel>

          {showAIChat && (
            <>
              <ResizableHandle />
              {!isAIChatPopped && (
                <MotionResizablePanel
                  defaultSize={30}
                  animate={{
                    width: isAIChatCollapsed ? "80px" : "30%",
                    flex: isAIChatCollapsed ? "0 0 80px" : "0 0 30%"
                  }}
                  style={{
                    width: isAIChatCollapsed ? "80px" : "30%",
                    flex: isAIChatCollapsed ? "0 0 80px" : "0 0 30%",
                    overflow: 'hidden'
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.32, 0.72, 0, 1]
                  }}
                  className={cn(
                    "bg-slate-100 m-2 ml-0",
                    isAIChatCollapsed && "!w-[80px]"
                  )}
                >
                  <AIStoryCreator
                    onInsertMarkdown={async (markdown: string) => {
                      console.log("Inserting markdown:", markdown);
                    }}
                    {...getAIChatProps()}
                    isCollapsed={isAIChatCollapsed}
                    toggleCollapse={() => setIsAIChatCollapsed(!isAIChatCollapsed)}
                    togglePopOut={() => setIsAIChatPopped(true)}
                  />
                </MotionResizablePanel>
              )}
              
              <Dialog open={isAIChatPopped} onOpenChange={setIsAIChatPopped}>
                <DialogContent className="max-w-[90vw] h-[90vh] p-0 gap-0">
                  <VisuallyHidden>
                    <DialogTitle>AI Chat Assistant</DialogTitle>
                  </VisuallyHidden>
                  <AIStoryCreator
                    onInsertMarkdown={async (markdown: string) => {
                      console.log("Inserting markdown:", markdown);
                    }}
                    {...getAIChatProps()}
                    isCollapsed={false}
                    togglePopOut={() => setIsAIChatPopped(false)}
                    isPopped={true}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </ResizablePanelGroup>
      </SidebarProvider>
    </DndProvider>
  )
}

export default function MainLayout({ children, params }: MainLayoutProps) {
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const initializeTemplates = useMutation(api.templates.initializeSystemTemplates);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setWorkspaceId(resolvedParams.workspaceId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (isMounted) {
      initializeTemplates();
    }
  }, [initializeTemplates, isMounted]);

  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    }>
      <LayoutContent
        workspaceId={workspaceId}
        isMounted={isMounted}
      >
        {children}
      </LayoutContent>
    </Suspense>
  );
}
