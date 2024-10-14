'use client'

import BlockEditor from "@/app/(main)/_components/BlockEditor"
import LabelToInput from "@/app/(main)/_components/LabelToInput"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import AiGenerationIconWhite from '@/icons/AI-Generation-White'
import Empty from "@/public/empty.png"
import { useAuth } from "@clerk/clerk-react"
import axios from "axios"
import { useMutation, useQuery } from "convex/react"
import { debounce } from "lodash"
import { BookIcon, MoreVertical, PackageIcon, Plus, Trash } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface EpicLayoutProps {
  projectId: Id<"projects">;
  onAddEpics: () => Promise<void>
  onDeleteEpic: (_id: Id<"epics">) => Promise<void>
  onEditorBlur: () => Promise<void>
  onEpicNameChange: (epicId: Id<"epics">, newName: string) => Promise<void>
  handleEditorChange: (_id: Id<"epics">, field: string, value: any) => void
  epics: any[]
}

export default function EpicLayout({
  projectId,
  epics,
  onAddEpics,
  onDeleteEpic,
  onEditorBlur,
  onEpicNameChange,
  handleEditorChange
}: EpicLayoutProps) {

  const [activeEpicId, setActiveEpicId] = useState<Id<"epics"> | null>(null);
  const [activeUserStoryId, setActiveUserStoryId] = useState<Id<"userStories"> | null>(null);

  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingUS, setIsGeneratingUS] = useState(false)

  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const hasGenerateRef = useRef(false);

  const functionalRequirements = useQuery(api.functionalRequirements.getFunctionalRequirementsByProjectId, { projectId });

  const userStories = useQuery(api.userstories.getUserStories,
    activeEpicId ? { epicId: activeEpicId } : "skip"
  )

  const selectedEpic = useQuery(api.epics.getEpicById,
    activeEpicId ? { epicId: activeEpicId } : "skip"
  )

  const selectedUserStory = useQuery(api.userstories.getUserStoryById,
    activeUserStoryId ? { userStoryId: activeUserStoryId } : "skip"
  )

  const createUserStory = useMutation(api.userstories.createUserStory)
  const updateUserStory = useMutation(api.userstories.updateUserStory)
  const deleteUserStory = useMutation(api.userstories.deleteUserStory)

  useEffect(() => {
    const shouldGenerate = searchParams?.get('generate') === 'true';
    if (shouldGenerate && !hasGenerateRef.current) {
      handleGenerateEpics();
      hasGenerateRef.current = true;
    }
  }, [searchParams]);

  useEffect(() => {
    if (epics && epics.length > 0 && !activeEpicId) {
      setActiveEpicId(epics[0]._id)
    }
  }, [epics, activeEpicId])

  useEffect(() => {
    if (userStories && userStories.length > 0 && !activeUserStoryId) {
      setActiveUserStoryId(userStories[0]._id)
    }
  }, [userStories, activeUserStoryId])

  const debouncedHandleEditorChange = useCallback(
    debounce((_id: Id<"epics">, field: string, value: any) => {
      handleEditorChange(_id, field, value);
    }, 1000),
    [handleEditorChange]
  );

  const handleUpdateUS = useCallback(
    async (_id: Id<"userStories">, field: 'description', value: any) => {
      await updateUserStory({ id: _id, [field]: value })
    }, [updateUserStory])

  const handleEditorChangeForUS = useCallback((_id: Id<"userStories">, field: string, value: any) => {
    handleUpdateUS(_id, field as 'description', value);
  }, [handleUpdateUS]);

  const debouncedHandleEditorChangeForUS = useCallback(
    debounce((id: Id<"userStories">, field: string, value: any) => {
      handleEditorChangeForUS(id, field, value);
    }, 1000),
    [handleEditorChangeForUS]
  );

  const handleGenerateEpics = async () => {
    setIsGenerating(true);
    try {
      const token = await getToken({ template: "convex" });
      const response = await axios.post('/api/epics', { projectId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('Generated epics:', response?.data?.epics);

      if (response && response.data.epics) {
        response.data.epics.forEach((epic: any) => {
          handleEditorChange(epic.id, 'name', epic?.name);
          handleEditorChange(epic.id, 'description', epic?.description);
          handleEditorChange(epic.id, 'description', epic?.description?.description);
          handleEditorChange(epic.id, 'description', epic?.description?.business_value);
          handleEditorChange(epic.id, 'description', epic?.description?.acceptance_criteria);
          handleEditorChange(epic.id, 'description', epic?.description?.dependencies);
          handleEditorChange(epic.id, 'description', epic?.description?.risks);
          console.log("Data saved for epics");
        });
      }
      toast.success("Epics Generated")

    } catch (error) {
      console.error("Failed to generate epics:", error);
      toast.error("Failed to generate epics");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSingleEpic = async () => {
    setIsGenerating(true);
    try {
      const token = await getToken({ template: "convex" });
      const response = await axios.post('/api/epics/single', { projectId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

      const epicData = response?.data?.epics
      console.log("Response from API:", response, response?.data);

      if (response && epicData) {
        response.data.epics.forEach((epic: any) => {
          handleEditorChange(epic.id, 'name', epic?.name);
          handleEditorChange(epic.id, 'description', epic?.description);
          handleEditorChange(epic.id, 'description', epic?.description?.description);
          handleEditorChange(epic.id, 'description', epic?.description?.business_value);
          handleEditorChange(epic.id, 'description', epic?.description?.acceptance_criteria);
          handleEditorChange(epic.id, 'description', epic?.description?.dependencies);
          handleEditorChange(epic.id, 'description', epic?.description?.risks);
          console.log("Data saved for epics");
        });
      }

      if (epicData === 'NULL') {
        toast.success("No additional epic needed")
      }
      else {
        toast.success("New Epic generated")
      }

    } catch (error) {
      console.error("Failed to generate epic:", error);
      toast.error("Failed to generate epic. Please try again")
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateUserStories = async (epicId: Id<"epics">) => {
    setIsGeneratingUS(true);
    try {
      const token = await getToken({ template: "convex" });
      const response = await axios.post('/api/userstories', { epicId, projectId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      console.log('Generated userStories:', response?.data);

      if (response && response?.data?.userStories) {
        response.data.userStories.forEach((userStories: any) => {
          handleEditorChangeForUS(userStories.id, 'title', userStories?.title);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.Description);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.acceptance_criteria);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.interface_elements);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.functional_flow);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.states_and_emptyStates);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.errorMessages_and_validation);
          console.log("Data saved for epics");
        });
      }
      toast.success("User Stories generated")

    } catch (error) {
      console.error("Failed to generate user Stories:", error);
      toast.error("Failed to generate user Stories");
    } finally {
      setIsGeneratingUS(false);
    }
  }

  const handleGenerateSingleUserStory = async (epicId: Id<"epics">) => {
    setIsGeneratingUS(true);
    try {
      const token = await getToken({ template: "convex" });
      const response = await axios.post('/api/userstories/single', { epicId, projectId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

      console.log("Response from API:", response, response?.data);

      if (response && response?.data?.userStories) {
        response.data.userStories.forEach((userStories: any) => {
          handleEditorChangeForUS(userStories.id, 'title', userStories?.title);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.Description);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.acceptance_criteria);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.interface_elements);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.functional_flow);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.states_and_emptyStates);
          handleEditorChangeForUS(userStories.id, 'description', userStories?.description?.errorMessages_and_validation);
          console.log("Data saved for epics");
        });
      }

      if (response?.data?.userStories === 'NULL') {
        toast.success("No additional user story needed")
      }
      else {
        toast.success("New User story generated")
      }

    } catch (error) {
      console.error("Failed to generate user story:", error);
    } finally {
      setIsGeneratingUS(false);
    }
  };

  const handleEpicToggle = (epicId: Id<"epics">) => {
    setActiveEpicId(epicId);
    setActiveUserStoryId(null);
  };

  const handleEpicTitleClick = (epicId: Id<"epics">, event: React.MouseEvent) => {
    event.stopPropagation()
    setActiveEpicId(epicId)
    setActiveUserStoryId(null);
    console.log("Epic Title clicked");
  }

  const handleCreateUserStory = async () => {
    if (activeEpicId) {
      const newUserStoryId = await createUserStory({
        epicId: activeEpicId,
        title: "New User Story",
        description: ""
      })
      setActiveUserStoryId(newUserStoryId)
      console.log("new user story", newUserStoryId);

    }
  }

  const handleUserStoryTitleChange = async (userStoryId: Id<"userStories">, newTitle: string) => {
    await updateUserStory({ id: userStoryId, title: newTitle })
  }

  const handleDeleteUserStory = async (userStoryId: Id<"userStories">) => {
    try {
      await deleteUserStory({ id: userStoryId })
      if (activeUserStoryId === userStoryId) {
        setActiveUserStoryId(null)
      }
      toast.success("User story deleted successfully")
    } catch (error) {
      console.error("Error deleting user story:", error)
      toast.error("Failed to delete user story")
    }
  }

  const handleUserStoryClick = (userStoryId: Id<"userStories">, event: React.MouseEvent) => {
    event.stopPropagation()
    setActiveUserStoryId(userStoryId)
    setActiveEpicId(null)
    console.log("User story clicked");
  }

  return (
    <>
      <div className="h-screen flex flex-col overflow-y-auto">
        {(!functionalRequirements || !functionalRequirements?.content) ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <Image src={Empty} alt="Incomplete requirements" width={100} height={100} />
            <h2 className="text-xl font-semibold text-center">
              Please complete functional requirements <br /> before proceeding to Epics...
            </h2>
          </div>
        ) : (
          <>
            {epics.length > 0 && (
              <header className="flex items-center justify-between pl-6 pr-6 pt-6 pb-2">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold">Epics & User Stories</h1>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={onAddEpics}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add an Epic
                  </Button>
                  <Button variant="default" className="gap-2"
                    onClick={handleGenerateSingleEpic}
                    disabled={isGenerating}
                  >
                    <AiGenerationIconWhite />
                    {isGenerating ? "Generating..." : "Generate an Epic"}
                  </Button>
                </div>
              </header>
            )}
            <div className="h-screen flex">
              {epics.length > 0 ? (
                <>
                  <aside className="w-72 bg-white h-full p-4">
                    <div className="p-1 space-y-2">
                      {epics?.map((epic) => (
                        <Collapsible
                          key={epic._id}
                          open={activeEpicId === epic._id}
                          onOpenChange={() => handleEpicToggle(epic._id)}
                        >
                          <div className={`rounded-md overflow-hidden ${activeEpicId === epic._id ? 'bg-slate-100 p-4' : ''}`}>
                            <CollapsibleTrigger className="w-full rounded-md hover:bg-slate-200">
                              <div
                                className={`flex items-center p-4 group ${activeEpicId === epic._id && !activeUserStoryId ?
                                  'bg-white rounded-md' : 'border border-slate-100 bg-slate-200 rounded-md'}`}
                              >
                                <div className="flex-grow flex items-center space-x-4" onClick={(e) => handleEpicTitleClick(epic._id, e)}>
                                  <PackageIcon className="h-4 w-4" />
                                  <p className="text-sm font-semibold cursor-pointer">
                                    {epic.name.length > 13 ? `${epic.name.substring(0, 13)}...` : epic.name}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCreateUserStory()
                                    }}
                                  >
                                    <Plus className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical className="h-4 w-4 text-gray-500" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteEpic(epic._id)
                                      }}>
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-2 p-2 w-full">
                                {userStories?.filter(story => story.epicId === epic._id).map((story) => (
                                  <div
                                    key={story._id}
                                    className={`flex items-center space-x-2 p-2 text-sm font-light rounded cursor-pointer group ${activeUserStoryId === story._id ? 'bg-white font-bold' : 'hover:bg-slate-200'}`}
                                  >
                                    <div className="flex-grow flex items-center space-x-2" onClick={(e) => handleUserStoryClick(story._id, e)}>
                                      <BookIcon className="h-4 w-4" />
                                      <span>{story.title}</span>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteUserStory(story._id)
                                        }}>
                                          <Trash className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                ))}
                                {userStories?.filter(story => story.epicId === epic._id).length === 0 ? (
                                  <Button
                                    variant="ghost"
                                    disabled={isGeneratingUS}
                                    className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl text-xs mt-2"
                                    onClick={() => handleGenerateUserStories(epic._id)}
                                  >
                                    {isGeneratingUS ? "Generating..." : "Generate User Stories with AI"}
                                  </Button>
                                ) : (
                                  <div className="flex flex-col items-center space-y-1">
                                    <Button
                                      variant="default"
                                      disabled={isGeneratingUS}
                                      className="w-full text-xs bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl space-x-2 mt-2 px-2 ml-2"
                                      onClick={() => handleGenerateSingleUserStory(epic._id)}
                                    >
                                      <AiGenerationIconWhite />
                                      {isGeneratingUS ? "Generating..." : "Generate a User Story"}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="w-full text-xs mt-2"
                                      onClick={handleCreateUserStory}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add user story
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  </aside>
                  <div className="flex-1 ml-1 p-4 pt-6 overflow-y-auto">
                    {activeUserStoryId && selectedUserStory ? (
                      <div className="flex flex-col h-full">
                        <header className="flex items-center justify-between pb-3 w-full">
                          <LabelToInput
                            value={selectedUserStory?.title || ''}
                            setValue={(newTitle) => handleUserStoryTitleChange(activeUserStoryId, newTitle)}
                            onBlur={() => { }}
                          />
                        </header>
                        <div className='flex-1 overflow-y-auto'>
                          <BlockEditor
                            onBlur={() => onEditorBlur()}
                            attribute="description"
                            projectDetails={selectedUserStory}
                            setProjectDetails={(value) => debouncedHandleEditorChangeForUS(activeUserStoryId, "description", value)}
                            onOpenBrainstormChat={() => {/* Open brainstorm chat */ }}
                            context='userStories'
                          />
                        </div>
                      </div>
                    ) : activeEpicId && selectedEpic ? (
                      <div className='flex flex-col h-full'>
                        <header className="flex items-center justify-between pb-4 w-full">
                          <LabelToInput
                            value={selectedEpic?.name || ''}
                            setValue={(newName) => onEpicNameChange(activeEpicId, newName)}
                            onBlur={() => { }}
                          />
                        </header>
                        <div className='flex-1 overflow-y-auto'>
                          <BlockEditor
                            onBlur={() => onEditorBlur()}
                            attribute="description"
                            projectDetails={selectedEpic}
                            setProjectDetails={(value) => debouncedHandleEditorChange(activeEpicId, "description", value)}
                            onOpenBrainstormChat={() => {/* Open brainstorm chat */ }}
                            context='epics'
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Select an epic or user story to edit</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-hidden w-full">
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <Image src={Empty} alt="No epics" width={100} height={100} />
                    <h2 className="text-xl font-semibold text-center">
                      You haven't created any epics<br />for this project yet.
                    </h2>
                    <p className="text-center text-gray-600 max-w-md">
                      Based on the project details, the AI can generate
                      streamlined epics that outline the main features
                      and functionalities of your project. Try it!
                    </p>
                    <Button
                      className="gap-2 h-10"
                      variant="default"
                      onClick={handleGenerateEpics}
                      disabled={isGenerating}
                    >
                      <AiGenerationIconWhite />
                      {isGenerating ? "Generating..." : "Generate Epics"}
                    </Button>
                    <div className="text-center">
                      <span className="text-gray-500">or</span>
                    </div>
                    <Button variant="outline" onClick={onAddEpics}>
                      Add Epic manually
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}