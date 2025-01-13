"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { CreditCard, FileText, Folders, GitPullRequest, Home, Layers, PanelLeftClose, PanelLeftOpen, PlusCircle, InfoIcon, MessageCircle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import NavItem from "./NavItem";
import UserItems from "./UserItems";
import FileUpload from "./layout/Context";
import { MessageModal } from "@/components/MessageModal";
import { SharePopover } from "@/components/share-popover";


export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const projects = useQuery(api.projects.getProjects);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const createProject = useMutation(api.projects.createProject);


  const sidebarRef = useRef<ElementRef<"aside">>(null)
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentProject = useQuery(api.projects.getProjectById,
    selectedProject ? { projectId: selectedProject as Id<"projects"> } : "skip"
  );

  useEffect(() => {
    const updateSelectedProject = () => {
      const pathParts = pathname?.split('/') || [];
      const projectIdFromUrl = pathParts[pathParts.indexOf('epics') + 1];

      if (projectIdFromUrl && projects) {
        const matchingProject = projects.find((project: any) => project._id === projectIdFromUrl);
        if (matchingProject) {
          setSelectedProject(matchingProject._id);
        }
      } else if (projects && projects.length > 0 && !selectedProject) {
        setSelectedProject(projects[0]._id);
      }
    };

    updateSelectedProject();
  }, [projects, pathname]);

  useEffect(() => {
    router.refresh();
  }, [pathname]);

  const handleProjectChange = (projectId: string) => {
    if (projectId === "all_epics") {
      router.push("/epics");
    } else if (projectId === "new_epic") {
      onCreate();
    } else {
      setSelectedProject(projectId);
      router.push(`/epics/${projectId}`);
    }
  };

  const onCreate = async () => {
    try {
      const newProject = await createProject({
        title: "Untitled Epic",
      });

      toast.success("New project created");

      if (newProject) {
        setSelectedProject(newProject);
        router.push(`/epics/${newProject}`);
      }
    } catch (error) {
      toast.error("Failed to create epic");
    }
  };

  const navItems = [
    {
      label: "Epic Overview",
      icon: Home,
      path: "",
    },
    {
      label: "Functional Requirements",
      icon: FileText,
      path: "functional-requirements",
    },
    {
      label: "Use Cases",
      icon: GitPullRequest,
      path: "use-cases",
    },
    {
      label: "Features & User Stories",
      icon: Layers,
      path: "features",
    }
  ];

  const handleNavItemClick = (path: string) => {
    if (currentProject || path === "") {
      router.push(`/epics/${selectedProject}/${path}`);
    }
  };

  const isActive = (itemPath: string) => {
    const projectPath = `/epics/${selectedProject}`;
    const fullItemPath = itemPath ? `${projectPath}/${itemPath}` : projectPath;
    return pathname === fullItemPath;
  };

  const selectedProjectTitle = selectedProject && projects
    ? projects.find((project: any) => project._id === selectedProject)?.title
    : "Select an epic";

  const toggleCollapse = () => {
    if (window.innerWidth > 768) {
      setIsCollapsed(prev => !prev);
    }
  };

  const handleFeedbackClick = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsCollapsed(isMobile);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <aside ref={sidebarRef} className={cn(`group/sidebar h-full ${isCollapsed ? 'w-16' : 'bg-slate-200 w-80'} overflow-y-auto overflow-x-hidden relative z-[50] flex flex-col transition-width duration-300`,
        isResetting && "transition-all ease-in-out duration-300"
      )}>

        <div ref={navbarRef} className={cn("px-[1.30rem] flex justify-between items-center", isCollapsed ? "pt-6 pb-2" : "py-1", isResetting && "transition-all ease-in-out duration-300")}>
          {!isCollapsed && <UserItems />}
          <div onClick={toggleCollapse} className="cursor-pointer text-muted-foreground hover:text-foreground transition">
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </div>
        </div>

        {!isCollapsed ? (
          <>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">Epics</p>
                <Link href="/epics">
                  <button className="text-sm underline p-1">All</button>
                </Link>
              </div>
              <Select onValueChange={handleProjectChange} value={selectedProject || undefined}>
                <SelectTrigger className="w-full max-w-[250px]">
                  <SelectValue placeholder="Select an epic">
                    <span className="truncate block">{selectedProjectTitle}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-[250px]">
                  <SelectItem value="all_epics" className="my-1">
                    <span className="truncate block">All Epics</span>
                  </SelectItem>
                  <SelectSeparator className="my-2" />
                  {projects?.map((project: any) => (
                    <SelectItem key={project._id} value={project._id} className="my-1">
                      <span className="truncate block">
                        {project.title.length > 24 ? `${project.title.slice(0, 24)}...` : project.title}
                      </span>
                    </SelectItem>
                  ))}
                  <SelectSeparator className="my-2" />
                  <SelectItem
                    value="new_epic"
                    className="my-1 hover:bg-primary/10 text-primary"
                  >
                    <PlusCircle className="h-4 w-4 mr-2 inline-block" />
                    New Epic
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {projects && projects?.length > 0 && (
              <ScrollArea className="flex-grow-0 flex-shrink-0">
                {selectedProject && projects && (
                  <>
                    {navItems.map((item) => (
                      <NavItem
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        onClick={() => handleNavItemClick(item.path)}
                        active={isActive(item.path)}
                      />
                    ))}

                    <div className="flex-col items-center px-4 py-4">
                      {selectedProject && (
                        <SharePopover 
                        projectId={selectedProject as Id<"projects">} 
                        variant="nav"
                      />
                    )}
                    </div>

                    <div className="flex-col items-center px-4 py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold">Context</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoIcon className="h-3 w-3 ml-2 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Add documents to provide more context for the AI when generating content for any section.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="mt-2">
                        <FileUpload projectId={selectedProject as Id<"projects">} />
                      </div>
                    </div>
                  </>
                )}
              </ScrollArea>
            )}

            <div className="">
              <p className="text-sm font-semibold mb-2 px-4">Settings</p>
              <NavItem
                label="Feedback"
                icon={MessageCircle}
                onClick={handleFeedbackClick}
                active={false}
                collapsed={false}
              />
              <NavItem
                label="Feature Requests"
                icon={Lightbulb}
                onClick={() => {}}
                active={false}
                collapsed={false}
                customElement={
                  <a 
                    data-canny-link 
                    href="https://mappie.canny.io"
                    className={cn(
                      "flex items-center w-full px-4 py-3 text-sm cursor-pointer",
                      "w-full py-3 hover:relative hover:before:absolute hover:before:left-1 hover:before:top-1/2 hover:before:-translate-y-1/2 hover:before:h-6 hover:before:w-1 hover:before:rounded-full hover:before:bg-gradient-to-b hover:before:from-blue-400 hover:before:to-pink-400 hover:text-primary"
                    )}
                  >
                    <Lightbulb 
                      className={cn(
                        "h-5 w-5 mr-2",
                        "hover:[&>path]:stroke-[url(#blue-pink-gradient)]"
                      )} 
                    />
                    <svg width="0" height="0">
                      <linearGradient id="blue-pink-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </svg>
                    <span className="flex-grow text-left">Feature Requests</span>
                  </a>
                }
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <Popover>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "hover:bg-primary/10",
                            selectedProject && "text-primary"
                          )}
                        >
                          <Folders className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <PopoverContent
                      side="right"
                      align="start"
                      className="w-72 p-0 ml-2"
                      sideOffset={0}
                    >
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleProjectChange("all_epics")}
                        >
                          All Epics
                        </Button>
                        <Separator className="my-1" />
                        {projects?.map((project: any) => (
                          <Button
                            key={project._id}
                            variant="ghost"
                            className="w-full justify-start text-sm truncate"
                            onClick={() => handleProjectChange(project._id)}
                          >
                            {project.title}
                          </Button>
                        ))}
                        <Separator className="my-1" />
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-primary pt-1"
                          onClick={() => handleProjectChange("new_epic")}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          New Epic
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <TooltipContent
                    side="right"
                    align="center"
                    sideOffset={10}
                  >
                    <p>Epics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="px-2 mb-2">
              <Separator className="bg-slate-300" />
            </div>
            <ScrollArea className="flex-grow-0 flex-shrink-0">
              {selectedProject && projects && (
                <>
                  {navItems.map((item) => (
                    <NavItem
                      key={item.label}
                      label={item.label}
                      icon={item.icon}
                      onClick={() => handleNavItemClick(item.path)}
                      active={isActive(item.path)}
                      collapsed={true}
                    />
                  ))}
                  <NavItem
                    label="Feedback"
                    icon={MessageCircle}
                    onClick={handleFeedbackClick}
                    active={false}
                    collapsed={true}
                  />
                  <NavItem
                    label="Feature Requests"
                    icon={Lightbulb}
                    onClick={() => window.open('https://mappie.canny.io', '_blank')}
                    active={false}
                    collapsed={true}
                  />
                </>
              )}
            </ScrollArea>
          </>
        )}



        <MessageModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen}
        />

        {/* {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            onClick={() => { }}
            className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-[3px] bg-primary/10 right-0 top-0" />
        )} */}
      </aside>
    </>
  );

};
