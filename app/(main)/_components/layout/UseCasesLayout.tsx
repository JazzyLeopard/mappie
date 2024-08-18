"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import LabelToInput from "../LabelToInput";
import UCFieldList from "./UCFieldList";
import UCEditorList from "./UCEditorList";
import { Presentation } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import axios from 'axios';
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { propertyPrompts } from '../constants';

interface UseCasesLayoutProps {
    projectId: Id<"projects">;
    title: string;
    onEditorBlur: () => Promise<void>;
    updateLabel: (val: string) => void;
    handleEditorChange: (id: Id<"useCases">, field: string, value: any) => void;
    onAddUseCase: () => Promise<void>;
    propertyPrompts: typeof propertyPrompts;
    onOpenBrainstormChat: () => void; // Added this line
}

const UseCasesLayout = ({
    projectId,
    title,
    onEditorBlur,
    updateLabel,
    handleEditorChange,
    onAddUseCase,
    propertyPrompts,
    onOpenBrainstormChat // Added this line
}: UseCasesLayoutProps) => {
    const [activeUseCase, setActiveUseCase] = useState<string | null>(null);
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const { getToken } = useAuth();
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    // Use Convex's live query to fetch use cases
    const useCases = useQuery(api.useCases.getUseCasesByProjectId, { projectId }) || [];

    useEffect(() => {
        if (useCases.length > 0 && !activeUseCase) {
            setActiveUseCase(useCases[0]._id);
        }
    }, [useCases, activeUseCase]);

    const handleDelete = (deletedId: Id<"useCases">) => {
        if (activeUseCase === deletedId) {
            setActiveUseCase(null);
        }
    };

    const handleRouteBack = () => {
        router.push(`/projects/${projectId}`);
    };

    const handleGenerateUseCases = async () => {
        setIsGenerating(true);
        try {
            const token = await getToken({ template: "convex" });
            const response = await axios.post('/api/use-cases', { projectId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Generated use cases:', response.data.useCases);
        } catch (error) {
            console.error("Failed to generate use cases:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePresentationMode = () => {
        console.log("Presentation mode");
    };

    const handleAIEnhance = async (content: string, promptType: string) => {
        try {
            const token = await getToken({ template: "convex" });
            const response = await axios.post('/api/enhance-content', 
                { content, promptType, projectId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return response.data.enhancedContent;
        } catch (error) {
            console.error("Failed to enhance content:", error);
            return content;
        }
    };

    return (
        <div className="h-screen flex flex-col z-top">
            <div className="bg-white sticky top-10 z-999 flex items-center justify-between p-8">
                <div className="flex-1">
                    <LabelToInput
                        value={title}
                        setValue={updateLabel}
                        onBlur={onEditorBlur}
                    />
                </div>
                <div className="flex items-center gap-4 ml-auto">
                    <Button onClick={onAddUseCase}>
                        Add Use Case
                    </Button>
                    <Button onClick={handleGenerateUseCases} disabled={isGenerating}>
                        {isGenerating ? "Generating..." : "Generate Use Cases"}
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

            <div className="overflow-hidden grid grid-cols-[0.5fr,1fr] gap-8 px-8 pt-10">
                <div className="align-top">
                    <UCFieldList
                        useCases={useCases}
                        activeUseCase={activeUseCase}
                        setActiveUseCase={setActiveUseCase}
                        onDelete={handleDelete}
                    />
                </div>
                <div className="overflow-hidden">
                    <UCEditorList
                        useCases={useCases}
                        activeUseCase={activeUseCase}
                        onEditorBlur={onEditorBlur}
                        handleEditorChange={handleEditorChange}
                        propertyPrompts={propertyPrompts}
                        onOpenBrainstormChat={onOpenBrainstormChat} // Added this line
                    />
                </div>
            </div>
        </div>
    );
};

export default UseCasesLayout;