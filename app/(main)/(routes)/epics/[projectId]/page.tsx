"use client";
import { useCallback, useEffect, useState } from "react";
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout";
import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { toast } from "react-hot-toast";
import { menuItems } from "@/app/(main)/_components/constants";

interface ProjectIdPageProps {
  params: {
    projectId: Id<"projects">;
  };
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  const id = params.projectId;
  const [projectDetails, setProjectDetails] = useState<any>();
  const updateProjectMutation = useMutation(api.projects.updateProject);

  const handleEditorChange = useCallback(async (attribute: string, value: any) => {
    try {
      await updateProjectMutation({
        _id: id,
        [attribute]: value
      });
    } catch (error) {
      console.error('Error updating epic:', error);
      toast.error('Failed to update epic');
    }
  }, [updateProjectMutation, id]);

  const project = useQuery(api.projects.getProjectById, {
    projectId: id,
  });

  useEffect(() => {
    if (project && project?._id) {
      setProjectDetails(project);
    }
  }, [project]);

  if (projectDetails === undefined) {
    return <div className="flex justify-center items-center mx-auto"><Spinner size={"lg"} /></div>;
  }

  return (
    <CommonLayout
      data={projectDetails}
      onEditorBlur={async () => {}}
      handleEditorChange={handleEditorChange}
      projectId={params.projectId as Id<"projects">}
      parent="project"
    />
  );
};

export default ProjectIdPage;
