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
import Image from "next/image";
import Empty from "@/public/empty.png";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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
    const searchParams = useSearchParams();

    useEffect(() => {
        setLocalContent(content);
        const shouldGenerate = searchParams?.get('generate') === 'true';
        if (shouldGenerate) {
            handleGenerateFR();
        }
    }, [content, searchParams]);

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

    const handleGenerateUseCases = async () => {
        // Implement the logic for generating use cases
        console.log("Generating Use Cases...");
    };

    const handleGenerateEpics = async () => {
        // Implement the logic for generating epics
        console.log("Generating Epics...");
    };

    return (
        <div className="h-screen flex flex-col z-top">
            <div className="bg-white sticky z-999 flex items-center justify-between px-12 pt-8 pb-2">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Functional Requirements</h1>
                </div>
                {content && (
                    <div className="flex items-center gap-4 ml-auto laptop-1024:ml-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    className="gap-2" 
                                    disabled={isGenerating}
                                >
                                    <AiGenerationIconWhite />
                                    {isGenerating ? "Generating..." : "Generate"}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="dropdown-content p-2">
                                <DropdownMenuItem onClick={handleGenerateUseCases} className="p-2">
                                    Generate Use Cases
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleGenerateEpics} className="p-2">
                                    Generate Epics
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            className="bg-white text-black border border-gray-300 hover:bg-gray-200"
                            onClick={() => {/* Implement presentation mode */ }}
                        >
                            <Presentation className="pr-2" />
                            Presentation Mode
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden px-12 pt-0">
                {!content ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6">
                        <Image src={Empty} alt="No functional requirements" width={100} height={100} />
                        <h2 className="text-xl font-semibold text-center">
                            You haven't created any functional requirements<br />for this project yet.
                        </h2>
                        <p className="text-center text-gray-600 max-w-md">
                            Based on the project details, the AI can generate
                            comprehensive functional requirements that outline
                            the system's behavior and capabilities. Give it a try!
                        </p>
                        <Button 
                            className="gap-2 h-10" 
                            variant="default" 
                            onClick={handleGenerateFR}
                            disabled={isGenerating}
                        >
                            <AiGenerationIconWhite />
                            {isGenerating ? "Generating..." : "Generate Functional Requirements"}
                        </Button>
                        <div className="text-center">
                            <span className="text-gray-500">or</span>
                        </div>
                        <Button variant="outline" onClick={() => onEditorChange("")}>
                            Add Functional Requirements manually
                        </Button>
                    </div>
                ) : (
                    <FREditorList
                        projectId={projectId}
                        frId={frId}
                        content={localContent}
                        onEditorChange={handleLocalEditorChange}
                        onOpenBrainstormChat={handleOpenBrainstormChat}
                        propertyPrompts={propertyPrompts}
                    />
                )}
            </div>
        </div>
    );
};

export default FRLayout;