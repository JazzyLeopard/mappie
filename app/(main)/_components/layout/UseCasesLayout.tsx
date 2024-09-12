"use client"

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import axios from 'axios';
import { useQuery, useMutation } from "convex/react";
import { Presentation, MoreHorizontal, Trash, Plus, FileIcon, MoreVertical, PresentationIcon, GitPullRequest, SeparatorHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { propertyPrompts } from '../constants';
import UCEditorList from "./UCEditorList";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import Image from "next/image";
import Empty from "@/public/empty.png"; // Make sure this path is correct
import AiGenerationIcon from "@/icons/AI-Generation";
import { Separator } from "@/components/ui/separator";
interface UseCasesLayoutProps {
    projectId: Id<"projects">;
    title: string;
    onEditorBlur: () => Promise<void>;
    updateLabel: (val: string) => void;
    handleEditorChange: (id: Id<"useCases">, field: string, value: any) => void;
    onAddUseCase: () => Promise<void>;
    propertyPrompts: typeof propertyPrompts;
    onOpenBrainstormChat: () => void;
    useCases: any[]; // Add this line
    isOnboardingComplete: boolean
}

const UseCasesLayout = ({
    projectId,
    title,
    onEditorBlur,
    updateLabel,
    handleEditorChange,
    onAddUseCase,
    propertyPrompts,
    onOpenBrainstormChat,
    isOnboardingComplete

}: UseCasesLayoutProps) => {
    const [activeUseCase, setActiveUseCase] = useState<string | null>(null);
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const { getToken } = useAuth();
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const useCases = useQuery(api.useCases.getUseCasesByProjectId, { projectId }) || [];
    const deleteUseCase = useMutation(api.useCases.deleteUseCase);

    useEffect(() => {
        if (useCases.length > 0 && !activeUseCase) {
            setActiveUseCase(useCases[0]._id);
        }
    }, [useCases, activeUseCase]);

    const handleDelete = async (id: Id<"useCases">) => {
        try {
            await deleteUseCase({ id });
            if (activeUseCase === id) {
                setActiveUseCase(null);
            }
            toast.success("Use case deleted successfully");
        } catch (error) {
            console.error("Error deleting use case:", error);
            toast.error("Failed to delete use case");
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
        <div className="h-screen flex overflow-hidden justify-center items-center w-full">
            {!isOnboardingComplete ? (
                <div className="h-full flex flex-col items-center justify-center gap-6">
                    <Image src={Empty} alt="No functional requirements" width={100} height={100} />
                    <h2 className="text-xl font-semibold text-center">
                        Please complete all mandatory fields in the Project Overview <br /> before proceeding to Use Cases.
                    </h2>
                </div>) :
                useCases.length > 0 && (
                    <div className="flex-grow overflow-y-auto px-4 pt-8">
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
                                                        handleDelete(useCase._id);
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
                )}
            {isOnboardingComplete &&
                <div className={`flex-1 overflow-hidden ${useCases.length === 0 ? 'w-full' : ''}`}>
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
            }
        </div>
    );
};

export default UseCasesLayout;