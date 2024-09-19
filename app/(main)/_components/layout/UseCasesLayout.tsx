"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import Empty from "@/public/empty.png"; // Make sure this path is correct
import { useAuth } from "@clerk/nextjs";
import axios from 'axios';
import { useMutation } from "convex/react";
import { GitPullRequest, MoreVertical, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from 'react';
import { propertyPrompts } from '../constants';
import UCEditorList from "./UCEditorList";

interface UseCasesLayoutProps {
    projectId: Id<"projects">;
    onEditorBlur: () => Promise<void>;
    handleEditorChange: (id: Id<"useCases">, field: string, value: any) => void;
    onAddUseCase: () => Promise<void>;
    onDeleteUseCase: (id: Id<"useCases">) => Promise<void>
    propertyPrompts: typeof propertyPrompts;
    onOpenBrainstormChat: () => void;
    useCases: any[]; // Add this line
    isOnboardingComplete: boolean
}

const UseCasesLayout = ({
    projectId,
    onEditorBlur,
    handleEditorChange,
    onAddUseCase,
    onDeleteUseCase,
    propertyPrompts,
    onOpenBrainstormChat,
    useCases,
    isOnboardingComplete

}: UseCasesLayoutProps) => {
    const [activeUseCase, setActiveUseCase] = useState<string | null>(null);
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const { getToken } = useAuth();
    const [isPresentationMode, setIsPresentationMode] = useState(false);

    const searchParams = useSearchParams();
    const hasGenerateRef = useRef(false);

    useEffect(() => {
        const shouldGenerate = searchParams?.get('generate') === 'true';
        if (shouldGenerate && !hasGenerateRef.current) {
            handleGenerateUseCases();
            hasGenerateRef.current = true;
        }
    }, [searchParams]);

    useEffect(() => {
        if (useCases?.length > 0 && !activeUseCase) {
            setActiveUseCase(useCases[0]._id);
        }
    }, [useCases, activeUseCase]);

    const handleRouteBack = () => {
        router.push(`/projects/${projectId}`);
    };

    const handleGenerateUseCases = async () => {
        if (useCases?.length > 0) {
            console.log('Use cases already exists, skipping generation...');
            return;
        }
        setIsGenerating(true);
        try {
            const token = await getToken({ template: "convex" });
            const response = await axios.post('/api/use-cases', { projectId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const newContent = response.data.useCases;
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
        <div className="h-screen flex overflow-auto">
            {useCases.length > 0 && (
                <aside className="w-96 flex flex-col">
                    <div className="flex-grow px-4 pt-8">
                        <div className="pl-4 text-lg font-semibold">
                            Use Cases
                        </div>
                        <div className="p-4 bg-white">
                            <div className="space-y-2 flex flex-col gap-4 items-center p-4 pt-8 bg-slate-100 rounded-md">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        className="w-full rounded-xl gap-2 h-10 bg-gradient-to-r from-blue-400 to-pink-400"
                                        variant="default"
                                        size="sm"
                                        onClick={handleGenerateUseCases}
                                        disabled={isGenerating}
                                    >
                                        <AiGenerationIconWhite />
                                        {isGenerating ? "Generating..." : "Generate use case"}
                                    </Button>
                                    <Button className="w-full h-10 hover:bg-slate-200 bg-transparent text-gray-500" size="sm" onClick={onAddUseCase}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add a use case
                                    </Button>
                                </div>
                                <Separator className="w-full bg-gray-200" />
                                <ul className="space-y-2 rounded-md w-full">
                                    {useCases.map((useCase) => (
                                        <li
                                            key={useCase._id}
                                            className={`flex items-center justify-between p-4 rounded-md cursor-pointer group ${activeUseCase === useCase._id ? "bg-white" : ""
                                                }`}
                                            onClick={() => setActiveUseCase(useCase._id)}
                                        >
                                            <div className="flex items-center min-w-0 flex-grow">
                                                <GitPullRequest className={`flex-shrink-0 mr-2 ${useCase.title.length > 0 ? 'w-4 h-4' : 'w-4 h-4'}`} />
                                                <span className="truncate text-sm">
                                                    {useCase.title}
                                                </span>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteUseCase(useCase._id);
                                                    }}>
                                                        <Trash className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
            {!isOnboardingComplete ? (
                <div className="h-full flex flex-col items-center justify-center gap-6">
                    <Image src={Empty} alt="No functional requirements" width={100} height={100} />
                    <h2 className="text-xl font-semibold text-center">
                        Please complete all mandatory fields in the Project Overview <br /> before proceeding to Use Cases.
                    </h2>
                </div>) :
                (<div className={`flex-1 overflow-hidden px-4 ${useCases.length === 0 ? 'w-full' : ''}`}>
                    {useCases.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6">
                            <Image src={Empty} alt="No use cases" width={100} height={100} />
                            <h2 className="text-xl font-semibold text-center">
                                You haven't created any use cases<br />for this project yet.
                            </h2>
                            <p className="text-center text-gray-600 max-w-md">
                                Based on the project details, the AI can generate
                                streamlined use cases that detail the actions of
                                the user and the system. Try it!
                            </p>
                            <Button
                                className="gap-2 h-10"
                                variant="default"
                                onClick={handleGenerateUseCases}
                                disabled={isGenerating}
                            >
                                <AiGenerationIconWhite />
                                {isGenerating ? "Generating..." : "Generate Use Cases"}
                            </Button>
                            <div className="text-center">
                                <span className="text-gray-500">or</span>
                            </div>
                            <Button variant="outline" onClick={onAddUseCase}>
                                Add Use Case manually
                            </Button>
                        </div>
                    ) : (
                        <UCEditorList
                            useCases={useCases}
                            activeUseCase={activeUseCase}
                            onEditorBlur={onEditorBlur}
                            handleEditorChange={handleEditorChange}
                            propertyPrompts={propertyPrompts}
                            onOpenBrainstormChat={onOpenBrainstormChat}
                        />
                    )}
                </div>
                )
            }
        </div>
    );
};

export default UseCasesLayout;