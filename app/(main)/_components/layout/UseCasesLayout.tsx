"use client"

import AIStoryCreator from '@/ai/ai-chat'
import LabelToInput from "@/app/(main)/_components/LabelToInput"
import LexicalEditor from '@/app/(main)/_components/Lexical/LexicalEditor'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from '@/convex/_generated/api'
import { Id } from "@/convex/_generated/dataModel"
import AiGenerationIcon from '@/icons/AI-Generation'
import AiGenerationIconWhite from "@/icons/AI-Generation-White"
import { cn } from '@/lib/utils'
import empty from "@/public/empty.png"
import { useAuth } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { GitPullRequest, Plus, Trash } from "lucide-react"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type SelectedItems = {
  useCase: string | null;
}

interface UseCasesLayoutProps {
  projectId: Id<"projects">
  handleEditorChange: (useCaseId: Id<"useCases">, field: string, value: any) => Promise<void>
  onAddUseCase: () => Promise<void>;
  onDeleteUseCase: (id: Id<"useCases">) => Promise<void>;
  useCases: any[];
  isOnboardingComplete: boolean;
}

export default function UseCasesLayout({
  projectId,
  handleEditorChange,
  onAddUseCase,
  onDeleteUseCase,
  useCases,
  isOnboardingComplete,
}: UseCasesLayoutProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [isGenerating, setIsGenerating] = useState<"useCases" | "singleUseCase" | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize selected items with the first use case if available, otherwise null
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    useCase: null
  })

  const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Select a use case
  const selectItem = useCallback((id: string) => {
    setSelectedItems({ useCase: id })
  }, [])

  // Get selected use case
  const selectedUseCase = useCases?.find(uc => uc._id === selectedItems.useCase)

  const updateUseCase = useMutation(api.useCases.updateUseCase)

  useEffect(() => {
    if (useCases?.length > 0 && !selectedItems.useCase) {
      selectItem(useCases[0]._id)
    }
  }, [useCases, selectedItems.useCase, selectItem])

  useEffect(() => {
    console.log('Selected use case changed:', selectedItems.useCase);
    console.log('Selected use case data:', selectedUseCase);
  }, [selectedItems.useCase, selectedUseCase]);


  const handleInsertMarkdown = async (content: string) => {
    if (selectedItems.useCase) {
      await handleEditorChange(selectedItems.useCase as Id<"useCases">, 'description', content)
    }
  }

  const toggleAIChat = () => {
    setIsAIChatCollapsed(!isAIChatCollapsed);
  };

  const handleUcChange = useCallback((UcId: Id<"useCases">, field: string, value: any) => {
    // Skip if no changes or no value
    if (!value || !UcId) {
      return;
    }

    // Single update to database
    updateUseCase({
      id: UcId,
      [field]: value
    }).catch((error: any) => {
      console.error("Error updating use case:", error);
    });
  }, [updateUseCase]);

  // Add progress simulation function
  const simulateProgress = () => {
    setGenerationProgress(prev => {
      if (prev >= 99) return prev;
      const remaining = 99 - prev;
      const increment = Math.max(0.5, remaining * 0.1);
      return Math.min(99, prev + increment);
    });
  };

  // Add generation handler
  const handleGenerateUseCases = async () => {
    if (!projectId) {
      toast.error("Please select a project first");
      return;
    }

    setIsGenerating("useCases");
    setGenerationProgress(0);
    setGenerationStatus('Initializing use case generation...');
    progressInterval.current = setInterval(simulateProgress, 300);

    try {
      const token = await getToken();
      const response = await fetch('/api/use-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: JSON.stringify({ projectId }),
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
                toast.success("Use cases generated successfully");
                setTimeout(() => {
                  setIsGenerating(null);
                }, 1000);
                if (onAddUseCase) {
                  await onAddUseCase();
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
      console.error("Error generating use cases:", error);
      toast.error("Failed to generate use cases. Please try again.");
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setIsGenerating(null);
    }
  };

  // Add generation handler
  const handleGenerateSingleUseCase = async () => {
    if (!projectId) {
      toast.error("Please select a project first");
      return;
    }

    setIsGenerating("singleUseCase");
    setGenerationProgress(0);
    setGenerationStatus('Initializing use case generation...');
    progressInterval.current = setInterval(simulateProgress, 300);

    try {
      const token = await getToken();
      const response = await fetch('/api/use-cases/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: JSON.stringify({ projectId }),
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
                toast.success("Additional use case generated successfully");
                setTimeout(() => {
                  setIsGenerating(null);
                }, 1000);
                if (onAddUseCase) {
                  await onAddUseCase();
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
      console.error("Error generating use cases:", error);
      toast.error("Failed to generate use cases. Please try again.");
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setIsGenerating(null);
    }
  };

  if (!isOnboardingComplete) {
    return (
      <div className="pt-4 pr-4 pb-4 w-full h-screen">
        <div className="bg-white h-full rounded-xl flex flex-col items-center justify-center gap-4">
          <Image src={empty} alt="No use cases" width={100} height={100} className="w-16 h-16 md:w-24 md:h-24" />
          <h2 className="text-lg md:text-xl font-semibold text-center">
            Project Overview is empty or missing.
          </h2>
          <Button
            variant="default"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            Go to Project Overview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen gap-2 pt-4 pb-4 pr-4">
      <div className="w-72">
        <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-100 rounded-xl h-full">
          <div className="p-2 pt-4">
            <div className="flex flex-col items-center space-y-2 mb-4">
              <Button onClick={onAddUseCase} variant='ghost' className="w-full text-sm justify-start hover:bg-slate-200 pl-2">
                <Plus className="mr-2 h-4 w-4" /> Add Use Case
              </Button>
              <Button onClick={handleGenerateSingleUseCase} variant='ghost' className="w-full text-sm justify-start hover:bg-slate-200 pl-2">
                <AiGenerationIcon />
                <span className="ml-2 font-semibold">Generate Use Case</span>
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="px-2">
              <span className="text-sm pl-2 font-semibold">Use Cases</span>
              <div className="pt-2">
                {useCases?.map(useCase => {
                  const truncatedTitle = useCase.title.length > 22
                    ? useCase.title.substring(0, 22) + '...'
                    : useCase.title;
                  return (
                    <div key={useCase._id} className="">
                      <div
                        className={`flex items-center rounded-lg pl-3 pr-1 py-1 hover:bg-slate-200 transition-colors ${selectedItems.useCase === useCase._id ? 'bg-white font-semibold' : ''
                          } cursor-pointer group`}
                        onClick={() => selectItem(useCase._id)}
                      >
                        <GitPullRequest className="h-3 w-3 mr-3" />
                        <span className="flex-grow text-left text-sm w-3/4">
                          {truncatedTitle}
                        </span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity w-1/6 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteUseCase(useCase._id)
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
        {useCases && useCases.length > 0 ? (
          <>
            <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-4 bg-white rounded-xl">
              {selectedItems.useCase && selectedUseCase ? (
                <div className="flex flex-col h-full">
                  <header className="flex items-center justify-between px-4 pb-3 w-full">
                    <LabelToInput
                      key={`${selectedUseCase._id}-${selectedUseCase.title}`}
                      value={selectedUseCase.title}
                      setValue={(newTitle) => handleUcChange(selectedUseCase._id, "title", newTitle)}
                      onBlur={() => { }}
                    />
                  </header>
                  <ScrollArea className="flex-1 min-h-0 pr-2" withShadow={true}>
                    <LexicalEditor
                      key={selectedItems.useCase as string}
                      itemId={selectedItems.useCase as Id<'useCases'>}
                      onBlur={async () => { }}
                      attribute="description"
                      projectDetails={selectedUseCase}
                      setProjectDetails={(value) => {
                        console.log('LexicalEditor value change:', value);
                        handleEditorChange(selectedUseCase._id as Id<"useCases">, 'description', value);
                      }}
                      context="useCase"
                      isRichText={true}
                    />
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a use case to edit</p>
                </div>
              )}
            </div>

            <div className={cn(
              `group/sidebar ${isAIChatCollapsed ? 'w-16' : 'w-[40%]'} max-w-[600px] transition-width duration-300`,
              isResetting && "transition-all ease-in-out duration-300"
            )}>
              <div className="shadow-sm bg-white rounded-xl h-full">
                {selectedItems.useCase && (
                  <AIStoryCreator
                    key={`usecase-${selectedUseCase?.title}`}
                    onInsertMarkdown={handleInsertMarkdown}
                    selectedItemContent={selectedUseCase?.description || ''}
                    selectedItemType="useCase"
                    selectedEpic={null}
                    projectId={projectId as Id<'projects'>}
                    selectedItemId={selectedItems.useCase as Id<'useCases'>}
                    isCollapsed={isAIChatCollapsed}
                    toggleCollapse={toggleAIChat}
                    selectedItemTitle={selectedUseCase?.title || ''}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-hidden w-full">
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <Image src={empty} alt="No use cases" width={100} height={100} />
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
                Generate Initial Use Cases
              </Button>
              <div className="text-center">
                <span className="text-gray-500">or</span>
              </div>
              <Button variant="outline" onClick={onAddUseCase}>
                Add Use Case manually
              </Button>
            </div>
          </div>
        )}
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-semibold">{isGenerating === "useCases" ? "Generating Initial Use Cases based on project details..." : "Generating an additional Use Case..."}</h3>
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{generationStatus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}