'use client'

import EpicLayout from "@/app/(main)/_components/layout/EpicLayout"
import Spinner from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface EpicsPageProps {
    params: {
        projectId: Id<"projects">;
        epicId?: Id<"epics">;  // Add epicId as optional parameter
    }
}

const EpicsPage = ({ params }: EpicsPageProps) => {
    const { projectId, epicId } = params  // Destructure both IDs
    const [content, setContent] = useState<any>([])
    const epics = useQuery(api.epics.getEpics, { projectId });
    const createEpic = useMutation(api.epics.createEpics);
    const updateEpic = useMutation(api.epics.updateEpic)
    const deleteEpic = useMutation(api.epics.deleteEpic)

    useEffect(() => {
        if (epics && epics?.length > 0) {
            setContent(epics);
        }
    }, [epics]);

    const handleCreateEpic = useCallback(async () => {
        await createEpic({
            projectId,
            name: `New Epic ${epics?.length ?? 0 + 1}`,
            description: ''
        })
    }, [createEpic, epics, projectId])

    const handleEpicNameChange = useCallback(async (epicId: Id<"epics">, newName: string) => {
        await updateEpic({ _id: epicId, name: newName })
    }, [updateEpic])

    const handleUpdateEpic = useCallback(async (_id: Id<"epics">, field: 'name' | 'description', value: any) => {
        await updateEpic({ _id, [field]: value })
    }, [updateEpic])

    const handleEditorChange = useCallback(async (_id: Id<"epics">, field: string, value: any) => {
        await handleUpdateEpic(_id, field as 'name' | 'description', value);
    }, [handleUpdateEpic]);

    const handleDeleteEpic = useCallback(async (_id: Id<"epics">) => {
        try {
            await deleteEpic({ _id });
            toast.success("Epic deleted successfully");
        } catch (error) {
            console.error("Error deleting epic:", error);
            toast.error("Failed to delete epic");
        }
    }, [deleteEpic]);

    const handleEditorBlur = async () => {
        // Implement if needed
    }

    if (epics === undefined) {
        return <Spinner size={"lg"} />;
    }

    return (
        <EpicLayout
            params={{
                projectId,
                epicId
            }}
            handleEditorChange={handleEditorChange}
            onAddEpics={handleCreateEpic}
            onDeleteEpic={handleDeleteEpic}
            onEditorBlur={handleEditorBlur}
            onEpicNameChange={handleEpicNameChange}
            epics={content || []}
        />
    )

}

export default EpicsPage;
