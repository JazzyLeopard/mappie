'use client'
import { epicMenuItems, menuItems } from "@/app/(main)/_components/constants";
import ProjectLayout from "@/app/(main)/_components/projectLayout";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import InlineEditor from "@ckeditor/ckeditor5-build-inline";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

type EpicsPageProps = {
    params: {
        epicId: Id<"epics">;
    };
}

const ProjectOverviewPage = ({ params }: EpicsPageProps) => {

    const [projectDetails, setProjectDetails] = useState<any>()

    const id = params.epicId;

    const updateEpicMutation = useMutation(api.epics.updateEpic)

    const epic = useQuery(api.epics.getEpicById, {
        epicId: id,
    });

    useEffect(() => {
        if (epic)
            setProjectDetails(epic)
    }, [epic])

    const updateLabel = (val: string) => {
        setProjectDetails({ ...projectDetails, title: val });
    };

    const handleEditorBlur = async () => {
        try {
            console.log('time for API call', projectDetails);
            const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails
            await updateEpicMutation(payload)
        } catch (error) {
            console.log('error updating project', error);
        }
    };

    const handleEditorChange = (event: any, editor: InlineEditor, attribute: string) => {
        const data = editor.getData();
        setProjectDetails({ ...projectDetails, [attribute]: data });
    };


    if (epic instanceof Error) {
        return <div>Error: {epic.message}</div>;
    }

    if (projectDetails) {
        return <ProjectLayout
            project={projectDetails}
            menu={epicMenuItems}
            onEditorBlur={handleEditorBlur}
            updateLabel={updateLabel}
            handleEditorChange={handleEditorChange} />
    }
}

export default ProjectOverviewPage;