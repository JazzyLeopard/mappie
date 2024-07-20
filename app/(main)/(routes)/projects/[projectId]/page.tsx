"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout";
import { menuItems } from "@/app/(main)/_components/constants";
import { useEffect, useState } from "react";
import InlineEditor from "@ckeditor/ckeditor5-build-inline";

interface ProjectIdPageProps {
  params: {
    projectId: Id<"projects">;
  };
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  const id = params.projectId;

  const router = useRouter();
  const [projectDetails, setProjectDetails] = useState<any>()

  const updateProjectMutation = useMutation(api.projects.updateProject)

  const project = useQuery(api.projects.getProjectById, {
    projectId: id,
  });

  useEffect(() => {
    if (project && project?.onboarding != 0) {
      router.push(`/projects/${project?._id}/onboarding`)
    }
    else {
      setProjectDetails(project)
    }
  }, [project])

  if (projectDetails === undefined) {
    return <div className="flex justify-center items-center mx-auto"><Spinner /></div>;
  }

  const updateLabel = (val: string) => {
    setProjectDetails({ ...projectDetails, title: val });
  };

  const handleEditorBlur = async () => {
    try {
      console.log('time for API call', projectDetails);
      const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails
      await updateProjectMutation(payload)
    } catch (error) {
      console.log('error updating project', error);
    }
  };

  const handleEditorChange = (event: any, editor: InlineEditor, attribute: string) => {
    const data = editor.getData();
    setProjectDetails({ ...projectDetails, [attribute]: data });
  };

  if (projectDetails?.onboarding == 0) {
    return <CommonLayout
      data={project}
      menu={menuItems}
      onEditorBlur={handleEditorBlur}
      updateLabel={updateLabel}
      handleEditorChange={handleEditorChange} />
  }

  return <>Redirecting...</>
};

export default ProjectIdPage;