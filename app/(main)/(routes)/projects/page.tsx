"use client";

import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Empty from "@/public/empty.png";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AllProjects from "@/app/(main)/_components/AllProjects";

const ProjectsPage = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  if (!isSignedIn) {
    return <>Not signed in..</>;
  }
  const projects = useQuery(api.projects.getProjects);

  // if (projects && projects?.length > 0) {
  // 	router.push(`/projects/${projects[0]._id}`);
  // }
  const createProject = useMutation(api.projects.createProject);

  const onCreate = () => {
    const promise = createProject({
      title: "Untitled Project",
    });

    toast.promise(promise, {
      loading: "Creating new project...",
      success: "New project created",
      error: "Failed to create project",
    });
  };

  return (
    <>
      <div className="flex flex-col px-16 items-start overflow-y-auto max-h-screen">
          <AllProjects />
          {projects && projects?.length <= 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 h-full w-full">
              <h2 className="text-xl font-semibold">
                You haven't created any projects...
              </h2>
              <Image src={Empty} alt="documents" width={100} height={100} />
              <h3 className="text-xl font-semibold">
                Click on "Create New" or "Ideate with AI"
              </h3>
            </div>
          ) : ''}
      </div>
    </>
  );
};

export default ProjectsPage;
