"use client";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronsLeft,
  ChevronRight,
  ChevronUp,
  MenuIcon,
  PlusCircle,
  CreditCard,
  Dot,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import UserItems from "./UserItems";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Toaster, toast } from "sonner";
import NavItem from "./NavItem";
import ThreeDotMenuIcon from "@/icons/ThreeDotMenuIcon";
import PlusIcon from "@/icons/PlusIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";


export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  const sidebarData = useQuery(api.projects.getSidebar);

  const createProject = useMutation(api.projects.createProject);

  const createEpic = useMutation(api.epics.createEpics)

  const createUserStory = useMutation(api.userstories.createUserStory)

  const archiveProject = useMutation(api.projects.archiveProject);

  const onCreate = () => {
    const mypromise = createProject({
      title: "Untitled Project",
    });

    toast.promise(mypromise, {
      loading: "Creating new project...",
      success: "New project created",
      error: "Failed to create project",
    });
  };

  const onCreateEpic = (projectId: Id<"projects">) => {
    const mypromise = createEpic({
      name: "Untitled Project",
      projectId: projectId
    })

    toast.promise(mypromise, {
      loading: "Creating new epic...",
      success: "New epic created",
      error: "Failed to create epic",
    })
  }

  const onCreateUserStories = (epicId: Id<"epics">) => {
    console.log(epicId);

    const mypromise = createUserStory({
      title: "Untitled Project",
      description: "",
      epicId: epicId
    })

    toast.promise(mypromise, {
      loading: "Creating new userStory...",
      success: "New userStory created",
      error: "Failed to create userStory",
    })
  }

  // true if the query matches, false otherwise
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"div">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  // If mobile view it will auto matically collapse "true"
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const [openPopover, setOpenPopover] = useState<Id<"projects"> | null>(null);
  const [openEpicPopover, setOpenEpicPopover] = useState<number | null>(null);
  const [openStoryPopover, setOpenStoryPopover] = useState<number | null>(null);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [pathname, isMobile]);

  // WHEN NAVBAR IS MOVED
  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;

    let newWidth = event.clientX;

    if (newWidth < 320) {
      newWidth = 320;
    }

    if (newWidth > 480) {
      newWidth = 480;
    }

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}`);

      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`,
      );
    }
  };

  // WHEN NAVBAR IS LEFT LOOSE
  const handleMouseUp = () => {
    isResizingRef.current = false;

    document.removeEventListener("mousemove", handleMouseMove);

    document.removeEventListener("mouseup", handleMouseUp);
  };

  // WHEN NAVBAR IS SELECTED
  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;

    document.addEventListener("mousemove", handleMouseMove);

    document.addEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);
    }

    sidebarRef.current!.style.width = isMobile ? "100%" : "320px";

    navbarRef.current!.style.setProperty(
      "width",
      isMobile ? "0" : "calc(100%-320px)",
    );

    setTimeout(() => setIsResetting(false), 300);
  };

  const [expandedProject, setExpandedProject] = useState<Id<"projects"> | null>(
    null,
  );

  const toggleExpand = (projectId: Id<"projects">) => {
    console.log("toggle expanded");

    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const [expandedEpicIndex, setExpandedEpicIndex] = useState<number | null>(
    null,
  );

  const toggleExpandEpic = (index: number) => {
    setExpandedEpicIndex(expandedEpicIndex === index ? null : index);
  };

  const [expandedUserStoryIndex, setExpandedUserStoryIndex] = useState<
    number | null
  >(null);

  const toggleExpandUserStory = (index: number) => {
    setExpandedUserStoryIndex(expandedUserStoryIndex === index ? null : index);
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);
    }

    sidebarRef.current!.style.width = "0";

    navbarRef.current!.style.setProperty("width", "100%");

    navbarRef.current!.style.setProperty("left", "0");

    setTimeout(() => setIsResetting(false), 300);
  };

  const onArchiveClick = async (id: Id<"projects">, isArchived: boolean) => {
    await archiveProject({ _id: id, isArchived: !isArchived });
    setOpenDialog(false);
    router.push(`/projects`);
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full w-80 bg-secondary overflow-y-auto relative z-[50] flex flex-col",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0",
        )}
      >
        <div
          title="Collapsible sidebar"
          role="button"
          onClick={collapse}
          className={cn(
            "h-6 w-6 text-muted-foreground hover:bg-neutral-300 rounded-sm absolute top-3 right-1 opacity-0 group-hover/sidebar:opacity-100",
            isMobile && "opacity-100",
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>

        <div>
          <UserItems />
        </div>

        <div className="pl-4 mt-8">
          <span className="text-xs font-semibold text-muted-foreground">
            Projects
          </span>
        </div>

        <ScrollArea className="mt-2">
          {sidebarData?.map((proj: any) => (
            <Collapsible key={proj._id}>
              <div
                className={cn(
                  "flex items-center p-2 pl-3 transition-colors duration-300 ease-in-out w-full hover:bg-gray-200 group",
                  expandedProject === proj._id ? "mb-0 bg-white-100" : "mb-0",
                )}
              >
                <div className="flex items-center cursor-pointer w-full">
                  <CollapsibleTrigger asChild>
                    <div
                      className="flex items-center"
                      onClick={() => toggleExpand(proj._id)}
                    >
                      {expandedProject === proj._id ? (
                        <ChevronUp className="hover:bg-gray-300 rounded-md w-4 h-4" />
                      ) : (
                        <ChevronRight className="hover:bg-gray-300 rounded-md w-4 h-4" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <Link
                    href={`/projects/${proj._id}`}
                    key={proj._id}
                    className="group flex items-center justify-between mx-2 py-1 select-none w-full rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="flex flex-col justify-start">
                        <span className="truncate max-w-[150px] text-sm">
                          {proj.title}
                        </span>
                        <span className="text-xs text-muted-foreground text-left">
                          {proj && proj?.onboarding != 0 ? (<p>Onboarding</p>) : (<p> Active</p>)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                <div
                  className={cn(
                    "hidden group-hover:flex px-4",
                    openPopover === proj._id && "flex",
                  )}
                >
                  {/* <Popover>
                    <PopoverTrigger>
                      <div
                        onClick={() => onCreateEpic(proj._id)}
                        className="hover:bg-gray-300 rounded-md cursor-pointer"
                      >
                        <PlusIcon />
                      </div>
                    </PopoverTrigger>
                  </Popover> */}
                  <Popover
                    open={openPopover === proj._id}
                    onOpenChange={(open) =>
                      setOpenPopover(open ? proj._id : null)
                    }
                  >
                    <PopoverTrigger>
                      <div
                        onClick={() => setOpenPopover(proj._id)}
                        className="hover:bg-gray-300 rounded-md cursor-pointer"
                      >
                        <ThreeDotMenuIcon />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-1 w-[125px]">
                      <div
                        onClick={() => setOpenDialog(true)}
                        className="hover:bg-gray-100 rounded-md cursor-pointer flex flex-col p-2 w-full"
                      >
                        <span className="text-sm">Archive</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
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
                </div>
              </div>
              <CollapsibleContent>
                <div>
                  {proj.epics.map((_: any, index: number) => (
                    <Collapsible key={index}>
                      <div className="flex items-center p-2 transition-colors pl-8 duration-300 ease-in-out w-full hover:bg-gray-200 group">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => toggleExpandEpic(index)}
                        >
                          <CollapsibleTrigger asChild>
                            {expandedEpicIndex === index ? (
                              <ChevronUp className="hover:bg-gray-300 rounded-md w-4 h-4" />
                            ) : (
                              <ChevronRight className="hover:bg-gray-300 rounded-md w-4 h-4" />
                            )}
                          </CollapsibleTrigger>
                        </div>
                        <Link href={`/projects/${proj._id}/epics/${_._id}`} className="group flex items-center justify-between mx-2 select-none w-full rounded-md">
                          <div className="flex items-center">
                            <div className="flex flex-col justify-start">
                              <span className="text-sm truncate max-w-[150px]">
                                {index + 1} {_.name}
                              </span>
                              <span className="text-xs text-muted-foreground text-left">
                                Epic
                              </span>
                            </div>
                          </div>
                        </Link>
                        <div
                          className={cn(
                            "hidden group-hover:flex px-4",
                            openEpicPopover === index && "flex",
                          )}
                        >
                          <Popover
                            open={openEpicPopover === index}
                            onOpenChange={(open) =>
                              setOpenEpicPopover(open ? index : null)
                            }
                          >
                            {/* <Popover>
                              <PopoverTrigger>
                                <div
                                  onClick={() => { }}
                                  className="hover:bg-gray-300 rounded-md cursor-pointer"
                                >
                                  <PlusIcon />
                                </div>
                              </PopoverTrigger>
                            </Popover> */}
                            <PopoverTrigger>
                              <div
                                onClick={() => setOpenEpicPopover(index)}
                                className="hover:bg-gray-300 rounded-md cursor-pointer"
                              >
                                <ThreeDotMenuIcon />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="p-1 w-[125px]">
                              <div className="hover:bg-gray-100 rounded-md cursor-pointer flex flex-col p-2 w-full">
                                <span className="text-sm">Rename</span>
                              </div>
                              <div
                                onClick={() => setOpenDialog(true)}
                                className="hover:bg-gray-100 rounded-md cursor-pointer flex flex-col p-2 w-full"
                              >
                                <span className="text-sm">Delete</span>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div>
                          {_.userStories.map((_: any, userStoryIndex: number) => (
                            <Collapsible key={userStoryIndex}>
                              <div className="flex items-center p-2 pl-14 transition-colors duration-300 ease-in-out w-full hover:bg-gray-200 group">
                                <div className="flex items-center cursor-pointer">
                                  <CollapsibleTrigger asChild>
                                    <Dot className="text-gray-400 rounded-md w-6 h-6" />
                                  </CollapsibleTrigger>
                                </div>
                                <div className="group flex items-center justify-between mx-2 select-none w-full rounded-md">
                                  <div className="flex items-center">
                                    <div className="flex flex-col justify-start">
                                      <span className="text-sm truncate max-w-[150px]">
                                        User Story {userStoryIndex + 1}
                                      </span>
                                      <span className="text-xs text-muted-foreground text-left">
                                        Story
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className={cn(
                                    "hidden group-hover:flex px-4",
                                    openStoryPopover === userStoryIndex &&
                                    "flex",
                                  )}
                                >
                                  <Popover
                                    open={openStoryPopover === userStoryIndex}
                                    onOpenChange={(open: boolean) =>
                                      setOpenStoryPopover(
                                        open ? userStoryIndex : null,
                                      )
                                    }
                                  >
                                    <PopoverTrigger>
                                      <div
                                        onClick={() =>
                                          setOpenStoryPopover(userStoryIndex)
                                        }
                                        className="hover:bg-gray-300 rounded-md cursor-pointer"
                                      >
                                        <ThreeDotMenuIcon />
                                      </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-1 w-[125px]">
                                      <div className="hover:bg-gray-100 rounded-md cursor-pointer flex flex-col p-2 w-full">
                                        <span className="text-sm">Rename</span>
                                      </div>
                                      <div className="hover:bg-gray-100 rounded-md cursor-pointer flex flex-col p-2 w-full">
                                        <span className="text-sm">Delete</span>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </Collapsible>
                          ))}
                          {/* Additional User Stories */}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  {/* Additional Epics */}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </ScrollArea>

        <div className="mt-4">
          <NavItem label="New Project" onClick={onCreate} icon={PlusCircle} />
        </div>

        <div className="pl-4 mt-10">
          <span className="text-xs font-semibold text-muted-foreground">
            Settings
          </span>
        </div>

        <div className="mt-2">
          <NavItem
            label="Subscription"
            onClick={() => router.push("/settings/subscription")}
            icon={CreditCard}
          />
        </div>

        <div
          onClick={resetWidth}
          onMouseDown={handleMouseDown}
          className="opacity-0 group-hover/sidebar:opacity-100 transition
                                cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </div>

      <div
        ref={navbarRef}
        className={cn(
          "z-[100000] absolute top-0 w-[calc(100%-60px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
        )}
      >
        <nav className="bg-transparent w-full px-3 py-2">
          {isCollapsed && (
            <MenuIcon
              onClick={resetWidth}
              role="button"
              className="h-6 w-6 text-muted-foreground"
            />
          )}
        </nav>
      </div>
      <Toaster />
    </>
  );
};
