import { Button } from '@/components/ui/button';
import { Id } from '@/convex/_generated/dataModel';
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import Empty from "@/public/empty.png";
import { useAuth } from "@clerk/clerk-react";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import LexicalEditor from '@/app/(main)/_components/Lexical/LexicalEditor';
import AIStoryCreator from '@/ai/ai-chat';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ChevronDown, ChevronRight, BookOpen, Trash } from 'lucide-react'
import AiGenerationIcon from '@/icons/AI-Generation';
import { FunctionalRequirement } from '@/lib/types';
import LabelToInput from "@/app/(main)/_components/LabelToInput";
import { toast } from 'react-hot-toast';
import { Progress } from "@/components/ui/progress";

type SelectedItems = {
    fr: string | null;
}

interface FRLayoutProps {
    projectId: Id<"projects">;
    handleEditorChange: (frId: Id<"functionalRequirements">, field: string, value: any) => Promise<void>;
    onManualAddFR: () => Promise<void>;
    onGenerateFR: () => Promise<void>;
    onDeleteFR: (id: Id<"functionalRequirements">) => Promise<void>;
    onEditorBlur: () => Promise<void>;
    onFRNameChange: (frId: Id<"functionalRequirements">, title: string) => Promise<void>;
    functionalRequirements: FunctionalRequirement[];
    isOnboardingComplete: boolean;
    updateProject: (payload: any) => Promise<void>;
}

