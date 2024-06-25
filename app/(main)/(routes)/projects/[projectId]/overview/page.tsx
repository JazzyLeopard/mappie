'use client'
import WriteProjectInfo from "@/app/(main)/_components/WriteProjectInfo";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

interface ProjectOverviewPageProps {
    params: {
        projectId: Id<"projects">;
    };
}

const ProjectOverviewPage = ({ params }: ProjectOverviewPageProps) => {

    const id = params.projectId;

    const project = useQuery(api.projects.getProjectById, {
        projectId: id,
    });

    if (project instanceof Error) {
        return <div>Error: {project.message}</div>;
    }

    if (project) {
        return <WriteProjectInfo project={project} />
    }
}

export default ProjectOverviewPage;