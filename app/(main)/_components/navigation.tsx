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
import { useMutation, useQuery } from "convex/react";
import { CreditCard, FileText, GitPullRequest, Home, Layers, List, PlusCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NavItem from "./NavItem";
import UserItems from "./UserItems";

export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const projects = useQuery(api.projects.getProjects);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const createProject = useMutation(api.projects.createProject);

  useEffect(() => {
    const updateSelectedProject = () => {
      console.log("Pathname:", pathname);
      console.log("Projects:", projects);

      const pathParts = pathname?.split('/') || [];
      const projectIdFromUrl = pathParts[pathParts.indexOf('projects') + 1];

      console.log("Project ID from URL:", projectIdFromUrl);

      if (projectIdFromUrl && projects) {
        const matchingProject = projects.find(project => project._id === projectIdFromUrl);
        console.log("Matching project:", matchingProject);
        if (matchingProject) {
          setSelectedProject(matchingProject._id);
          console.log("Selected project set to:", matchingProject._id);
        }
      } else if (projects && projects.length > 0 && !selectedProject) {
        setSelectedProject(projects[0]._id);
        console.log("Selected project set to first project:", projects[0]._id);
      }
    };

    updateSelectedProject();
  }, [projects, pathname]);

  useEffect(() => {
    // Refetch projects when the route changes
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
      console.error("Failed to create project", error);
      toast.error("Failed to create project");
    }
  };

  const navItems = [
    {
      label: "Project Overview",
      icon: Home,
      path: ""
    },
    {
      label: "Functional Requirements",
      icon: FileText,
      path: "functional-requirements"
    },
    {
      label: "Use Cases",
      icon: GitPullRequest,
      path: "use-cases"
    },
    {
      label: "Epics",
      icon: Layers,
      path: "epics"
    },
    {
      label: "Stories",
      icon: List,
      path: "stories"
    }
  ];

  const isActive = (itemPath: string) => {
    const projectPath = `/projects/${selectedProject}`;
    const fullItemPath = itemPath ? `${projectPath}/${itemPath}` : projectPath;
    return pathname === fullItemPath;
  };

  const selectedProjectTitle = selectedProject && projects
    ? projects.find(project => project._id === selectedProject)?.title
    : "Select a project";
  console.log("Selected project title:", selectedProjectTitle);

  return (
    <div className="group/sidebar h-full w-80 bg-secondary overflow-y-auto relative z-[50] flex flex-col">
      <div className="p-3">
        <UserItems />
      </div>

      <div className="p-4">
        <p className="text-sm font-semibold mb-2">Projects</p>
        <Select onValueChange={handleProjectChange} value={selectedProject || undefined}>
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
                onClick={() => router.push(`/projects/${selectedProject}/${item.path}`)}
                active={isActive(item.path)}
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
    </div>
  );
};