const FRLayout: React.FC<FRLayoutProps> = ({
    projectId,
    handleEditorChange,
    onManualAddFR,
    onGenerateFR,
    onDeleteFR,
    onEditorBlur,
    onFRNameChange,
    functionalRequirements,
    isOnboardingComplete,
    updateProject
}) => {
    const { getToken } = useAuth();
    const router = useRouter();
    const [selectedItems, setSelectedItems] = useState<SelectedItems>({
        fr: null
    });
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    const selectItem = useCallback((id: string) => {
        setSelectedItems({ fr: id });
    }, []);

    const selectedFR = functionalRequirements && functionalRequirements.length > 0 ? 
        functionalRequirements.find(fr => fr._id === selectedItems.fr) : 
        null;

    useEffect(() => {
        if (functionalRequirements && functionalRequirements.length > 0 && !selectedItems.fr) {
            selectItem(functionalRequirements[0]._id);
        }
    }, [functionalRequirements, selectedItems.fr, selectItem]);

    const handleInsertMarkdown = async (content: string) => {
        if (selectedItems.fr) {
            await handleEditorChange(selectedItems.fr as Id<"functionalRequirements">, 'description', content);
        }
    };

    const mandatoryFields = ["overview", "problemStatement", "userPersonas", "featuresInOut"];
    
    const handleManualAdd = async () => {
        console.log("Manual Add FR button clicked");
        try {
            await onManualAddFR();
        } catch (error) {
            console.error("Error in manual add:", error);
        }
    };

    const simulateProgress = () => {
        setGenerationProgress(prev => {
            if (prev >= 99) return prev;
            const remaining = 99 - prev;
            const increment = Math.max(0.5, remaining * 0.1);
            return Math.min(99, prev + increment);
        });
    };

    const handleGenerateSingleFR = async () => {
        if (!projectId) {
            toast.error("Please select a project first");
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setGenerationStatus('Generating a new requirement...');
        progressInterval.current = setInterval(simulateProgress, 300);

        try {
            const token = await getToken();
            const response = await fetch('/api/functional-requirements/single', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    projectId,
                }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No reader available');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(5).trim());
                            
                            if (data.error) {
                                throw new Error(data.error);
                            }
                            
                            if (data.done) {
                                if (progressInterval.current) {
                                    clearInterval(progressInterval.current);
                                }
                                setGenerationProgress(100);
                                setGenerationStatus('Complete!');
                                toast.success("New requirement generated successfully");
                                setTimeout(() => {
                                    setIsGenerating(false);
                                }, 1000);
                                if (onGenerateFR) {
                                    await onGenerateFR();
                                }
                                return;
                            }
                            
                            if (data.status) {
                                setGenerationStatus(data.status);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error generating requirement:", error);
            toast.error("Failed to generate requirement. Please try again.");
        } finally {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            setIsGenerating(false);
        }
    };

    const handleGenerateMultipleFRs = async () => {
        if (!projectId) {
            toast.error("Please select a project first");
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setGenerationStatus('Initializing...');

        progressInterval.current = setInterval(simulateProgress, 300);

        try {
            const token = await getToken();
            const response = await fetch('/api/functional-requirements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    projectId,
                    singleFR: false
                }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No reader available');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(5).trim());
                            
                            if (data.error) {
                                throw new Error(data.error);
                            }
                            
                            if (data.done) {
                                if (progressInterval.current) {
                                    clearInterval(progressInterval.current);
                                }
                                setGenerationProgress(100);
                                setGenerationStatus('Complete!');
                                toast.success("Functional requirements generated successfully");
                                setTimeout(() => {
                                    setIsGenerating(false);
                                }, 1000);
                                if (onGenerateFR) {
                                    await onGenerateFR();
                                }
                                return;
                            }
                            
                            if (data.status) {
                                setGenerationStatus(data.status);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error generating functional requirements:", error);
            toast.error("Failed to generate functional requirements. Please try again.");
        } finally {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, []);

    // Add this sorting function
    const sortFunctionalRequirements = (frs: any[]) => {
        return [...frs].sort((a, b) => {
            const getNumber = (title: string) => {
                const match = title.match(/FR-(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            };
            
            return getNumber(a.title) - getNumber(b.title);
        });
    };

    if (!isOnboardingComplete) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-6">
                <Image src={Empty} alt="No functional requirements" width={100} height={100} />
                <h2 className="text-xl font-semibold text-center">
                    Please complete all mandatory fields in the Project Overview:
                </h2>
                <ul className="list-disc text-gray-600">
                    <li>Overview</li>
                    <li>Problem Statement</li>
                    <li>User Personas</li>
                    <li>Features In/Out</li>
                </ul>
                <Button className="bg-white text-black border border-gray-300 hover:bg-gray-200"
                    onClick={() => router.push(`/projects/${projectId}`)}
                    variant="default"
                >
                    Go to Project Overview
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen gap-2 p-4">
            <div className="w-72">
                <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-100 rounded-xl h-full">
                    <div className="p-2 pt-4">
                        <div className="flex flex-col items-center space-y-2 mb-4">
                            <Button 
                                onClick={handleManualAdd} 
                                variant='ghost' 
                                className="w-full text-sm justify-start hover:bg-slate-200 pl-2"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add FR
                            </Button>
                            <Button 
                                onClick={handleGenerateSingleFR} 
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
                                {Array.isArray(functionalRequirements) && sortFunctionalRequirements(functionalRequirements).map(fr => {
                                    const truncatedTitle = fr.title.length > 22
                                        ? fr.title.substring(0, 22) + '...'
                                        : fr.title;
                                    return (
                                        <div key={fr._id} className="">
                                            <div
                                                className={`flex items-center rounded-lg pl-3 pr-1 py-1 hover:bg-slate-200 transition-colors ${
                                                    selectedItems.fr === fr._id ? 'bg-white font-semibold' : ''
                                                } cursor-pointer group`}
                                                onClick={() => selectItem(fr._id)}
                                            >
                                                <BookOpen className="h-3 w-3 mr-3" />
                                                <span className="flex-grow text-left text-sm w-3/4">
                                                    {truncatedTitle}
                                                </span>
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity w-1/6 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteFR(fr._id);
                                                        }}
                                                    >
                                                        <Trash className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <div className="flex flex-1 gap-2">
                {functionalRequirements && functionalRequirements.length > 0 ? (
                    <>
                        <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-4 bg-white rounded-xl">
                            {selectedItems.fr && selectedFR ? (
                                <div className="flex flex-col h-full">
                                    <header className="flex items-center justify-between px-4 pb-3 w-full">
                                        <LabelToInput
                                            value={selectedFR.title}
                                            setValue={(newTitle) => onFRNameChange(selectedItems.fr as Id<"functionalRequirements">, newTitle)}
                                            onBlur={() => {}}
                                        />
                                    </header>
                                    <div className="flex-1 overflow-y-auto flex px-4">
                                        <LexicalEditor
                                            key={selectedItems.fr}
                                            itemId={selectedItems.fr as Id<'functionalRequirements'>}
                                            onBlur={onEditorBlur}
                                            attribute="description"
                                            projectDetails={selectedFR}
                                            setProjectDetails={(value) => handleEditorChange(selectedFR._id, 'description', value)}
                                            context="functionalRequirement"
                                            isRichText={true}
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
                                {selectedItems.fr && (
                                    <AIStoryCreator
                                        key={`fr-${selectedItems.fr}`}
                                        onInsertMarkdown={handleInsertMarkdown}
                                        selectedItemContent={selectedFR?.description || ''}
                                        selectedItemType="functionalRequirement"
                                        selectedEpic={null}
                                        projectId={projectId}
                                        selectedItemId={selectedItems.fr as Id<'functionalRequirements'>}
                                        isCollapsed={false}
                                        toggleCollapse={() => {}}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-hidden w-full">
                        <div className="h-full flex flex-col items-center justify-center gap-6">
                            <Image src={Empty} alt="No functional requirements" width={100} height={100} />
                            <h2 className="text-xl font-semibold text-center">
                                You haven't created any functional requirements<br />for this project yet.
                            </h2>
                            <p className="text-center text-gray-600 max-w-md">
                                Based on the project details, the AI can generate
                                streamlined functional requirements that detail the actions of
                                the user and the system. Try it!
                            </p>
                            <Button
                                className="gap-2 h-10"
                                variant="default"
                                onClick={handleGenerateMultipleFRs}
                            >
                                <AiGenerationIconWhite />
                                Generate Initial Functional Requirements
                            </Button>
                            <div className="text-center">
                                <span className="text-gray-500">or</span>
                            </div>
                            <Button variant="outline" onClick={onManualAddFR}>
                                Add FR manually
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {isGenerating && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
                    <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-lg font-semibold">Generating Requirements</h3>
                            <Progress value={generationProgress} className="w-full" />
                            <p className="text-sm text-muted-foreground">{generationStatus}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FRLayout;