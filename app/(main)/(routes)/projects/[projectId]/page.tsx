"use client";
import ProjectNavbar from "@/app/(main)/_components/ProjectNavbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/ui/spinner";
import { Link } from "lucide-react";
import ProjectOverviewAndEpics from "@/app/(main)/_components/ProjectOverviewAndEpics";

interface ProjectIdPageProps {
  params: {
    projectId: Id<"projects">;
  };
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  const id = params.projectId;
  const projectTitle = useQuery(api.projects.getProjectNameById, {
    projectId: id,
  });

  if (projectTitle === undefined) {
    return <div className="flex justify-center items-center mx-auto"><Spinner /></div>;
  }

  return <ProjectOverviewAndEpics projectTitle={projectTitle} projectId={id} />
};

export default ProjectIdPage;