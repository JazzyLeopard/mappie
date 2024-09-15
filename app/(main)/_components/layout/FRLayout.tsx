import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import Empty from "@/public/empty.png";
import { useAuth } from "@clerk/clerk-react";
import axios from 'axios';
import { useMutation } from 'convex/react';
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import FREditorList from './FREditorList';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react';

interface FRLayoutProps {
    projectId: Id<"projects">;
    frId: Id<"functionalRequirements"> | null;
    content: string;
    onEditorChange: (value: string) => void;
    propertyPrompts: any;
    isOnboardingComplete: boolean;
}

const FRLayout: React.FC<FRLayoutProps> = ({
    projectId,
    frId,
    content,
    onEditorChange,
    propertyPrompts,
    isOnboardingComplete
}) => {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const { getToken } = useAuth();
    const updateFunctionalRequirements = useMutation(api.functionalRequirements.updateFunctionalRequirement);
    const createFunctionalRequirements = useMutation(api.functionalRequirements.createFunctionalRequirement);
    const searchParams = useSearchParams();

    const hasGenerateRef = useRef(false);

    useEffect(() => {
        const shouldGenerate = searchParams?.get('generate') === 'true';
        if (shouldGenerate && !hasGenerateRef.current) {
            handleGenerateFR();
            hasGenerateRef.current = true;
        }
    }, [searchParams]);

    const handleGenerateFR = useCallback(async () => {
        if (content.trim() !== '') {
            console.log('Content already exists, skipping generation');
            return;
        }
        setIsGenerating(true);
        try {
            const token = await getToken({ template: "convex" });
            const response = await axios.post('/api/functional-requirements', { projectId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const newContent = response.data.content;
            onEditorChange(newContent);
            if (frId) {
                await updateFunctionalRequirements({ id: frId, content: newContent });
            } else {
                const newFrId = await createFunctionalRequirements({ projectId, content: newContent });
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
    }, [projectId, frId, content, getToken, onEditorChange, updateFunctionalRequirements, createFunctionalRequirements]);

    const handleRouteBack = useCallback(() => {
        router.push(`/projects/${projectId}`);
    }, [router, projectId]);

    const handleOpenBrainstormChat = useCallback(() => {
        // Implement if needed
    }, []);

    const handleGenerateUseCases = useCallback(async () => {
        // Implement the logic for generating use cases
        console.log("Generating Use Cases...");
    }, []);

    const handleGenerateEpics = useCallback(async () => {
        // Implement the logic for generating epics
        console.log("Generating Epics...");
    }, []);

    return (
        <div className="h-screen flex flex-col z-top">
            <div className="bg-white sticky z-999 flex items-center justify-between px-12 pt-8 pb-2">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Functional Requirements</h1>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-36">
                            <div className='flex items-center ml-auto'>
                                <AiGenerationIconWhite />
                                &nbsp;Generate
                                <ChevronDown className="h-4 w-4 ml-4" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-36">
                        <DropdownMenuItem>Use case</DropdownMenuItem>
                        <DropdownMenuItem>Epics</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex-1 flex justify-center items-center w-full overflow-hidden px-12 pt-0">
                {!isOnboardingComplete ? (
                    <div className=" h-full flex flex-col items-center justify-center gap-6">
                        <Image src={Empty} alt="No functional requirements" width={100} height={100} />
                        <h2 className="text-xl font-semibold text-center">
                            Please complete all mandatory fields in the Project Overview <br /> before proceeding to Functional Requirements..
                        </h2>
                    </div>)
                    : isOnboardingComplete && !content ? (
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
                    ) :
                    (
                        <FREditorList
                        projectId={projectId}
                        frId={frId}
                        content={content}
                        onEditorChange={onEditorChange}
                        onOpenBrainstormChat={handleOpenBrainstormChat}
                        propertyPrompts={propertyPrompts}
                        onEditorBlur={async () => {
                            // Implement if needed
                        }}
                    />
                    )
                }
            </div>
        </div>
    );
};

export default FRLayout;