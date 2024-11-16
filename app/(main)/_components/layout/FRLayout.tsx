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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Spinner from '@/components/ui/spinner';
import LexicalEditor from '@/app/(main)/_components/Lexical/LexicalEditor';
import AIStoryCreator from '@/ai/ai-chat';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ChevronDown, ChevronRight, BookOpen, Trash } from 'lucide-react'
import AiGenerationIcon from '@/icons/AI-Generation';

interface FRLayoutProps {
    projectId: Id<"projects">;
    frId: Id<"functionalRequirements"> | null;
    content: string;
    onEditorChange: (value: string) => void;
    propertyPrompts: any;
    isOnboardingComplete: boolean;
    updateProject: (payload: any) => Promise<void>;
}

const FRLayout: React.FC<FRLayoutProps> = ({
    projectId,
    frId,
    content,
    onEditorChange,
    propertyPrompts,
    isOnboardingComplete,
    updateProject
}) => {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState<string | null>(null)
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

    const handleGenerateClick = (entity: string) => {
        setConfirmationModal(entity)
    }

    const confirmGenerate = async () => {
        <Spinner size={"lg"} />
        await router.push(`/projects/${projectId}/${confirmationModal}?generate=true`);
    }

    const handleInsertMarkdown = useCallback((markdown: string) => {
        onEditorChange(markdown);
        if (frId) {
            updateFunctionalRequirements({ id: frId, content: markdown });
        }
    }, [frId, onEditorChange, updateFunctionalRequirements]);

    return (
        <div className="flex h-screen gap-2 p-4">
            <div className="w-72">
                <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-100 rounded-xl h-full">
                    <div className="p-2 pt-4">
                        <div className="flex flex-col items-center space-y-2 mb-4">
                            <Button 
                                onClick={handleGenerateFR} 
                                variant='ghost' 
                                className="w-full text-sm justify-start hover:bg-slate-200 pl-2"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add FR
                            </Button>
                            <Button 
                                onClick={handleGenerateFR} 
                                variant='ghost' 
                                className="w-full text-sm justify-start hover:bg-slate-200 pl-2"
                            >
                                <AiGenerationIcon /> 
                                <span className="ml-2 font-semibold">Generate FR</span>
                            </Button>
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-220px)]">
                        <div className="px-2">
                            <span className="text-sm pl-2 font-semibold">Functional Requirements</span>
                            <div className="pt-2">
                                {/* FR list items will go here */}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <div className="flex flex-1 gap-2">
                {isOnboardingComplete ? (
                    <>
                        <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-4 bg-white rounded-xl">
                            {frId ? (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 overflow-y-auto flex">
                                        <LexicalEditor
                                            key={frId}
                                            itemId={frId as Id<'functionalRequirements'>}
                                            onBlur={async () => {
                                                // Handle blur if needed
                                            }}
                                            attribute="content"
                                            projectDetails={{
                                                _id: frId,
                                                content: content || ''
                                            }}
                                            setProjectDetails={(newDetails) => {
                                                onEditorChange(newDetails.content);
                                                if (frId) {
                                                    updateFunctionalRequirements({
                                                        id: frId,
                                                        content: newDetails.content
                                                    });
                                                }
                                            }}
                                            context="functionalRequirement"
                                            isRichText={true}
                                            updateProject={updateProject}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">Select a functional requirement to edit</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="w-2/5">
                            <div className="shadow-sm bg-white rounded-xl h-full">
                                <AIStoryCreator
                                    key={`fr-${frId}`}
                                    onInsertMarkdown={handleInsertMarkdown}
                                    selectedItemContent={content}
                                    selectedItemType="functionalRequirement"
                                    selectedItemName="Functional Requirements"
                                    selectedEpic={null}
                                    projectId={projectId}
                                    selectedItemId={frId as string}
                                    isCollapsed={false}
                                    toggleCollapse={() => {}}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-hidden w-full">
                        <div className="h-full flex flex-col items-center justify-center gap-6">
                            <Image src={Empty} alt="No functional requirements" width={100} height={100} />
                            <h2 className="text-xl font-semibold text-center">
                                Please complete all mandatory fields in the Project Overview <br /> before proceeding to Functional Requirements.
                            </h2>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={confirmationModal != null} onOpenChange={() => setConfirmationModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="pb-2">Generate {confirmationModal?.split('-').join(' ').toUpperCase()}</DialogTitle>
                        <DialogDescription className="pb-2">
                            Are you confident that you've provided enough information about the project to generate comprehensive {confirmationModal?.split('-').join(' ').toUpperCase()}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmationModal(null)}>Cancel</Button>
                        <Button onClick={confirmGenerate}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FRLayout;