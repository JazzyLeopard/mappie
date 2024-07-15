// Add the 'use client' directive at the top of the file
'use client';

// Import necessary modules
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import Steps from '../../../../_components/Steps'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Define the interface for props
interface ProjectOverviewPageProps {
    params: {
        projectId: Id<"projects">;
    };
}

// Define the functional component
const Onboarding = ({ params }: ProjectOverviewPageProps) => {
    // Extract projectId from params
    const id = params.projectId;
    const router = useRouter()

    // Fetch project data using useQuery hook
    const project = useQuery(api.projects.getProjectById, {
        projectId: id,
    });


    useEffect(() => {
        if (project && project.onboarding === 0) {
            router.push(`/projects/${project._id}`);
        }
    }, [project, router]);

    if (!project) {
        return <>Error</>;
    }

    // Return JSX for rendering
    return (
        <>
            {project?.onboarding != 0 && <Steps project={project} />}
        </>
    );
};

// Export the component as default
export default Onboarding;



