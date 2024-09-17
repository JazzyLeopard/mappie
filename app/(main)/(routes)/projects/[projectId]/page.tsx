"use client";
import { useEffect, useState } from "react";
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout";
import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { menuItems } from "@/app/(main)/_components/constants";
import { serialize } from 'next-mdx-remote/serialize';

interface ProjectIdPageProps {
  params: {
    projectId: Id<"projects">;
  };
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  const id = params.projectId;

  const [projectDetails, setProjectDetails] = useState<any>()

  const updateProjectMutation = useMutation(api.projects.updateProject)

  const project = useQuery(api.projects.getProjectById, {
    projectId: id,
  });

  useEffect(() => {
    if (project && project?._id) {
      setProjectDetails(project)
    }
  }, [project])

  if (projectDetails === undefined) {
    return <div className="flex justify-center items-center mx-auto"><Spinner size={"lg"} /></div>;
  }


  const handleEditorBlur = async () => {
    try {
      setProjectDetails((prevDetails: any) => {
        console.log('time for API call', prevDetails);
        const { _creationTime, createdAt, updatedAt, userId, ...payload } = prevDetails;
        updateProjectMutation(payload).catch(error => {
          console.log('error updating project', error);
        });
        return prevDetails;  // Return the same state to avoid unnecessary re-renders
      });
    } catch (error) {
      console.log('error updating project', error);
    }
  };

  const handleEditorChange = (attribute: string, data: any) => {
    setProjectDetails({ ...projectDetails, [attribute]: data });
  };


  return <CommonLayout
    data={projectDetails}
    menu={menuItems}
    onEditorBlur={handleEditorBlur}
    handleEditorChange={handleEditorChange} />
};

export default ProjectIdPage;
