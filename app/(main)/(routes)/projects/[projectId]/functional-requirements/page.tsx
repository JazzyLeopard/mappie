"use client"

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import FRLayout from '@/app/(main)/_components/layout/FRLayout';
import Spinner from '@/components/ui/spinner';
import { useAuth } from "@clerk/clerk-react";
import axios from 'axios';
import { toast } from 'sonner';
import { FunctionalRequirement } from '@/lib/types';

interface FunctionalRequirementsProps {
    params: {
        projectId: Id<"projects">;
    };
}

const FunctionalRequirementsPage = ({ params }: FunctionalRequirementsProps) => {
    const { getToken } = useAuth();
    const projectId = params.projectId;
    
    // Get all FRs for the project
    const functionalRequirements = useQuery(api.functionalRequirements.getFunctionalRequirementsByProjectId, { 
        projectId 
    });
    const project = useQuery(api.projects.getProjectById, { projectId });

    const isOnboardingComplete = useMemo(() => {
        if (!project) return false;
        
        const mandatoryFields = ["overview", "problemStatement", "userPersonas", "featuresInOut"];
        return mandatoryFields.every(field => {
            const value = project[field as keyof typeof project];
            return value && typeof value === 'string' && value.trim() !== '';
        });
    }, [project]);

    // Mutations
    const updateFR = useMutation(api.functionalRequirements.updateFunctionalRequirement);
    const createFR = useMutation(api.functionalRequirements.createFunctionalRequirement);
    const deleteFR = useMutation(api.functionalRequirements.deleteFunctionalRequirement);

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

    // Handler for AI-generated FR
    const handleGenerateFR = useCallback(async () => {
        console.log("Starting FR generation...");
        try {
            toast.loading("Generating functional requirements...");
            
            const token = await getToken();
            const response = await axios.post('/api/functional-requirements', {
                projectId,
                singleFR: false // Set to true for single FR generation
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.dismiss();
                toast.success("Functional requirements generated successfully");
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("Error generating FR:", error);
            toast.dismiss();
            toast.error(error instanceof Error ? error.message : "Failed to generate functional requirements");
        }
    }, [projectId, getToken]);

    const handleDeleteFR = useCallback(async (id: Id<"functionalRequirements">) => {
        try {
            await deleteFR({ id });
            toast.success("Functional requirement deleted");
        } catch (error) {
            console.error("Error deleting FR:", error);
            toast.error("Failed to delete functional requirement");
        }
    }, [deleteFR]);

    const handleFRNameChange = useCallback(async (frId: Id<"functionalRequirements">, title: string) => {
        try {
            await updateFR({
                id: frId,
                title
            });
        } catch (error) {
            console.error("Error updating FR title:", error);
            toast.error("Failed to update title");
        }
    }, [updateFR]);

    const handleEditorBlur = useCallback(async () => {
        // Handle any cleanup on editor blur if needed
    }, []);

    if (functionalRequirements === undefined || project === undefined) {
        return <Spinner size="lg" />;
    }

    return (
        <FRLayout
            projectId={projectId}
            handleEditorChange={handleEditorChange}
            onManualAddFR={handleManualAddFR}
            onGenerateFR={handleGenerateFR}
            onDeleteFR={handleDeleteFR}
            onEditorBlur={handleEditorBlur}
            onFRNameChange={handleFRNameChange}
            functionalRequirements={functionalRequirements as unknown as FunctionalRequirement[]}
            isOnboardingComplete={isOnboardingComplete}
            updateProject={() => Promise.resolve()}
        />
    );
};

export default FunctionalRequirementsPage;
