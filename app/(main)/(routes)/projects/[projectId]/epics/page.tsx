'use client'

import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import EpicLayout from "@/app/(main)/_components/layout/EpicLayout"

interface EpicsPageProps {
    params: {
        projectId: Id<"projects">
    }
}

const EpicsPage = ({ params }: EpicsPageProps) => {
    const id = params.projectId

    const project = useQuery(api.projects.getProjectById, {
        projectId: id
    })

    return (
        <EpicLayout projectId={id} />
    )
}

export default EpicsPage;
