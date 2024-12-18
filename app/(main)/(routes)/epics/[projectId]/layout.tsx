"use client";

import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { Alert, AlertTitle } from "@chakra-ui/react";

interface ProjectProps {
  params: {
    projectId: Id<"projects">;
  };
  children: ReactNode;
}

const ProjectLayout = ({ params, children }: ProjectProps) => {
  const id = params.projectId;
  const projectTitle = useQuery(api.projects.getProjectNameById, {
    projectId: id,
  });

  if (projectTitle === undefined) {
    return (
      <div className="flex justify-center items-center mx-auto">
        <Spinner size={"lg"} />
      </div>
    );
  }
  return (
    <div className="pb-40">
      <div className="min-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
        <div className="">{children}</div>
      </div>
    </div>
  );
};

export default ProjectLayout;
