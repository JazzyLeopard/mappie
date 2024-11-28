"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { faDiagramProject, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery } from "convex/react";
import { Rocket, Wand2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from 'sonner';

export default function Component() {
  const projects = useQuery(api.projects.getProjects);
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [activeButton, setActiveButton] = useState("all");
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const archiveProject = useMutation(api.projects.archiveProject);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const createProject = useMutation(api.projects.createProject);

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

  const handleGenerateProject = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a project description.");
      return;
    }

    setIsGenerating(true);
    try {
      // Phase 1: Create the project with only a title
      const projectId = await createProject({
        title: "New AI Generated Project",
      });

      toast.success("Project created. Generating details...");

      // Phase 2: Generate and populate project details
      const response = await fetch('/api/ideate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt, projectId }),
      });

      if (response.ok) {
        console.log("Ideate response:", response);
      }
      else {
        throw new Error('Failed to generate project details');
      }

      toast.success("Project details generated successfully!");

      // Navigate to the new project
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error generating project:', error);
      toast.error("Failed to generate project. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onArchiveClick = async (id: Id<"projects">, isArchived: boolean) => {
    await archiveProject({ _id: id, isArchived: !isArchived });
    setOpenDialog(false);
    router.push(`/projects`);
  };

  return (
    <>
      <div className="bg-white rounded-lg w-full h-screen">
        <div className="p-6 pt-16 min-w-100% ">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-semibold">Projects</h1>

          </div>
          <div className="flex items-center space-x-2 mb-6">
            <Button variant="outline" onClick={onCreate}>
              <PlusIcon className="mr-2 w-4 h-4" />
              <p className="mr-4">Create new</p>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="default" className="bg-gradient-to-r from-pink-400 to-blue-300 text-white">
                  <Wand2 className="mr-2 w-4 h-4" />
                  Ideate with AI
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-96">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe the type of project/product/app/feature you want to create. Mappie will generate a project with populated fields as a starting point for you to build upon."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleGenerateProject} className="w-full" disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center mb-6">
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
            {projects?.map((proj) => (
              <Card
                key={proj._id}
                onClick={() => router.push(`/projects/${proj._id}`)}
                className="cursor-pointer w-[20rem]"
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
                      <PopoverContent className="p-1 w-[125px]">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDialog(true);
                          }}
                          className="hover:bg-gray-100 rounded-md cursor-pointer flex flex-col p-2 w-full"
                        >
                          <span className="text-sm">Archive</span>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Dialog
                    open={openDialog}
                    onOpenChange={() => setOpenDialog(!openDialog)}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Archive Project?</DialogTitle>
                        <DialogDescription>
                          Are you sure, you want to Archive this Project:{" "}
                          <b>{proj.title}</b>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          onClick={() =>
                            onArchiveClick(proj._id, proj.isArchived)
                          }
                        >
                          Yes, Archive
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                </CardFooter>
              </Card>
            ))}
          </div>
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
