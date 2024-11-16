"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Id } from "@/convex/_generated/dataModel"
import AiGenerationIconWhite from "@/icons/AI-Generation-White"
import empty from "@/public/empty.png"
import { useAuth } from "@clerk/nextjs"
import { GitPullRequest, Loader2, MoreVertical, Plus, Trash } from "lucide-react"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import LexicalEditor from '@/app/(main)/_components/Lexical/LexicalEditor'
import AIStoryCreator from '@/ai/ai-chat'
import LabelToInput from "@/app/(main)/_components/LabelToInput"
import AiGenerationIcon from '@/icons/AI-Generation'

type SelectedItems = {
  useCase: string | null;
}

interface UseCasesLayoutProps {
  params: {
    projectId: Id<"projects">;
    useCaseId?: Id<"useCases">;
  };
  handleEditorChange: (useCaseId: Id<"useCases">, field: string, value: any) => Promise<void>;
  onAddUseCase: () => Promise<void>;
  onDeleteUseCase: (id: Id<"useCases">) => Promise<void>;
  onEditorBlur: () => Promise<void>;
  onUseCaseNameChange: (useCaseId: Id<"useCases">, name: string) => Promise<void>;
  useCases: any[];
  isOnboardingComplete: boolean;
  updateProject: (payload: any) => Promise<void>;
}

export default function UseCasesLayout({
  params,
  handleEditorChange,
  onAddUseCase,
  onDeleteUseCase,
  onEditorBlur,
  onUseCaseNameChange,
  useCases,
  isOnboardingComplete,
  updateProject
}: UseCasesLayoutProps) {
  const router = useRouter()
  const { getToken } = useAuth()

  // Initialize selected items with the first use case if available, otherwise null
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    useCase: null
  })

  // Select a use case
  const selectItem = useCallback((id: string) => {
    setSelectedItems({ useCase: id })
  }, [])

  // Get selected use case
  const selectedUseCase = useCases?.find(uc => uc._id === selectedItems.useCase)

  const handleInsertMarkdown = async (content: string) => {
    if (selectedItems.useCase) {
      await handleEditorChange(selectedItems.useCase as Id<"useCases">, 'description', content)
    }
  }

  useEffect(() => {
    if (useCases?.length > 0 && !selectedItems.useCase) {
      selectItem(useCases[0]._id)
    }
  }, [useCases, selectedItems.useCase, selectItem])

  const renderUseCase = (useCase: any) => {
    const isSelected = selectedItems.useCase === useCase._id

    return (
      <div key={useCase._id} className="">
        <div
          className={`flex items-center rounded-lg px-4 py-1 hover:bg-slate-200 transition-colors ${
            isSelected ? 'bg-white font-semibold' : ''
          } cursor-pointer group`}
          onClick={() => selectItem(useCase._id)}
        >
          <span className="flex-grow text-left text-sm w-3/4">
            {useCase.title}
          </span>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity w-1/4 justify-end">
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
    )
  }

  if (!isOnboardingComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <Image src={empty} alt="No use cases" width={100} height={100} />
        <h2 className="text-xl font-semibold text-center">
          Please complete all mandatory fields in the Project Overview <br /> before proceeding to Use Cases.
        </h2>
      </div>
    )
  }

  return (
    <div className="flex h-screen gap-2 p-4">
      <div className="w-72">
        <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-100 rounded-xl h-full">
          <div className="p-2 pt-4">
            <div className="flex flex-col items-center space-y-2 mb-4">
              <Button onClick={onAddUseCase} variant='ghost' className="w-full text-sm justify-start hover:bg-slate-200 pl-2">
                <Plus className="mr-2 h-4 w-4" /> Add Use Case
              </Button>
              <Button onClick={onAddUseCase} variant='ghost' className="w-full text-sm justify-start hover:bg-slate-200 pl-2">
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
                        className={`flex items-center rounded-lg pl-3 pr-1 py-1 hover:bg-slate-200 transition-colors ${
                          selectedItems.useCase === useCase._id ? 'bg-white font-semibold' : ''
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
                      value={selectedUseCase.title}
                      setValue={(newTitle) => onUseCaseNameChange(selectedItems.useCase as Id<"useCases">, newTitle)}
                      onBlur={() => {}}
                    />
                  </header>
                  <div className="flex-1 overflow-y-auto flex px-4">
                    <LexicalEditor
                      key={selectedItems.useCase}
                      itemId={selectedItems.useCase as Id<'useCases'>}
                      onBlur={onEditorBlur}
                      attribute="description"
                      projectDetails={selectedUseCase}
                      setProjectDetails={(value) => handleEditorChange(selectedUseCase._id, 'description', value)}
                      context="useCase"
                      isRichText={true}
                      updateProject={updateProject}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a use case to edit</p>
                </div>
              )}
            </div>

            <div className="w-2/5">
              <div className="shadow-sm bg-white rounded-xl h-full">
                {selectedItems.useCase && (
                  <AIStoryCreator
                    key={`usecase-${selectedItems.useCase}`}
                    onInsertMarkdown={handleInsertMarkdown}
                    selectedItemContent={selectedUseCase?.description || ''}
                    selectedItemType="useCase"
                    selectedEpic={null}
                    projectId={params?.projectId as Id<'projects'>}
                    selectedItemId={selectedItems.useCase as Id<'useCases'>}
                    selectedItemName={selectedUseCase?.title || 'Untitled'}
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
                onClick={onAddUseCase}
              >
                <AiGenerationIconWhite />
                Generate Use Cases
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
    </div>
  )
}