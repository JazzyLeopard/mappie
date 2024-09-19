'use client'

import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import EpicLayout from "@/app/(main)/_components/layout/EpicLayout"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Spinner } from "@chakra-ui/react"

interface EpicsPageProps {
    params: {
        projectId: Id<"projects">
    }
}

const EpicsPage = ({ params }: EpicsPageProps) => {
    const id = params.projectId

    const [content, setContent] = useState<any[]>([])
    const epics = useQuery(api.epics.getEpics, { projectId: id }) || [];
    const router = useRouter();


    useEffect(() => {
        if (epics && epics?.length > 0) {
            setContent(epics);
        }
    }, [epics]);

    if (epics === undefined) {
        return <Spinner size={"lg"} />;
    }

    return (
        <EpicLayout
            projectId={id}
            epics={content}
        />
    )

}

export default EpicsPage;
