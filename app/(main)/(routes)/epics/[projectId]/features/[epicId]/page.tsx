'use client'
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout";
import { epicMenuItems } from "@/app/(main)/_components/constants";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

interface EpicsPageProps {
  params: Promise<{
    projectId: Id<"projects">;
    epicId: Id<"epics">;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page({ params, searchParams }: EpicsPageProps) {
  const [ids, setIds] = useState<{
    projectId: Id<"projects"> | null;
    epicId: Id<"epics"> | null;
  }>({ projectId: null, epicId: null });

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setIds({
        projectId: resolvedParams.projectId,
        epicId: resolvedParams.epicId
      });
    };
    resolveParams();
  }, [params]);

  const [epicDetails, setEpicDetails] = useState<any>()

  const updateEpicMutation = useMutation(api.epics.updateEpic)

  const epic = useQuery(api.epics.getEpicById, {
    epicId: ids.epicId,
  });

  useEffect(() => {
    if (epic)
      setEpicDetails(epic)
  }, [epic])

  const handleEditorBlur = async () => {
    try {
      console.log('time for API call', epicDetails);
      const { createdAt, updatedAt, userId, projectId, ...payload } = epicDetails
      await updateEpicMutation(payload)
      console.log("epic", epicDetails);
    } catch (error) {
      console.log('error updating project', error);
    }
  };

  const handleEditorChange = useCallback(async (attribute: string, value: any) => {
    await updateEpicMutation({
      id: ids.epicId,
      [attribute]: value
    });
  }, [updateEpicMutation, ids.epicId]);

  if (epic instanceof Error) {
    return <div>Error: {epic.message}</div>;
  }

  if (epicDetails) {
    return <CommonLayout
      data={epicDetails}
      onEditorBlur={handleEditorBlur}
      handleEditorChange={handleEditorChange}
      projectId={ids.projectId as any}
      parent="epic"
    />
  }
}
