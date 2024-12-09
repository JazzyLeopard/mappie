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
import { CreditCard, FileText, Folders, GitPullRequest, Home, Layers, PanelLeftClose, PanelLeftOpen, PlusCircle, InfoIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import NavItem from "./NavItem";
import UserItems from "./UserItems";
import FileUpload from "./layout/Context";


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

  const currentProject = useQuery(api.projects.getProjectById,
    selectedProject ? { projectId: selectedProject as Id<"projects"> } : "skip"
  );

  useEffect(() => {
    const updateSelectedProject = () => {
      const pathParts = pathname?.split('/') || [];
      const projectIdFromUrl = pathParts[pathParts.indexOf('projects') + 1];

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
    if (projectId === "all_projects") {
      router.push("/projects");
    } else if (projectId === "new_project") {
      onCreate();
    } else {
      setSelectedProject(projectId);
      router.push(`/projects/${projectId}`);
    }
  };

  const onCreate = async () => {
    try {
      const newProject = await createProject({
        title: "Untitled Project",
      });

      toast.success("New project created");

      if (newProject) {
        setSelectedProject(newProject);
        router.push(`/projects/${newProject}`);
      }
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const navItems = [
    {
      label: "Project Overview",
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
      label: "Epics & User Stories",
      icon: Layers,
      path: "epics",
    }
  ];

  const handleNavItemClick = (path: string) => {
    if (currentProject || path === "") {
      router.push(`/projects/${selectedProject}/${path}`);
    }
  };

  const isActive = (itemPath: string) => {
    const projectPath = `/projects/${selectedProject}`;
    const fullItemPath = itemPath ? `${projectPath}/${itemPath}` : projectPath;
    return pathname === fullItemPath;
  };

  const selectedProjectTitle = selectedProject && projects
    ? projects.find((project: any) => project._id === selectedProject)?.title
    : "Select a project";

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  // const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {

  //   if (isCollapsed) return

  //   event.preventDefault()
  //   event.stopPropagation()

  //   isResizingRef.current = true
  //   document.addEventListener("mousemove", handleMouseMove);
  //   document.addEventListener("mouseup", handleMouseUp);
  // }

  // const handleMouseMove = (event: MouseEvent) => {
  //   if (!isResizingRef.current) return
  //   let newWidth = event.clientX;

  //   if (newWidth < 240) newWidth = 240;
  //   if (newWidth > 480) newWidth = 480;

  //   if (sidebarRef.current && navbarRef.current) {
  //     sidebarRef.current.style.width = `${newWidth}px`
  //     navbarRef.current.style.setProperty("left", `${newWidth}px`)
  //     navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth})px`)
  //   }
  // }

  // const handleMouseUp = () => {
  //   isResizingRef.current = false
  //   document.removeEventListener("mousemove", handleMouseMove)
  //   document.removeEventListener("mouseup", handleMouseUp)
  // }

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
                <p className="text-sm font-semibold">Projects</p>
                <Link href="/projects">
                  <button className="text-sm underline p-1">All</button>
                </Link>
              </div>
              <Select onValueChange={handleProjectChange} value={selectedProject || undefined}>
                <SelectTrigger className="w-full max-w-[250px]">
                  <SelectValue placeholder="Select a project">
                    <span className="truncate block">{selectedProjectTitle}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-[250px]">
                  <SelectItem value="all_projects" className="my-1">
                    <span className="truncate block">All Projects</span>
                  </SelectItem>
                  <SelectSeparator className="my-2" />
                  {projects?.map((project: any) => (
                    <SelectItem key={project._id} value={project._id} className="my-1">
                      <span className="truncate block">{project.title}</span>
                    </SelectItem>
                  ))}
                  <SelectSeparator className="my-2" />
                  <SelectItem
                    value="new_project"
                    className="my-1 hover:bg-primary/10 text-primary"
                  >
                    <PlusCircle className="h-4 w-4 mr-2 inline-block" />
                    New Project
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
                label="Subscription"
                icon={CreditCard}
                onClick={() => router.push("/settings")}
                active={pathname === "/settings"}
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
                          onClick={() => handleProjectChange("all_projects")}
                        >
                          All Projects
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
                          onClick={() => handleProjectChange("new_project")}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          New Project
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <TooltipContent
                    side="right"
                    align="center"
                    sideOffset={10}
                  >
                    <p>Projects</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="px-2 mb-2">
              <Separator className="bg-slate-300" />
            </div>
            <ScrollArea className="flex-grow-0 flex-shrink-0 pb-10">
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
                </>
              )}
            </ScrollArea>
          </>
        )}

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
