"use client";
import ProjectNavbar from "@/app/(main)/_components/ProjectNavbar";
import ProjectOverviewAndEpics from "@/app/(main)/_components/ProjectOverviewAndEpics";
import WriteProjectInfo from "@/app/(main)/_components/WriteProjectInfo";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/ui/spinner";

interface ProjectIdPageProps {
  params: {
    projectId: Id<"projects">;
  };
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  const id = params.projectId;
  const [ProjectOverViewStep, setProjectOverViewStep] = useState(1);
  const project = useQuery(api.projects.getProjects, {
    projectId: id,
  });

  if (project === undefined) {
    return <div className="flex justify-center items-center mx-auto"><Spinner/></div>;
  }

  if (project instanceof Error) {
    return <div>Error: {project.message}</div>;
  }

  return (
    <div className="pb-40">
      <div className="min-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
        <ProjectNavbar />
        <div className="pl-[96px]">
          {ProjectOverViewStep === 1 && (
            <ProjectOverviewAndEpics setProjectOverViewStep={setProjectOverViewStep} />
          )}
          {ProjectOverViewStep === 2 && <WriteProjectInfo />}
        </div>
      </div>
    </div>
  );
};

export default ProjectIdPage;