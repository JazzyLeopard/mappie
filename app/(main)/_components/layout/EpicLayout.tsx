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
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from "sonner"

interface EpicLayoutProps {
  projectId: Id<"projects">;
  onAddEpics: () => Promise<void>
  onEpicNameChange: (epicId: Id<"epics">, newName: string) => Promise<void>
  handleEditorChange: (_id: Id<"epics">, field: string, value: any) => void
  epics: any[]
}

export default function EpicLayout({
  projectId,
  epics,
  onAddEpics,
  onEpicNameChange,
  handleEditorChange
}: EpicLayoutProps) {
  const [activeEpicId, setActiveEpicId] = useState<Id<"epics"> | null>(null);
  const [selectedUserStoryId, setSelectedUserStoryId] = useState<Id<"userStories"> | null>(null);
  const [epicDetails, setEpicDetails] = useState<any>();
  const [userStoriesDetails, setUserStoriesDetails] = useState<any>();

  const [currentSelectedItem, setCurrentSelectedItem] = useState<"epic" | "userStories" | null>(null)

  // currentSelectedItem = epic | userstory
  // on epic click / on us click -> set also currentSelectedItem -> epic | us
  // display labeltoinput -> if epic = currentSelectedItem (top) else (bottom)

  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

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
  console.log("selected Epic", epicDetails);

  const selectedUserStory = useQuery(api.userstories.getUserStoryById,
    selectedUserStoryId ? { userStoryId: selectedUserStoryId } : "skip"
  )
  console.log("selected userstory", selectedUserStory);

  const updateEpicMutation = useMutation(api.epics.updateEpic);
  const deleteEpic = useMutation(api.epics.deleteEpic)

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
    if (userStories && userStories.length > 0 && !selectedUserStoryId) {
      setSelectedUserStoryId(userStories[0]._id)
    }
  }, [userStories, selectedUserStoryId])

  useEffect(() => {
    if (selectedEpic) {
      setEpicDetails(selectedEpic);
    }
  }, [selectedEpic]);

  useEffect(() => {
    if (userStories) {
      setUserStoriesDetails(userStories);
    }
  }, [userStories]);

  const handleEditorBlur = async () => {
    try {
      setEpicDetails((prevDetails: any) => {
        console.log('time for API call', prevDetails);
        const { _creationTime, createdAt, updatedAt, projectId, ...payload } = prevDetails;
        updateEpicMutation(payload).catch(error => {
          console.log('Error updating epic:', error);
        });
        return prevDetails;
      });
    } catch (error) {
      console.log('Error updating epic:', error);
    }
  };

  const debouncedHandleEditorChange = useCallback(
    debounce((_id: Id<"epics">, field: string, value: any) => {
      handleEditorChange(_id, field, value);
    }, 1000),
    [handleEditorChange]
  );

  const onBlurForUS = async (id: Id<"userStories">) => {
    try {
      setUserStoriesDetails((prevDetails: any) => {
        console.log('time for API call', prevDetails);
        const { _creationTime, createdAt, updatedAt, epicId, ...payload } = prevDetails;

        const updatedPayload = {
          id: id,
          title: payload.title,
          description: payload.description
        }

        console.log("updatedPayload", updatedPayload);

        updateUserStory(updatedPayload).catch(error => {
          console.log('Error updating user story:', error);
        });

        return prevDetails;
      });
    } catch (error) {
      console.log('Error updating user story:', error);
    }
  };

  const handleUpdateUS = useCallback(
    async (_id: Id<"userStories">, field: 'description', value: any) => {
      await updateUserStory({ id: _id, [field]: value })
    }, [updateUserStory])

  const handleEditorChangeForUS = useCallback((_id: Id<"userStories">, field: string, value: any) => {
    handleUpdateUS(_id, field as 'description', value);
  }, [handleUpdateUS]);

  const debouncedHandleEditorChangeForUS = useCallback(
    debounce((_id: Id<"userStories">, field: string, value: any) => {
      handleEditorChangeForUS(_id, field, value);
    }, 1000),
    [handleEditorChangeForUS]
  );

  const handleGenerateEpics = async () => {
    setIsGenerating(true);
    try {
      const token = await getToken({ template: "convex" });
      const response = await axios.post('/api/epics', { projectId }, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },

      });

      console.log('Generated epics:', response.data);
      router.push(`/projects/${projectId}/epics`);

    } catch (error) {
      console.error("Failed to generate epics:", error);
      toast.error("Failed to generate epics");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateUserStories = async (epicId: Id<"epics">) => {
    // Implement the logic to generate user stories for the given epic
    console.log('Generating user stories for epic:', epicId)
    // After generation, you might want to refresh the user stories list
  }

  const handleEpicToggle = (epicId: Id<"epics">) => {
    setActiveEpicId(epicId);
    setSelectedUserStoryId(null);
  };

  const handleEpicTitleClick = (epicId: Id<"epics">, event: React.MouseEvent) => {
    event.stopPropagation()
    setActiveEpicId(epicId)
    setCurrentSelectedItem("epic")
    console.log("Epic Title clicked");
  }

  const handleDeleteEpic = async (epicId: Id<"epics">) => {
    try {
      await deleteEpic({ id: epicId })
      if (activeEpicId === epicId) {
        setActiveEpicId(null)
      }
      toast.success("Epic deleted successfully")
    } catch (error) {
      console.error("Error deleting epic:", error)
      toast.error("Failed to delete epic")
    }
  }

  const handleCreateUserStory = async () => {
    if (activeEpicId) {
      const newUserStoryId = await createUserStory({
        epicId: activeEpicId,
        title: "New User Story",
        description: ""
      })
      setSelectedUserStoryId(newUserStoryId)
      console.log("new user story", newUserStoryId);

    }
  }

  const handleUserStoryTitleChange = async (userStoryId: Id<"userStories">, newTitle: string) => {
    await updateUserStory({ id: userStoryId, title: newTitle })
  }

  const handleDeleteUserStory = async (userStoryId: Id<"userStories">) => {
    try {
      await deleteUserStory({ id: userStoryId })
      if (selectedUserStoryId === userStoryId) {
        setSelectedUserStoryId(null)
      }
      toast.success("User story deleted successfully")
    } catch (error) {
      console.error("Error deleting user story:", error)
      toast.error("Failed to delete user story")
    }
  }

  const handleUserStoryClick = (userStoryId: Id<"userStories">) => {
    setSelectedUserStoryId(userStoryId)
    setActiveEpicId(null)
    setCurrentSelectedItem("userStories")
    console.log("User story clicked");
  }

  return (
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
                <Button variant="default" className="gap-2" onClick={handleGenerateEpics}
                  disabled={isGenerating}>
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
                              className={`flex items-center p-4 group ${activeEpicId === epic._id && !selectedUserStoryId ?
                                'bg-white rounded-md' : 'border border-slate-100 bg-transparent rounded-md'}`}
                            >
                              <div className="flex-grow flex items-center space-x-4" onClick={(e) => handleEpicTitleClick(epic._id, e)}>
                                <PackageIcon className="h-4 w-4" />
                                <p className="text-sm font-semibold cursor-pointer">
                                  {epic.name}
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
                                      handleDeleteEpic(epic._id)
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
                                  className={`flex items-center space-x-2 p-2 text-sm font-light rounded cursor-pointer group ${selectedUserStoryId === story._id ? 'bg-white font-bold' : 'hover:bg-slate-200'}`}
                                >
                                  <div className="flex-grow flex items-center space-x-2" onClick={() => handleUserStoryClick(story._id)}>
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
                                  className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl text-xs mt-2"
                                  onClick={() => handleGenerateUserStories(epic._id)}
                                >
                                  <p className="">Generate User Stories with AI</p>
                                </Button>
                              ) : (
                                <div className="flex flex-col items-center space-y-1">
                                  <Button
                                    variant="default"
                                    className="w-full text-xs bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl space-x-2 mt-2 px-2"
                                    onClick={handleCreateUserStory}
                                  >
                                    <AiGenerationIconWhite />
                                    <p className="ml-2">Generate a User Story</p>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="w-full text-xs mt-2"
                                    onClick={handleCreateUserStory}
                                  >
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
                  {currentSelectedItem === "userStories" && selectedUserStoryId && selectedUserStory ? (
                    <div className="flex flex-col h-full">
                      <header className="flex items-center justify-between pb-3 w-full">
                        <LabelToInput
                          value={selectedUserStory?.title || ''}
                          setValue={(newTitle) => handleUserStoryTitleChange(selectedUserStoryId, newTitle)}
                          onBlur={() => { }}
                        />
                      </header>
                      <div className='flex-1 overflow-y-auto'>
                        <BlockEditor
                          onBlur={() => onBlurForUS(selectedUserStoryId)}
                          attribute="description"
                          projectDetails={selectedUserStory}
                          setProjectDetails={(value) => selectedUserStory && debouncedHandleEditorChangeForUS(selectedUserStory._id, "description", value)}
                          onOpenBrainstormChat={() => {/* Open brainstorm chat */ }}
                          context='userStories'
                        />
                      </div>
                    </div>
                  ) : currentSelectedItem === "epic" && activeEpicId && selectedEpic ? (
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
                          onBlur={handleEditorBlur}
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
  )
}