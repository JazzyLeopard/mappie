'use client'

import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import EpicLayout from "@/app/(main)/_components/layout/EpicLayout"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface EpicsPageProps {
    params: {
        projectId: Id<"projects">
    }
}

const EpicsPage = ({ params }: EpicsPageProps) => {
    const id = params.projectId

    const [content, setContent] = useState<any[]>([])
    const router = useRouter();


    const project = useQuery(api.projects.getProjectById, {
        projectId: id
    })
    if (project) {
        const data = useQuery(api.epics.getEpics, { projectId: project?._id }) || [];

        useEffect(() => {
            if (data && data?.length > 0) {
                setContent(data);
            }
        }, [data]);


        return (
            <EpicLayout
                projectId={id}
                epics={content}
            />
        )
    }
    else {
        router.push(`/projects`);
    }
}

export default EpicsPage;
