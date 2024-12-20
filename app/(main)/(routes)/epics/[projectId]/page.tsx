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
  params: Promise<{
    projectId: Id<"projects">;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page({ 
  params: paramsPromise, 
  searchParams 
}: ProjectIdPageProps) {
  const [id, setId] = useState<Id<"projects"> | null>(null);
  const [projectDetails, setProjectDetails] = useState<any>();
  const updateProjectMutation = useMutation(api.projects.updateProject);

  useEffect(() => {
    const resolveParams = async () => {
      const params = await paramsPromise;
      setId(params.projectId);
    };
    resolveParams();
  }, [paramsPromise]);

  const handleEditorChange = useCallback(async (attribute: string, value: any) => {
    if (!id) return;
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
    projectId: id!,
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
      projectId={id as Id<"projects">}
      parent="project"
    />
  );
}
