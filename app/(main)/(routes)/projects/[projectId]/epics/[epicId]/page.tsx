'use client'
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout";
import { epicMenuItems, menuItems } from "@/app/(main)/_components/constants";
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

    const [epicDetails, setEpicDetails] = useState<any>()

    const id = params.epicId;

    const updateEpicMutation = useMutation(api.epics.updateEpic)

    const epic = useQuery(api.epics.getEpicById, {
        epicId: id,
    });

    useEffect(() => {
        if (epic)
            setEpicDetails(epic)
    }, [epic])

    const updateLabel = (val: string) => {
        setEpicDetails({ ...epicDetails, title: val });
    };

    const handleEditorBlur = async () => {
        try {
            console.log('time for API call', epicDetails);
            const { _creationTime, createdAt, updatedAt, userId, ...payload } = epicDetails
            await updateEpicMutation(payload)
        } catch (error) {
            console.log('error updating project', error);
        }
    };

    const handleEditorChange = (event: any, editor: InlineEditor, attribute: string) => {
        const data = editor.getData();
        setEpicDetails({ ...epicDetails, [attribute]: data });
    };


    if (epic instanceof Error) {
        return <div>Error: {epic.message}</div>;
    }

    if (epicDetails) {
        return <CommonLayout
            data={epicDetails}
            menu={epicMenuItems}
            onEditorBlur={handleEditorBlur}
            updateLabel={updateLabel}
            handleEditorChange={handleEditorChange} />
    }
}

export default ProjectOverviewPage;