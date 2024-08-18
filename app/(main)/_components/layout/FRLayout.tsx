import React, { useState, useEffect } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import FREditorList from './FREditorList';
import { Button } from '@/components/ui/button';
import { Presentation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/clerk-react";
import axios from 'axios';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface FRLayoutProps {
    projectId: Id<"projects">;
    frId: Id<"functionalRequirements"> | null;
    content: string;
    onEditorChange: (value: string) => void;
    propertyPrompts: any;
}

const FRLayout: React.FC<FRLayoutProps> = ({
    projectId,
    frId,
    content,
    onEditorChange,
    propertyPrompts
}) => {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [localContent, setLocalContent] = useState(content);
    const { getToken } = useAuth();
    const updateFunctionalRequirements = useMutation(api.functionalRequirements.updateFunctionalRequirement);
    const createFunctionalRequirements = useMutation(api.functionalRequirements.createFunctionalRequirement);

    useEffect(() => {
        setLocalContent(content);
    }, [content]);

    const handleGenerateFR = async () => {
        setIsGenerating(true);
        try {
            const token = await getToken({ template: "convex" });
            console.log('Token received:', token); // Log the token (be careful with this in production)
            const response = await axios.post('/api/functional-requirements', { projectId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Generated functional requirements:', response.data.content);
            setLocalContent(response.data.content);
            onEditorChange(response.data.content);

            // Save the generated content to the functional requirements table
            if (frId) {
                await updateFunctionalRequirements({ id: frId, content: response.data.content });
            } else {
                const newFrId = await createFunctionalRequirements({ projectId, content: response.data.content });
                console.log("New FR created with ID:", newFrId);
            }
        } catch (error) {
            console.error("Failed to generate functional requirements:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response data:", error.response?.data);
                console.error("Response status:", error.response?.status);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRouteBack = () => {
        router.push(`/projects/${projectId}`);
    };

    const handleOpenBrainstormChat = () => {
        // Implement if needed
    };

    const handleLocalEditorChange = (value: string) => {
        setLocalContent(value);
        onEditorChange(value);
    };

    return (
        <div className="h-screen flex flex-col z-top">
            <div className="bg-white sticky top-10 z-999 flex items-center justify-between p-8">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Functional Requirements</h1>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                    <Button onClick={handleGenerateFR} disabled={isGenerating}>
                        {isGenerating ? "Generating..." : "Generate Functional Requirements"}
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-gray-400 to-gray-60 text-white"
                        onClick={() => {/* Implement presentation mode */}}
                    >
                        <Presentation className="pr-2" />
                        Presentation Mode
                    </Button>
                    <Button onClick={handleRouteBack}>
                        Back to Project
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden px-8 pt-10">
                <FREditorList
                    projectId={projectId}
                    frId={frId}
                    content={localContent}
                    onEditorChange={handleLocalEditorChange}
                    onOpenBrainstormChat={handleOpenBrainstormChat}
                    propertyPrompts={propertyPrompts}
                />
            </div>
        </div>
    );
};

export default FRLayout;