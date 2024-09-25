"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Car, ChevronsLeft, CreditCard, FileText, GitPullRequest, Home, Layers, Menu, PlusCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import NavItem from "./NavItem";
import UserItems from "./UserItems";


export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const projects = useQuery(api.projects.getProjects);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const createProject = useMutation(api.projects.createProject);
  const [mandatoryFieldsFilled, setMandatoryFieldsFilled] = useState(false);


  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null)
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentProject = useQuery(api.projects.getProjectById,
    selectedProject ? { projectId: selectedProject as Id<"projects"> } : "skip"
  );

  useEffect(() => {
    if (currentProject) {
      const mandatoryFields = ["overview", "problemStatement", "userPersonas", "featuresInOut"] as const;
      const allFieldsFilled = mandatoryFields.every(field =>
        currentProject[field] && typeof currentProject[field] === 'string' && currentProject[field].trim() !== ''
      );
      setMandatoryFieldsFilled(allFieldsFilled);
    }
  }, [currentProject]);

  useEffect(() => {
    const updateSelectedProject = () => {
      const pathParts = pathname?.split('/') || [];
      const projectIdFromUrl = pathParts[pathParts.indexOf('projects') + 1];

      if (projectIdFromUrl && projects) {
        const matchingProject = projects.find(project => project._id === projectIdFromUrl);
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
      label: "User Journeys",
      icon: Car,
      path: "user-journeys",
      badge: "Coming soon",
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
    ? projects.find(project => project._id === selectedProject)?.title
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
      <aside ref={sidebarRef} className={cn(`group/sidebar h-full ${isCollapsed ? 'w-16' : 'bg-secondary w-80'} overflow-y-auto relative z-[50] flex flex-col transition-width duration-300`,
        isResetting && "transition-all ease-in-out duration-300"
      )}>

        <div ref={navbarRef} className={cn("px-4 py-2 flex justify-between items-center", isResetting && "transition-all ease-in-out duration-300")}>
          {!isCollapsed && <UserItems />}
          <div onClick={toggleCollapse} className="cursor-pointer text-muted-foreground">
            {isCollapsed ? <Menu className="flex justify-center items-center" /> : <ChevronsLeft />}
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="p-4">
              <p className="text-sm font-semibold mb-2">Projects</p>
              <Select onValueChange={handleProjectChange} value={selectedProject || undefined} >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project">{selectedProjectTitle}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project._id} value={project._id} className="my-1">
                      {project.title}
                    </SelectItem>
                  ))}
                  <SelectSeparator className="my-2" />
                  <SelectItem value="all_projects" className="my-1">All Projects</SelectItem>
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
                      badge={item.badge}
                    />
                  ))}
                </>
              )}
            </ScrollArea>

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
