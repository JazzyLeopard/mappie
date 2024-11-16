"use client";
import { useEffect, useState } from "react";
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout";
import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
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

  const handleEditorBlur = async () => {
    // No need to do anything on blur since changes are handled by handleEditorChange
    return Promise.resolve();
  };

  const handleEditorChange = async (attribute: string, value: any) => {
    try {
      // Update local state
      setProjectDetails((prevDetails: any) => ({
        ...prevDetails,
        [attribute]: value
      }));

      // Prepare payload for database update by removing non-mutable fields
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails;
      
      // Update database
      await updateProjectMutation({
        ...payload,
        [attribute]: value
      });

    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <CommonLayout
      data={projectDetails}
      menu={menuItems}
      onEditorBlur={handleEditorBlur}
      handleEditorChange={handleEditorChange}
      updateProject={updateProjectMutation}
    />
  );
};

export default ProjectIdPage;
