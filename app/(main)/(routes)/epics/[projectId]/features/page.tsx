'use client'

import EpicLayout from "@/app/(main)/_components/layout/EpicLayout"
import Spinner from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface EpicsPageProps {
    params: Promise<{
        projectId: Id<"projects">;
        epicId?: Id<"epics">;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page({ params, searchParams }: EpicsPageProps) {
    const [ids, setIds] = useState<{
        projectId: Id<"projects"> | null;
        epicId?: Id<"epics">;
    }>({ projectId: null });
    const [content, setContent] = useState<any>([]);

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

    const epics = useQuery(api.epics.getEpics, { 
        projectId: ids.projectId! 
    });

    const updateEpic = useMutation(api.epics.updateEpic)
    const deleteEpic = useMutation(api.epics.deleteEpic)

    useEffect(() => {
        if (epics && epics?.length > 0) {
            setContent(epics);
        }
    }, [epics])

    const handleEditorChange = useCallback(async (_id: Id<"epics">, field: string, value: any) => {
        console.log('Editor change:', { _id, field, value });
        try {
            await updateEpic({ _id, [field]: value })
        } catch (error) {
            console.error("Error updating feature:", error);
        }
    }, [updateEpic]);

    const handleDeleteEpic = useCallback(async (_id: Id<"epics">) => {
        try {
            await deleteEpic({ _id });
            console.log('Feature deleted:', _id);
            setContent((prevEpics: any) => prevEpics.filter((epic: any) => epic._id !== _id));
            toast.success("Feature deleted successfully");
        } catch (error) {
            console.error("Error deleting feature:", error);
            toast.error("Failed to delete feature");
        }
    }, [deleteEpic]);

    if (!ids.projectId || epics === undefined) {
        return <Spinner size={"lg"} />;
    }

    return (
        <EpicLayout
            params={{
                projectId: ids.projectId,
                epicId: ids.epicId
            }}
            handleEditorChange={handleEditorChange}
            onDeleteEpic={handleDeleteEpic}
            epics={content || []}
        />
    )

}
