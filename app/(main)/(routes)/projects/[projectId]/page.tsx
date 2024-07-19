import { Id } from "@/convex/_generated/dataModel";
import { redirect } from "next/navigation";

interface ProjectIdPageProps {
  params: {
    projectId: Id<"projects">;
  };
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  const id = params.projectId;

  redirect(`/projects/${id}/overview`)

};

export default ProjectIdPage;