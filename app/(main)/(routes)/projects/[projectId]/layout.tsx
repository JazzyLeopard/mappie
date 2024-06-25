"use client"
import ProjectNavbar from "@/app/(main)/_components/ProjectNavbar"
import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ReactNode } from "react";
import { useQuery } from "convex/react";

interface ProjectProps {
    params: {
        projectId: Id<"projects">;
    };
    children: ReactNode;
}

const ProjectLayout =  ({ params, children }: ProjectProps) => {
    const id = params.projectId;
    const projectTitle =  useQuery(api.projects.getProjectNameById, {
        projectId: id,
    });

    if (projectTitle === undefined) {
        return <div className="flex justify-center items-center mx-auto"><Spinner /></div>;
    }
    return (
        <div className="pb-40">
            <div className="min-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
                <ProjectNavbar projectTitle={projectTitle} projectId={id} />
                <div className="pl-[96px]">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default ProjectLayout