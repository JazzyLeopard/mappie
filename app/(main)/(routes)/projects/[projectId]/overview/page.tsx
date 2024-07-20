'use client'
import CommonLayout from "@/app/(main)/_components/layout/CommonLayout";
import { menuItems } from "@/app/(main)/_components/constants";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import InlineEditor from "@ckeditor/ckeditor5-build-inline";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

type ProjectOverviewPageProps = {
    params: {
        projectId: Id<"projects">;
    };
}

const ProjectOverviewPage = ({ params }: ProjectOverviewPageProps) => {

    const [projectDetails, setProjectDetails] = useState<any>()

    const id = params.projectId;

    const updateProjectMutation = useMutation(api.projects.updateProject)

    const project = useQuery(api.projects.getProjectById, {
        projectId: id,
    });

    useEffect(() => {
        if (project)
            setProjectDetails(project)
    }, [project])


    const updateLabel = (val: string) => {
        setProjectDetails({ ...projectDetails, title: val });
    };

    const handleEditorBlur = async () => {
        try {
            console.log('time for API call', projectDetails);
            const { _creationTime, createdAt, updatedAt, userId, ...payload } = projectDetails
            await updateProjectMutation(payload)
        } catch (error) {
            console.log('error updating project', error);
        }
    };

    const handleEditorChange = (event: any, editor: InlineEditor, attribute: string) => {
        const data = editor.getData();
        setProjectDetails({ ...projectDetails, [attribute]: data });
    };

    if (project instanceof Error) {
        return <div>Error: {project.message}</div>;
    }

    if (projectDetails) {
        return <CommonLayout
            data={projectDetails}
            menu={menuItems}
            onEditorBlur={handleEditorBlur}
            updateLabel={updateLabel}
            handleEditorChange={handleEditorChange} />
    }
}

export default ProjectOverviewPage;