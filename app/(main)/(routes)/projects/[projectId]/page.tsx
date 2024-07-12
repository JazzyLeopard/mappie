"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/ui/spinner";
import ProjectLayout from "@/app/(main)/_components/projectLayout";
import { useRouter } from "next/navigation";

interface ProjectIdPageProps {
  params: {
    projectId: Id<"projects">;
  };
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  const id = params.projectId;
  const router = useRouter();
  const project = useQuery(api.projects.getProjectById, {
    projectId: id,
  });

  if (project === undefined) {
    return <div className="flex justify-center items-center mx-auto"><Spinner /></div>;
  }

  if (project.onboarding != 0) {
    router.push(`/projects/${id}/onboarding`);
    return;
  }

  return <ProjectLayout project={project} />
};

export default ProjectIdPage;