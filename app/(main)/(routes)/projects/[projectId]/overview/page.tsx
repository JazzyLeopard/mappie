'use client'
import ProjectLayout from "@/app/(main)/_components/projectLayout";
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
        return <ProjectLayout project={project} />
    }
}

export default ProjectOverviewPage;