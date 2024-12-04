'use client'
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout";
import { epicMenuItems } from "@/app/(main)/_components/constants";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

type EpicsPageProps = {
    params: {
        projectId: Id<"projects">;
        epicId: Id<"epics">;
    };
}

const ProjectEpicPage = ({ params }: EpicsPageProps) => {

    const [epicDetails, setEpicDetails] = useState<any>()

    const id = params.epicId

    const updateEpicMutation = useMutation(api.epics.updateEpic)

    const epic = useQuery(api.epics.getEpicById, {
        epicId: id,
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

    const handleEditorChange = (attribute: string, value: any) => {
        setEpicDetails({ ...epicDetails, [attribute]: value });
    };


    if (epic instanceof Error) {
        return <div>Error: {epic.message}</div>;
    }

    if (epicDetails) {
        return <CommonLayout
            data={epicDetails}
            onEditorBlur={handleEditorBlur}
            handleEditorChange={handleEditorChange}
            updateProject={updateEpicMutation}
            projectId={params.projectId}
        />
    }
}

export default ProjectEpicPage;
