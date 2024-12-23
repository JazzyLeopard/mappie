"use client"

import AIStoryCreator from '@/ai/ai-chat';
import '@/app/custom.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import AiGenerationIcon from "@/icons/AI-Generation";
import type { Project } from "@/lib/types";
import { cn } from '@/lib/utils';
import { ReactMutation, useQuery } from 'convex/react';
import { BookTemplateIcon, Loader2, ChevronDown } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import LexicalEditor from "../Lexical/LexicalEditor";
import PresentationMode from '../PresentationMode';
import LabelToInput from "../LabelToInput";
import { TemplateGuideDialog } from "../TemplateGuideDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AiGenerationIconWhite from '@/icons/AI-Generation-White';

interface CommonLayoutProps {
    data: Project;
    onEditorBlur: () => Promise<void>;
    handleEditorChange: (attribute: string, value: any) => Promise<void>,
    projectId: Id<"projects">;
    parent: 'project' | 'epic';
}


const CommonLayout = ({
    data,
    onEditorBlur,
    handleEditorChange,
    projectId,
    parent
}: CommonLayoutProps) => {

    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isFrGenerated, setIsFrGenerated] = useState(false);
    const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTemplateGuideOpen, setIsTemplateGuideOpen] = useState(false);

    // Check if the functional requirements are already generated
    const functionalRequirements = useQuery(api.functionalRequirements.getFunctionalRequirementsByProjectId, {
        projectId: data._id
    });

    useEffect(() => {
        if (functionalRequirements) {
            const hasValidContent =
                functionalRequirements.length > 0 &&
                typeof functionalRequirements[0].description === 'string' &&
                functionalRequirements[0].description.trim().length > 0;

            setIsFrGenerated(hasValidContent as boolean);
        } else {
            setIsFrGenerated(false);
        }
    }, [functionalRequirements]);


    if (isPresentationMode) {
        return <PresentationMode data={data} onClose={() => setIsPresentationMode(false)} />;
    }

    const handleGenerateFR = () => {
        if (!isFrGenerated) {
            setIsConfirmModalOpen(true);
        }
    };

    const confirmGenerateFR = async () => {
        setIsConfirmModalOpen(false);
        setIsGenerating(true);

        try {
            await router.push(`/epics/${data._id}/functional-requirements?generate=true`);
        } catch (error) {
            console.error('Error generating FR:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate functional requirements');
            setIsFrGenerated(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleAIChat = () => {
        setIsAIChatCollapsed(!isAIChatCollapsed);
    };

    // Update the handleInsertMarkdown function
    const handleInsertMarkdown = useCallback((content: string) => {
        if (typeof window === 'undefined') return;

        try {
            if ((window as any).__insertMarkdown) {
                (window as any).__insertMarkdown(content);
            }

            handleEditorChange('overview', content);
        } catch (error) {
            console.error("Error updating content:", error);
            toast.error("Failed to update content");
        }
    }, [data._id, handleEditorChange]);

    const handleUseTemplate = useCallback((content: string) => {
        handleInsertMarkdown(content);
        setIsTemplateGuideOpen(false);
    }, [handleInsertMarkdown]);

    const handleGenerateUseCases = async () => {
        try {
            await router.push(`/epics/${data._id}/use-cases?generate=true`);
        } catch (error) {
            console.error('Error generating use cases:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate use cases');
        }
    };

    const handleGenerateFeatures = async () => {
        try {
            await router.push(`/epics/${data._id}/features?generate=true`);
        } catch (error) {
            console.error('Error generating features:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to generate features');
        }
    };

    return (
        <div className="flex h-screen gap-2 pt-4 pr-4 pb-4">
            <div className="flex flex-1 gap-2">
                <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-2 bg-white rounded-xl flex flex-col min-w-[50%] relative">
                    <div className="overflow-x-auto pb-3 px-2 sm:mr-2">
                        <div className="pl-10 mt-2 mr-2 flex flex-row gap-4">
                            <LabelToInput
                                value={data.title}
                                setValue={(newTitle) => handleEditorChange('title', newTitle)}
                                onBlur={onEditorBlur}
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsTemplateGuideOpen(true)}
                                >
                                    <BookTemplateIcon className="w-4 h-4 mr-2" />
                                    Use Epic Template
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-blue-300 text-white font-semibold hover:shadow-lg transition-all duration-300"
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    <span>Generating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AiGenerationIconWhite />
                                                    <span className="mx-2 font-semibold">Generate</span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={handleGenerateFR}
                                            disabled={isFrGenerated}
                                        >
                                            <AiGenerationIcon className="mr-2" />
                                            {isFrGenerated ? "FR Generated" : "Generate Functional Requirements"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleGenerateUseCases}>
                                            <AiGenerationIcon className="mr-2" />
                                            Generate Use Cases
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleGenerateFeatures}>
                                            <AiGenerationIcon className="mr-2" />
                                            Generate Features & Stories
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 min-h-0 relative" withShadow={true}>
                        <div className="px-12 relative min-h-full">
                            <LexicalEditor
                                key={`overview-${data._id}`}
                                itemId={data._id}
                                onBlur={async () => { }}
                                attribute="overview"
                                projectDetails={data}
                                setProjectDetails={(value) => handleEditorChange('overview', value)}
                                context="project"
                                isRichText={true}
                            />
                        </div>
                    </ScrollArea>
                </div>

                <div className={cn(
                    `group/sidebar ${isAIChatCollapsed ? 'w-16' : 'w-[33%]'} max-w-[600px] transition-width duration-300`,
                    isResetting && "transition-all ease-in-out duration-300"
                )}>
                    <div className="shadow-sm bg-white rounded-xl h-full">
                        <AIStoryCreator
                            key={`section-overview`}
                            onInsertMarkdown={handleInsertMarkdown}
                            selectedItemContent={data.overview || ''}
                            selectedItemType="Project"
                            selectedEpic={null}
                            selectedItemId={data._id}
                            projectId={projectId}
                            isCollapsed={isAIChatCollapsed}
                            toggleCollapse={toggleAIChat}
                        />
                    </div>
                </div>
            </div>

            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="pb-2">Generate Functional Requirements</DialogTitle>
                        <DialogDescription className="pb-2">
                            Are you confident that you've provided enough information about the epic to generate comprehensive Functional Requirements?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                        <Button onClick={confirmGenerateFR}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TemplateGuideDialog
                isOpen={isTemplateGuideOpen}
                onClose={() => setIsTemplateGuideOpen(false)}
                onUseTemplate={handleUseTemplate}
            />
        </div>
    );
};

export default CommonLayout;
