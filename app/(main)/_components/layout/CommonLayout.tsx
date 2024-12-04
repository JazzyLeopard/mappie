"use client"

import AIStoryCreator from '@/ai/ai-chat';
import '@/app/custom.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import AiGenerationIcon from "@/icons/AI-Generation";
import type { MenuItemType, Project } from "@/lib/types";
import { cn } from '@/lib/utils';
import { toTitleCase } from "@/utils/helper";
import { ReactMutation, useQuery } from 'convex/react';
import { AlertTriangle, BarChart2, FileQuestion, FileText, InfoIcon, Layers, List, Loader2, Presentation, Target, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import LexicalEditor from "../Lexical/LexicalEditor";
import PresentationMode from '../PresentationMode';
import FileUpload from "./Context";
import LabelToInput from "../LabelToInput";

interface CommonLayoutProps {
    data: Project;
    menu: MenuItemType[];
    onEditorBlur: () => Promise<void>;
    handleEditorChange: (attribute: string, value: any) => void,
    mandatoryFields?: string[];
    updateProject: ReactMutation<any>;
    projectId: Id<"projects">;
}

const sectionIcons = {
    overview: <FileText className="w-4 h-4 inline-block mr-2" />,
    problemStatement: <FileQuestion className="w-4 h-4 inline-block mr-2" />,
    userPersonas: <Users className="w-4 h-4 inline-block mr-2" />,
    featuresInOut: <List className="w-4 h-4 inline-block mr-2" />,
    successMetrics: <BarChart2 className="w-4 h-4 inline-block mr-2" />,
    userScenarios: <Target className="w-4 h-4 inline-block mr-2" />,
    featurePrioritization: <Layers className="w-4 h-4 inline-block mr-2" />,
    risksDependencies: <AlertTriangle className="w-4 h-4 inline-block mr-2" />
};

const CommonLayout = ({
    data,
    menu,
    onEditorBlur,
    handleEditorChange,
    mandatoryFields = ["overview", "problemStatement", "userPersonas", "featuresInOut"],
    updateProject,
    projectId
}: CommonLayoutProps) => {

    const [activeSection, setActiveSection] = useState<string>('');
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [isGenerateButtonActive, setIsGenerateButtonActive] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isFrGenerated, setIsFrGenerated] = useState(false);
    const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!activeSection && menu.length > 0) {
            setActiveSection(menu[0].key);
        }
    }, [menu, activeSection]);

    useEffect(() => {
        const requiredFields = ["overview", "problemStatement", "userPersonas", "featuresInOut"];
        const allFieldsHaveContent = requiredFields.every(field => {
            const value = data[field];
            return value && typeof value === 'string' && value.trim() !== '';
        });
        setIsGenerateButtonActive(allFieldsHaveContent);
    }, [data]);

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

    const togglePresentationMode = () => {
        setIsPresentationMode(!isPresentationMode);
    };

    if (isPresentationMode) {
        return <PresentationMode data={data} onClose={() => setIsPresentationMode(false)} />;
    }

    const handleGenerateFR = () => {
        setIsConfirmModalOpen(true);
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

    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    // Helper function to clean the data object
    const cleanDataForUpdate = useCallback((data: any) => {
        // Fields that are allowed in the update
        const allowedFields = [
            '_id',
            'featurePrioritization',
            'featuresInOut',
            'isArchived',
            'isPublished',
            'onboarding',
            'overview',
            'problemStatement',
            'risksDependencies',
            'successMetrics',
            'title',
            'userPersonas',
            'userScenarios'
        ];

        // Create a new object with only allowed fields
        return Object.fromEntries(
            Object.entries(data)
                .filter(([key]) => allowedFields.includes(key))
                .filter(([_, value]) => value !== undefined)
        );
    }, []);

    // Update the handleSectionChange function
    const handleSectionChange = useCallback(async (field: string, value: any) => {
        try {
            if (!value || data[field as keyof typeof data] === value) {
                return;
            }

            const cleanData = cleanDataForUpdate({
                _id: data._id,
                [field]: value
            });

            await updateProject(cleanData);
            handleEditorChange(field, value);
        } catch (error) {
            console.error("Error updating project section:", error);
            toast.error("Failed to save changes");
        }
    }, [data, handleEditorChange, updateProject, cleanDataForUpdate]);

    const activeComponent = useMemo(() =>
        menu.find(c => c.key === activeSection),
        [menu, activeSection]
    );

    // Separate editorKey from other props
    const editorKey = useMemo(() =>
        `${activeComponent?.key}-${data[activeComponent?.key as keyof typeof data]}`,
        [activeComponent?.key, data]
    );

    const editorProps = useMemo(() => ({
        onBlur: onEditorBlur,
        attribute: activeComponent?.key || '',
        projectDetails: data,
        setProjectDetails: (value: any) => {
            console.log('Editor change:', {
                section: activeComponent?.key,
                value
            });
            handleSectionChange(activeComponent?.key || '', value);
        },
        isRichText: true,
        context: "project" as const,
        itemId: data._id,
        updateProject
    }), [activeComponent?.key, data, onEditorBlur, handleSectionChange, updateProject]);

    const toggleAIChat = () => {
        setIsAIChatCollapsed(!isAIChatCollapsed);
    };

    // Update the handleInsertMarkdown function
    const handleInsertMarkdown = useCallback((content: string) => {
        if (typeof window === 'undefined' || !activeSection) return;

        try {
            if ((window as any).__insertMarkdown) {
                (window as any).__insertMarkdown(content);
            }

            const cleanData = cleanDataForUpdate({
                _id: data._id,
                [activeSection]: content
            });

            updateProject(cleanData);
        } catch (error) {
            console.error("Error updating content:", error);
            toast.error("Failed to update content");
        }
    }, [activeSection, data._id, updateProject, cleanDataForUpdate]);

    return (
        <div className="flex h-screen gap-2 pt-4 pr-4 pb-4">
            <div className="flex flex-1 gap-2">
                <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-2 bg-white rounded-xl flex flex-col min-w-[50%]">
                    <div className="flex items-center justify-between px-2 pb-3 w-full overflow-x-auto sm:mr-2">
                        <div className="pl-10 mt-2">
                            <LabelToInput
                                value={data.title}
                                setValue={(newTitle) => {
                                    handleSectionChange('title', newTitle);
                                }}
                                onBlur={onEditorBlur}
                            />
                        </div>
                        <div className="mr-8 mt-2">
                            <Button
                                onClick={handleGenerateFR}
                                className="bg-white text-black border border-gray-300 hover:bg-gray-200 ml-auto"
                                disabled={!isGenerateButtonActive || isGenerating}
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
                                            {isFrGenerated ? "Regenerate FR" : "Generate FR"}
                                    </span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 min-h-0 pr-8 pl-8" withShadow={true}>
                        <LexicalEditor
                            key={`overview-${data.overview}`}
                            {...editorProps}
                        />
                    </ScrollArea>
                </div>

                <div className={cn(
                    `group/sidebar ${isAIChatCollapsed ? 'w-16' : 'w-[40%]'} max-w-[600px] transition-width duration-300`,
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
        </div>
    );
};

export default CommonLayout;
