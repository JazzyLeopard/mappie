"use client"

import FRLayout from '@/app/(main)/_components/layout/FRLayout';
import Spinner from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface FunctionalRequirementsProps {
    params: {
        projectId: Id<"projects">;
    };
}

const FunctionalRequirementsPage = ({ params }: FunctionalRequirementsProps) => {
    const projectId = params.projectId;
    const [content, setContent] = useState<any>([])
    const functionalRequirements = useQuery(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
        projectId
    });
    const createFR = useMutation(api.functionalRequirements.createFunctionalRequirement);
    const updateFR = useMutation(api.functionalRequirements.updateFunctionalRequirement);
    const deleteFR = useMutation(api.functionalRequirements.deleteFunctionalRequirement);

    useEffect(() => {
        if (functionalRequirements && functionalRequirements?.length > 0) {
            setContent(functionalRequirements);
        }
    }, [functionalRequirements]);

    const project = useQuery(api.projects.getProjectById, {
        projectId
    });

    const isOnboardingComplete = useMemo(() => {
        if (!project) return false;
        return project.overview?.trim() !== '';
    }, [project]);

    // Handler for manual FR creation
    const handleManualAddFR = useCallback(async () => {
        console.log("Starting manual FR creation...");
        try {
            const newFR = await createFR({
                projectId,
                title: "New Functional Requirement",
                description: "Enter requirement description here",
            });
            console.log("FR created successfully:", newFR);
            toast.success("Functional requirement created successfully");
        } catch (error) {
            console.error("Error creating FR:", error);
            toast.error("Failed to create functional requirement");
        }
    }, [projectId, createFR]);

    // Handlers
    const handleEditorChange = useCallback(async (frId: Id<"functionalRequirements">, field: string, value: any) => {
        try {
            await updateFR({
                id: frId,
                [field]: value
            });
        } catch (error) {
            console.error("Error updating FR:", error);
            toast.error("Failed to update functional requirement");
        }
    }, [updateFR]);

    const handleDeleteFR = useCallback(async (id: Id<"functionalRequirements">) => {
        try {
            await deleteFR({ id });
            setContent((prevContent: any[]) => prevContent.filter((Fr: any) => Fr._id !== id));
            toast.success("Functional requirement deleted");
        } catch (error) {
            console.error("Error deleting FR:", error);
            toast.error("Failed to delete functional requirement");
        }
    }, [deleteFR]);

    if (functionalRequirements === undefined || project === undefined) {
        return <Spinner size="lg" />;
    }

    return (
        <FRLayout
            projectId={projectId}
            handleEditorChange={handleEditorChange}
            onManualAddFR={handleManualAddFR}
            onDeleteFR={handleDeleteFR}
            functionalRequirements={content || []}
            isOnboardingComplete={isOnboardingComplete}
        />
    );
};

export default FunctionalRequirementsPage;
