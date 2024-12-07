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
import { BookTemplateIcon, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import LexicalEditor from "../Lexical/LexicalEditor";
import PresentationMode from '../PresentationMode';
import LabelToInput from "../LabelToInput";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TemplateGuideDialog } from "../TemplateGuideDialog";

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
            await router.push(`/projects/${data._id}/functional-requirements?generate=true`);
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

    return (
        <div className="flex h-screen gap-2 pt-4 pr-4 pb-4">
            <div className="flex flex-1 gap-2">
                <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-2 bg-white rounded-xl flex flex-col min-w-[50%] relative">
                    <div className="flex items-center justify-between px-2 pb-3 w-full overflow-x-auto sm:mr-2">
                        <div className="pl-10 mt-2 mr-2 flex flex-row gap-2">
                            <LabelToInput
                                value={data.title}
                                setValue={(newTitle) => handleEditorChange('title', newTitle)}
                                onBlur={onEditorBlur}
                            />
                            <Button 
                                variant="outline" 
                                className="ml-2"
                                onClick={() => setIsTemplateGuideOpen(true)}
                            >
                                <BookTemplateIcon className="w-4 h-4 mr-2" />
                                Use Project Template
                            </Button>
                        </div>
                        <div className="mr-8 mt-2">
                            <Button
                                onClick={handleGenerateFR}
                                className="bg-white text-black border border-gray-300 hover:bg-gray-200 ml-auto"
                                disabled={isFrGenerated || isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Generating FR...</span>
                                    </>
                                ) : (
                                    <>
                                        <AiGenerationIcon />
                                        <span className="ml-2 font-semibold">
                                            {isFrGenerated ? "FR Generated" : "Generate FR"}
                                        </span>
                                    </>
                                )}
                            </Button>
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
                            selectedItemType="overview"
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
                            Are you confident that you've provided enough information about the project to generate comprehensive Functional Requirements?
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
