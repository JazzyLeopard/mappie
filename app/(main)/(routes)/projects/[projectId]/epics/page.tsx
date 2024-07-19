'use client'

import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { toast } from "sonner"

interface EpicsPageProps {
    params: {
        projectId: Id<"projects">
    }
}

const EpicsPage = ({ params }: EpicsPageProps) => {
    const id = params.projectId
    const createEpic = useMutation(api.epics.createEpics)

    const onCreateEpic = (projectId: Id<"projects">) => {
        console.log("Create Epic called")
        const mypromise = createEpic({
            title: "Untitled Epic",
            projectId: projectId,
        });

        toast.promise(mypromise, {
            loading: "Creating new Epic...",
            success: "New Epic created",
            error: "Failed to create Epic",
        });
    }

    return (
        <Button onClick={() => onCreateEpic(id)}>Create Epic</Button>
    )
}

export default EpicsPage