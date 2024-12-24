"use client";
import ProjectIdeation from "@/components/project-ideation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { SpokenLanguage } from "@/types";
import { useUser } from "@clerk/clerk-react";
import { faDiagramProject, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery } from "convex/react";
import { Wand2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";

export default function Component() {
  const projects = useQuery(api.projects.getProjects);
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [activeButton, setActiveButton] = useState<string>("all");
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [openIdeateDialog, setOpenIdeateDialog] = useState<boolean>(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState<boolean>(false);
  const archiveProject = useMutation(api.projects.archiveProject);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const createProject = useMutation(api.projects.createProject);

  const [projectToArchive, setProjectToArchive] = useState<any>(null);

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

  const onCreate = async () => {
    try {
      const newProject = await createProject({
        title: "Untitled Epic",
      });

      toast.success("New epic created");

      if (newProject) {
        setSelectedProject(newProject);
        router.push(`/epics/${newProject}`);
      }
    } catch (error) {
      toast.error("Failed to create epic");
    }
  };

  const handleGenerateProject = async (description: string, language: SpokenLanguage) => {
    if (!description.trim()) {
      toast.error("Please enter an epic description.");
      return;
    }

    let progressInterval: NodeJS.Timeout | undefined = undefined;
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const projectId = await createProject({
        title: "Generating Epic...",
      });

      if (!projectId) {
        throw new Error("Failed to create epic");
      }

      // Start progress animation
      progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const increment = prev < 30 ? 15 : prev < 60 ? 8 : 3;
          return Math.min(prev + increment, 90);
        });
      }, 1000);

      toast.success("Epic created. Generating details...");

      const response = await fetch('/api/ideate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: description,
          projectId,
          language
        }),
      });

      // Clear interval only after response is received
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate epic details');
      }

      await response.json();
      
      // Set to 100% only after successful completion
      setGenerationProgress(100);
      
      toast.success("Epic details generated successfully!");
      setOpenPopover(null);
      setAiPrompt("");
      
      router.push(`/epics/${projectId}`);

    } catch (error: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setGenerationProgress(0);
      console.error('Error generating epic:', error);
      toast.error(error.message || "Failed to generate epic. Please try again.");
    } finally {
      setIsGenerating(false);
      setOpenIdeateDialog(false);
      // Add a delay before resetting progress to ensure the 100% state is visible
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const onArchiveClick = async (project: any) => {
    try {
      await archiveProject({ _id: project._id, isArchived: !project.isArchived });
      setOpenArchiveDialog(false);
      setOpenPopover(null);
      setProjectToArchive(null);
      router.push('/epics');
      toast.success("Epic archived successfully");
    } catch (error) {
      toast.error("Failed to archive epic");
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg w-full h-full overflow-y-auto">
        {isGenerating && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <Progress value={generationProgress} className="h-1" />
          </div>
        )}
        <div className="p-6 pt-16">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-semibold">Epics</h1>

          </div>
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
            <Button variant="outline" onClick={onCreate}>
              <PlusIcon className="mr-2 w-4 h-4" />
              <p className="mr-4">Create new</p>
            </Button>
            <Dialog open={openIdeateDialog} onOpenChange={setOpenIdeateDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-pink-400 to-blue-300 text-white whitespace-nowrap"
                >
                  <Wand2 className="mr-2 w-4 h-4" />
                  Ideate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogTitle>Generate Epic with AI</DialogTitle>
                <ProjectIdeation 
                  onSubmit={handleGenerateProject}
                  isGenerating={isGenerating}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center mb-6 overflow-x-auto">
            <Button
              variant="ghost"
              className={`mr-4 ${activeButton === "all" ? "bg-gray-200" : ""}`}
              onClick={() => setActiveButton("all")}
            >
              <FolderIcon className="mr-2" />
              All
            </Button>
            <Button
              variant="ghost"
              className={`${activeButton === "recent" ? "bg-gray-200" : ""}`}
              onClick={() => setActiveButton("recent")}
            >
              <ClockIcon className="mr-2" />
              Recently viewed
            </Button>
          </div>
          <div className="pt-2 flex flex-wrap gap-5">
            {projects?.map((proj: any) => (
              <Card
                key={proj._id}
                onClick={(e) => {
                  if (
                    e.target instanceof Element && 
                    (e.target.closest('[data-archive-controls]') || 
                     openArchiveDialog)
                  ) {
                    return;
                  }
                  router.push(`/epics/${proj._id}`);
                }}
                className="cursor-pointer w-[20rem] max-w-full overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <CardContent className="flex items-center justify-start p-4 space-x-2 pr-16">
                  <FontAwesomeIcon icon={faDiagramProject} className="text-sm" />
                  <h2 className="text-m font-medium truncate">{proj.title}</h2>
                </CardContent>
                <CardFooter className="flex justify-between p-4">
                  <div className="flex">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        {<p>Created by {user?.emailAddresses[0].emailAddress.split("@")[0] || "Unknown"}</p>}
                        <p className="text-muted-foreground">Created {new Date(Number(proj.createdAt)).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    data-archive-controls
                    className={cn(
                      openPopover === proj._id && "flex",
                    )}
                  >
                    <Popover
                      open={openPopover === proj._id}
                      onOpenChange={(open) =>
                        setOpenPopover(open ? proj._id : null)
                      }
                    >
                      <PopoverTrigger>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPopover(proj._id);
                          }}
                          className="hover:bg-gray-300 rounded-md w-6 h-6 flex items-center justify-center cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faEllipsisH} className="text-sm text-gray-500" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-1 w-[125px] border-gray-300">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToArchive(proj);
                            setOpenArchiveDialog(true);
                          }}
                          className="hover:bg-gray-100 rounded-md cursor-pointer flex flex-col p-2 w-full"
                        >
                          <span className="text-sm">Archive</span>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                </CardFooter>
              </Card>
            ))}
          </div>

          <Dialog
            open={openArchiveDialog}
            onOpenChange={(open) => {
              setOpenArchiveDialog(open);
              if (!open) setProjectToArchive(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Archive Epic?</DialogTitle>
                <DialogDescription>
                  Are you sure, you want to Archive this Epic:{" "}
                  <b>{projectToArchive?.title}</b>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant={"default"}
                  onClick={() => projectToArchive && onArchiveClick(projectToArchive)}
                >
                  Yes, Archive
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

