"use client"

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import axios from 'axios';
import { useQuery } from "convex/react";
import { Presentation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { propertyPrompts } from '../constants';
import UCEditorList from "./UCEditorList";
import UCFieldList from "./UCFieldList";

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
            <div className="bg-white sticky z-999 flex items-center justify-between p-8">
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                    <Button onClick={handleGenerateUseCases} disabled={isGenerating}>
                        {isGenerating ? "Generating..." : "Generate Use Cases"}
                    </Button>
                    <Button
                        className="bg-white text-black border border-gray-300 hover:bg-gray-200"
                        onClick={handlePresentationMode}
                    >
                        <Presentation className="pr-2" />
                        Presentation Mode
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden grid grid-cols-[0.3fr,1fr] gap-12 px-8">
                <div className="align-top">
                    <UCFieldList
                        useCases={useCases}
                        activeUseCase={activeUseCase}
                        setActiveUseCase={setActiveUseCase}
                        onDelete={handleDelete}
                        onAddUseCase={onAddUseCase}
                    />
                </div>
                <div className="overflow-hidden">
                    <UCEditorList
                        useCases={useCases}
                        activeUseCase={activeUseCase}
                        onEditorBlur={onEditorBlur}
                        handleEditorChange={handleEditorChange}
                        propertyPrompts={propertyPrompts}
                        onOpenBrainstormChat={onOpenBrainstormChat}
                    />
                </div>
            </div>
        </div>
    );
};

export default UseCasesLayout;