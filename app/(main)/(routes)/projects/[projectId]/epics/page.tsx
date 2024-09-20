'use client'

import EpicLayout from "@/app/(main)/_components/layout/EpicLayout"
import Spinner from "@/components/ui/spinner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface EpicsPageProps {
    params: {
        projectId: Id<"projects">
    }
}

const EpicsPage = ({ params }: EpicsPageProps) => {
    const projectId = params.projectId
    const epics = useQuery(api.epics.getEpics, { projectId: projectId }) || [];
    const [content, setContent] = useState<any[]>([])

    const createEpic = useMutation(api.epics.createEpics);
    const deleteEpic = useMutation(api.epics.deleteEpic)
    const updateEpic = useMutation(api.epics.updateEpic)

    useEffect(() => {
        if (epics && epics?.length > 0) {
            setContent(epics);
        }
    }, [epics]);

    const handleCreateEpic = useCallback(async () => {
        const newEpicId = await createEpic({
            projectId,
            name: `New Epic`,
            description: ''
        })
    }, [createEpic, projectId])

    const handleEpicNameChange = useCallback(
        async (epicId: Id<"epics">, newName: string) => {
            await updateEpic({ _id: epicId, name: newName })
        },
        [updateEpic])

    const handleUpdateEpic = useCallback(
        async (_id: Id<"epics">, field: 'description', value: any) => {
            await updateEpic({ _id, [field]: value })
        }, [updateEpic])

    const handleEditorChange = useCallback((_id: Id<"epics">, field: string, value: any) => {
        handleUpdateEpic(_id, field as 'description', value);
    }, [handleUpdateEpic]);


    if (epics === undefined) {
        return <Spinner size={"lg"} />;
    }

    return (
        <EpicLayout
            projectId={projectId}
            onAddEpics={handleCreateEpic}
            onEpicNameChange={handleEpicNameChange}
            handleEditorChange={handleEditorChange}
            epics={content}
        />
    )

}

export default EpicsPage;
