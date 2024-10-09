"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Id } from "@/convex/_generated/dataModel";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import Empty from "@/public/empty.png"; // Make sure this path is correct
import { useAuth } from "@clerk/nextjs";
import axios from 'axios';
import { GitPullRequest, Loader2, MoreVertical, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from 'react';
import { toast } from "sonner";
import UCEditorList from "./UCEditorList";

interface UseCasesLayoutProps {
    projectId: Id<"projects">;
    handleEditorChange: (id: Id<"useCases">, field: string, value: any) => void;
    onAddUseCase: () => Promise<void>;
    onDeleteUseCase: (id: Id<"useCases">) => Promise<void>
    useCases: any[]; // Add this line
    isOnboardingComplete: boolean
}

const UseCasesLayout = ({
    projectId,
    handleEditorChange,
    onAddUseCase,
    onDeleteUseCase,
    useCases,
    isOnboardingComplete
}: UseCasesLayoutProps) => {
    const { getToken } = useAuth();
    const [activeUseCase, setActiveUseCase] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
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

            toast.success("New Use Cases generated")
        } catch (error) {
            console.error("Failed to generate use cases:", error);
            toast.error("Failed to generate the use case. Please try again")
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateSingleUseCase = async () => {
        setIsGenerating(true);
        try {
            const token = await getToken({ template: "convex" });
            const response = await axios.post('/api/use-cases/single', { projectId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const useCaseData = response?.data?.useCase?.[0]

            console.log("use case data:", useCaseData);
            console.log("use case id:", useCaseData?.id);

            if (useCaseData === 'NULL') {
                toast.success("No additional use case needed")
            }
            else {
                toast.success("New Use Case generated")
            }

        } catch (error) {
            console.error("Failed to generate use cases:", error);
            toast.error("Failed to generate the use case. Please try again")
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePresentationMode = () => {
        console.log("Presentation mode");
    };

    return (
        <div className="h-screen flex overflow-y-auto">
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
                                        onClick={handleGenerateSingleUseCase}
                                    >
                                        <AiGenerationIconWhite />
                                        {isGenerating ? (
                                            <div className="absolute z-50 inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                                                <div className="rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 p-1 shadow-lg">
                                                    <div className="flex items-center space-x-4 rounded-lg bg-white px-6 py-4">
                                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                                        <p className="text-lg font-semibold text-gray-800">Generating AI content...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : "Generate use case"}
                                    </Button>
                                    <Button className="w-full h-10 hover:bg-slate-200 bg-transparent text-gray-500" size="sm"
                                        onClick={onAddUseCase}
                                    >
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
                            >
                                <AiGenerationIconWhite />
                                {isGenerating ? (
                                    <div className="relative z-50 inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                                        <div className="rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 p-1 shadow-lg">
                                            <div className="flex items-center space-x-4 rounded-lg bg-white px-6 py-4">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                                <p className="text-lg font-semibold text-gray-800">Generating AI content...</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : "Generate Use Cases"}
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
                            handleEditorChange={handleEditorChange}
                        />
                    )}
                </div>
                )
            }
        </div>
    );
};

export default UseCasesLayout;