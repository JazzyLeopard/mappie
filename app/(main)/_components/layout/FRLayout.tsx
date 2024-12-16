import AIStoryCreator from '@/ai/ai-chat';
import LabelToInput from "@/app/(main)/_components/LabelToInput";
import LexicalEditor from '@/app/(main)/_components/Lexical/LexicalEditor';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import AiGenerationIcon from '@/icons/AI-Generation';
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import { cn } from '@/lib/utils';
import Empty from "@/public/empty.png";
import { useAuth } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { BookOpen, Plus, Trash } from 'lucide-react';
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

type SelectedItems = {
    fr: string | null;
}
interface FRLayoutProps {
    projectId: Id<"projects">;
    handleEditorChange: (frId: Id<"functionalRequirements">, field: string, value: any) => Promise<void>;
    onManualAddFR: () => Promise<void>;
    onDeleteFR: (id: Id<"functionalRequirements">) => Promise<void>;
    functionalRequirements: any[];
    isOnboardingComplete: boolean;
}

const FRLayout: React.FC<FRLayoutProps> = ({
    projectId,
    handleEditorChange,
    onManualAddFR,
    onDeleteFR,
    functionalRequirements,
    isOnboardingComplete,
}) => {
    const { getToken } = useAuth();
    const router = useRouter();
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');
    const [isGenerating, setIsGenerating] = useState<"functionalRequirements" | "singleFunctionalRequirement" | null>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    const [selectedItems, setSelectedItems] = useState<SelectedItems>({
        fr: null
    });

    const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const onCreateFR = useMutation(api.functionalRequirements.createFunctionalRequirement);

    const updateFR = useMutation(api.functionalRequirements.updateFunctionalRequirement);

    const selectItem = useCallback((id: string) => {
        setSelectedItems({ fr: id });
    }, []);

    const selectedFR = functionalRequirements && functionalRequirements.length > 0 ?
        functionalRequirements.find(fr => fr._id === selectedItems.fr) :
        null;

    const searchParams = useSearchParams();
    const hasGenerated = useRef(false);

    // Effect to handle auto-generation when generate=true
    useEffect(() => {
        if (!searchParams || hasGenerated.current) return;

        const shouldGenerate = searchParams.get('generate') === 'true';
        if (shouldGenerate && !isGenerating) {
            handleGenerateMultipleFRs();
            hasGenerated.current = true;
        }
    }, [searchParams, isGenerating]);

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

    const handleFRNameChange = useCallback((frId: Id<"functionalRequirements">, field: string, value: any) => {
        // Skip if no changes or no value
        if (!value || !frId) {
            return;
        }

        // Single update to database
        updateFR({
            id: frId,
            [field]: value
        }).catch((error: any) => {
            console.error("Error updating functional requirements:", error);
        });
    }, [updateFR]);

    const handleGenerateSingleFR = async () => {
        if (!projectId) {
            toast.error("Please select a project first");
            return;
        }

        setIsGenerating("singleFunctionalRequirement");
        setGenerationProgress(0);
        setGenerationStatus('Initializing functional requirement generation...');
        progressInterval.current = setInterval(simulateProgress, 300);

        try {
            // Create empty FR first
            const newFR = await onCreateFR({
                projectId,
                title: 'New Functional Requirement',
                description: ''
            });

            const frId = newFR?._id as Id<'functionalRequirements'>;
            selectItem(frId);

            const token = await getToken();
            const response = await fetch('/api/functional-requirements-simple/single-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
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

            // Process the stream
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
                            if (data.status) {
                                setGenerationStatus(data.status);
                            }

                            if (data.done && data?.content && 'title' in data.content) {
                                // Create new FR
                                const newFR = await onCreateFR({
                                    projectId,
                                    title: data.content.title,
                                    description: JSON.stringify(data.content.description)
                                });

                                if (!newFR?._id) {
                                    console.error('Failed to create FR:', data.content.title);
                                    continue;
                                }

                                // Update the editor state with the Lexical format
                                await handleEditorChange(
                                    newFR._id,
                                    'description',
                                    data.content.description
                                );

                                // Update progress and status
                                if (progressInterval.current) {
                                    clearInterval(progressInterval.current);
                                }
                                setIsGenerating(null);
                                setGenerationProgress(100);
                                setGenerationStatus('Complete!');
                                toast.success("Additional functional requirement generated successfully");
                                // Clean up
                                setTimeout(() => {
                                    setIsGenerating(null);
                                }, 1000);

                                return;
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                            toast.error("Error processing requirements data");
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Error generating requirement:", error);
            toast.error("Failed to generate requirement");
        } finally {
            // Ensure cleanup happens even if there's an error
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            setIsGenerating(null);
        }
    };

    const handleGenerateMultipleFRs = async () => {
        if (!projectId) {
            toast.error("Please select a project first");
            return;
        }

        setIsGenerating("functionalRequirements");
        setGenerationProgress(0);
        setGenerationStatus('Initializing functional requirement generation...');
        progressInterval.current = setInterval(simulateProgress, 300);

        try {
            const token = await getToken();
            const response = await fetch('/api/functional-requirements-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
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

                            // Handle status updates
                            if (data.status) {
                                setGenerationStatus(data.status);
                            }

                            // Handle parsed requirements data
                            if (data.type === 'requirements' && Array.isArray(data.content)) {
                                // Process each requirement
                                for (const requirement of data.content) {
                                    try {
                                        // Create new FR
                                        const newFR = await onCreateFR({
                                            projectId,
                                            title: requirement.title,
                                            description: JSON.stringify(requirement.description)
                                        });

                                        if (!newFR?._id) {
                                            console.error('Failed to create FR:', requirement.title);
                                            continue;
                                        }

                                        // Update the editor state with the Lexical format
                                        await handleEditorChange(
                                            newFR._id,
                                            'description',
                                            requirement.description
                                        );

                                    } catch (error) {
                                        console.error('Error processing requirement:', error);
                                        toast.error(`Failed to process requirement: ${requirement.title}`);
                                    }
                                }

                                // Update progress and status
                                if (progressInterval.current) {
                                    clearInterval(progressInterval.current);
                                }
                                setIsGenerating(null);
                                setGenerationProgress(100);
                                setGenerationStatus('Complete!');
                                toast.success("Requirements generated successfully");
                                // Clean up
                                setTimeout(() => {
                                    setIsGenerating(null);
                                }, 1000);

                                return;
                            }

                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                            toast.error("Error processing requirements data");
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
            setIsGenerating(null);
        }
    };

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

    const toggleAIChat = () => {
        setIsAIChatCollapsed(!isAIChatCollapsed);
    };

    // Add progress simulation function
    const simulateProgress = () => {
        setGenerationProgress(prev => {
            if (prev >= 99) return prev;
            const remaining = 99 - prev;
            const increment = Math.max(0.5, remaining * 0.1);
            return Math.min(99, prev + increment);
        });
    };



    if (!isOnboardingComplete) {
        return (
            <div className="pt-4 pb-4 pr-4 w-full h-screen">
                <div className="bg-white h-full rounded-xl flex flex-col items-center justify-center gap-4">
                    <Image src={Empty} alt="No functional requirements" width={100} height={100} className="w-16 h-16 md:w-24 md:h-24" />
                    <h2 className="text-xl font-semibold text-center">
                        Please fill in the project details first.
                    </h2>
                    <Button className="bg-white text-black border border-gray-300 hover:bg-gray-200"
                        onClick={() => router.push(`/projects/${projectId}`)}
                        variant="default"
                    >
                        Go to Project Overview
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen gap-2 pt-4 pr-4 pb-4">
            <div className="w-72">
                <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-100 rounded-xl h-full">
                    <div className="p-2 pt-4">
                        <div className="flex flex-col items-center space-y-2 mb-4">
                            <Button
                                onClick={onManualAddFR}
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
                                                className={`flex items-center rounded-lg pl-3 pr-1 py-1 hover:bg-slate-200 transition-colors ${selectedItems.fr === fr._id ? 'bg-white font-semibold' : ''
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
                                            key={`${selectedFR._id}-${selectedFR.title}`}
                                            value={selectedFR.title}
                                            setValue={(newTitle) => handleFRNameChange(selectedFR._id as Id<"functionalRequirements">, 'title', newTitle)}
                                            onBlur={() => { }}
                                        />
                                    </header>
                                    <ScrollArea className="flex-1 min-h-0 pr-2" withShadow={true}>
                                        <LexicalEditor
                                            key={selectedItems.fr}
                                            itemId={selectedItems.fr as Id<'functionalRequirements'>}
                                            onBlur={async () => { }}
                                            attribute="description"
                                            projectDetails={selectedFR}
                                            setProjectDetails={(value) => handleEditorChange(selectedFR._id, 'description', value)}
                                            context="functionalRequirement"
                                            isRichText={true}
                                        />
                                    </ScrollArea>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">Select a functional requirement to edit</p>
                                </div>
                            )}
                        </div>

                        <div className={cn(
                            `group/sidebar ${isAIChatCollapsed ? 'w-16' : 'w-[40%]'} max-w-[600px] transition-width duration-300`,
                            isResetting && "transition-all ease-in-out duration-300"
                        )}>
                            <div className="shadow-sm bg-white rounded-xl h-full">
                                {selectedItems.fr && (
                                    <AIStoryCreator
                                        key={`fr-${selectedFR?.title}`}
                                        onInsertMarkdown={handleInsertMarkdown}
                                        selectedItemContent={selectedFR?.description || ''}
                                        selectedItemType="functionalRequirement"
                                        selectedEpic={null}
                                        projectId={projectId}
                                        selectedItemId={selectedItems.fr as Id<'functionalRequirements'>}
                                        isCollapsed={isAIChatCollapsed}
                                        toggleCollapse={toggleAIChat}
                                        selectedItemTitle={selectedFR?.title || ''}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-hidden rounded-xl w-full">
                        <div className="bg-white h-full flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6">
                            <Image
                                src={Empty}
                                alt="No functional requirements"
                                width={80}
                                height={80}
                                className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px]"
                            />
                            <h2 className="text-lg sm:text-xl font-semibold text-center px-2">
                                <span className="block sm:inline">You haven't created any functional requirements </span>
                                <span className="block sm:inline">for this project yet.</span>
                            </h2>
                            <p className="text-center text-gray-600 max-w-md text-sm sm:text-base px-4">
                                Based on the project details, the AI can generate
                                streamlined functional requirements that detail the actions of
                                the user and the system. Try it!
                            </p>
                            <Button
                                className="gap-2 h-9 sm:h-10 text-sm sm:text-base w-full sm:w-auto px-3 sm:px-4"
                                variant="default"
                                onClick={handleGenerateMultipleFRs}
                            >
                                <AiGenerationIconWhite />
                                <span className="hidden sm:inline">Generate Initial Functional Requirements</span>
                                <span className="sm:hidden">Generate Requirements</span>
                            </Button>
                            <div className="text-center">
                                <span className="text-gray-500 text-sm sm:text-base">or</span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={onManualAddFR}
                                className="text-sm sm:text-base h-9 sm:h-10"
                            >
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
                            <h3 className="text-lg font-semibold">{isGenerating === "functionalRequirements" ? "Generating Initial Functional Requirements based on project details..." : "Generating an additional Functional Requirement..."}</h3>
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