"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiagramProject } from "@fortawesome/free-solid-svg-icons";
import AiGenerationIcon from "@/icons/AI-Generation";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";


export default function Component() {
  
const projects = useQuery(api.projects.getProjects);
const { user } = useUser();
const router = useRouter();
const [activeButton, setActiveButton] = useState("all");
const [openPopover, setOpenPopover] = useState<string | null>(null);
const [openDialog, setOpenDialog] = useState(false);
const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
const archiveProject = useMutation(api.projects.archiveProject);
const onArchiveClick = async (id: Id<"projects">, isArchived: boolean) => {
    await archiveProject({ _id: id, isArchived: !isArchived });
    setOpenDialog(false);
    router.push(`/projects`);
  };


  return (
    <div className="p-6 pt-16 min-w-100%">
        <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold">Projects</h1>
        </div>
        <div className="flex items-center space-x-2 mb-6">
          <Button className="bg-primary text-primary-foreground">
            <PlusIcon className="mr-2" />
            <p className="mr-4">Create new</p>
            <AiGenerationIconWhite/>
          </Button>
          <Button variant="outline">
            <FileIcon className="mr-2" />
            New from blank
          </Button>
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
      <div className="flex gap-8 ">
        {projects?.map((proj) => (
          <Card 
            key={proj._id} 
            onClick={() => router.push(`/projects/${proj._id}`)}
            className="cursor-pointer min-w-[20rem]"
            >
            <CardContent  className="flex items-center justify-start p-4 space-x-2 pr-16">
              <FontAwesomeIcon icon={faDiagramProject} className="text-sm" />
              <h2 className="text-m font-medium truncate max-w-[280px]">{proj.title}</h2>
            </CardContent>
            <CardFooter className="flex justify-between p-4">
                <div className="flex">
                    <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={user?.imageUrl} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                            <p>Created by {user?.firstName || "Unknown"}</p>
                            <p className="text-muted-foreground">Created {new Date(proj._creationTime).toLocaleDateString()}</p>
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
                        <FontAwesomeIcon icon={faEllipsisH} className="text-sm text-gray-500"/>
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

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
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

function MoveHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
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

function XIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}