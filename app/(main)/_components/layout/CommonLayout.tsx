"use client"

import '@/app/custom.css';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from '@/convex/_generated/api';
import AiGenerationIcon from "@/icons/AI-Generation";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import type { MenuItemType, Project } from "@/lib/types";
import { useQuery, useMutation, ReactMutation } from 'convex/react';
import { BookOpen, ChevronDown, ChevronRight, Plus, Presentation, Rocket, Trash, X, FileText, Users, Target, List, BarChart2, Layers, AlertTriangle, InfoIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import LabelToInput from "../LabelToInput";
import PresentationMode from '../PresentationMode';
import LexicalEditor from "../Lexical/LexicalEditor";
import FileUpload from "./Context";
import { toTitleCase } from "@/utils/helper";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';

interface CommonLayoutProps {
    data: Project;
    menu: MenuItemType[];
    onEditorBlur: () => Promise<void>;
    handleEditorChange: (attribute: string, value: any) => void,
    showTitle?: boolean;
    mandatoryFields?: string[];
    updateProject: ReactMutation<any>;
}

const sectionIcons = {
    overview: <FileText className="w-4 h-4 inline-block mr-2" />,
    problemStatement: <AlertTriangle className="w-4 h-4 inline-block mr-2" />,
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
    showTitle = true,
    mandatoryFields = ["overview", "problemStatement", "userPersonas", "featuresInOut"],
    updateProject
}: CommonLayoutProps) => {

    const [activeSection, setActiveSection] = useState<string>('');
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [isGenerateButtonActive, setIsGenerateButtonActive] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isFrGenerated, setIsFrGenerated] = useState(false);
    const router = useRouter();

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

    const checkFunctionalRequirements = useQuery(api.functionalRequirements.getFunctionalRequirementsByProjectId, { projectId: data._id });

    useEffect(() => {
        if (checkFunctionalRequirements && checkFunctionalRequirements?.content) {
            setIsFrGenerated(true);
        }
    }, [checkFunctionalRequirements]);

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
        try {
            await router.push(`/projects/${data._id}/functional-requirements?generate=true`);
        }
        catch (error) {
            console.log("Error routing", error)
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

    const handleSectionChange = useCallback(async (field: string, value: any) => {
        try {
            // Skip if no changes
            if (!value || data[field as keyof typeof data] === value) {
                return;
            }

            await updateProject({
                ...data,
                [field]: value
            });

            // Call the parent handler if provided
            handleEditorChange(field, value);
        } catch (error) {
            console.error("Error updating project section:", error);
        }
    }, [data, handleEditorChange, updateProject]);

    const activeComponent = useMemo(() => 
        menu.find(c => c.key === activeSection),
        [menu, activeSection]
    );

    const editorProps = useMemo(() => ({
        key: `${activeComponent?.key}-${data[activeComponent?.key as keyof typeof data]}`,
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
        context: "project",
        itemId: data._id,
        updateProject
    }), [activeComponent?.key, data, onEditorBlur, handleSectionChange, updateProject]);

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
                                disabled={!isGenerateButtonActive || isFrGenerated}
                            >
                                <AiGenerationIcon />
                                <span className="ml-2 font-semibold">
                                    {isFrGenerated ? "FR Generated" : "Generate FR"}
                                </span>
                            </Button>
                        </div>
                    </div>
                    <div className="flex-col items-center px-2 pb-4">
                        <span className="text-sm font-semibold pl-2">Context</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <InfoIcon className="h-3 w-3 ml-2 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Add documents to provide more context for the AI when generating content for any section.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="px-2">
                            <FileUpload projectId={data._id} />
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-220px)]">
                        <div className="px-2">
                            <span className="text-sm pl-2 font-semibold">Sections</span>
                            <nav className="space-y-1 items-center pt-2">
                                {menu.map((component) => (
                                    <Link
                                        key={component.key}
                                        href="#"
                                        className={`block p-2 py-3 rounded-md text-sm ${activeSection === component.key ? "font-semibold bg-white" : "hover:bg-gray-200"}`}
                                        onClick={() => handleSectionClick(component.key)}
                                        prefetch={false}
                                    >
                                        {sectionIcons[component.key as keyof typeof sectionIcons]}
                                        {toTitleCase(component.key)}
                                        {mandatoryFields.includes(component.key) && (
                                            <span className="text-red-600 ml-1">*</span>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-4 bg-white rounded-xl">
                <div className="flex items-center justify-between px-4 pb-3 w-full">
                    {activeComponent && (
                        <h1 className="text-2xl font-semibold">
                            {toTitleCase(activeComponent.key)}
                        </h1>
                    )}
                    <Button
                        className="bg-white text-black border border-gray-300 hover:bg-gray-200 ml-auto"
                        onClick={togglePresentationMode}
                    >
                        <Presentation className="pr-2" />
                        Presentation Mode
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto flex px-4">
                    {activeComponent && <LexicalEditor {...{...editorProps, context: "project" as const}} />}
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
