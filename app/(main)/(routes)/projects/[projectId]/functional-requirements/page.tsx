"use client"

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import FRLayout from '@/app/(main)/_components/layout/FRLayout';
import Spinner from '@/components/ui/spinner';
import debounce from 'lodash/debounce';
import { propertyPrompts } from '@/app/(main)/_components/constants';

interface FunctionalRequirementsProps {
    params: {
        projectId: Id<"projects">;  // Ensure this is typed correctly
    };
}

const FunctionalRequirementsPage = ({ params }: FunctionalRequirementsProps) => {
    // Add validation
    if (!params.projectId || typeof params.projectId !== 'string') {
        throw new Error('Invalid project ID');
    }

    const projectId = params.projectId as Id<"projects">;
    const functionalRequirements = useQuery(api.functionalRequirements.getFunctionalRequirementsByProjectId, { projectId });
    const updateFunctionalRequirement = useMutation(api.functionalRequirements.updateFunctionalRequirement);
    const createFunctionalRequirement = useMutation(api.functionalRequirements.createFunctionalRequirement);
    const [content, setContent] = useState('');
    const [frId, setFrId] = useState<Id<"functionalRequirements"> | null>(null);

    const project = useQuery(api.projects.getProjectById, {
        projectId: projectId,
    });

    useEffect(() => {
        if (functionalRequirements) {
            setContent(functionalRequirements.content || '');
            setFrId(functionalRequirements._id);
        }
    }, [functionalRequirements]);

    const debouncedUpdate = useCallback(
        debounce(async (value: string) => {
            if (frId) {
                try {
                    const result = await updateFunctionalRequirement({
                        id: frId,
                        content: value
                    });
                    console.log("Update result:", result);
                    if (result === null) {
                        console.log("Update successful (null result)");
                    } else {
                        console.log("Update successful with result:", result);
                    }
                } catch (error) {
                    console.error("Error updating functional requirement:", error);
                }
            } else {
                const result = await createFunctionalRequirement({projectId, content: value})
                console.log("FR Created:", result);
                console.warn("Cannot update: frId is null");
            }
        }, 1000),
        [frId, updateFunctionalRequirement]
    );

    const handleEditorChange = useCallback((value: string) => {
        console.log('Editor content changed:', value);
        setContent(value);
        debouncedUpdate(value);
    }, [debouncedUpdate]);

    if (functionalRequirements === undefined) {
        return <Spinner size={"lg"} />;
    }

    return (
        <FRLayout
            projectId={projectId}
            frId={frId}
            content={content}
            onEditorChange={handleEditorChange}
            propertyPrompts={propertyPrompts}
            isOnboardingComplete={project?.onboarding == 0}
        />
    );
};

export default FunctionalRequirementsPage;
