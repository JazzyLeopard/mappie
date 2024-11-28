'use client'

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react'
import { ChevronDown, ChevronRight, Plus, MoreVertical, Trash, Edit, Save, BookOpen, X, ArrowRight, PanelLeftOpen, PanelLeftClose, Wand2 } from 'lucide-react'
import LabelToInput from "@/app/(main)/_components/LabelToInput"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useQuery, useMutation, useConvex } from "convex/react"
import { useAuth } from "@clerk/clerk-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import AiGenerationIcon from '@/icons/AI-Generation'
import AiGenerationIconWhite from '@/icons/AI-Generation-White'
import AIStoryCreator from '@/ai/ai-chat'
import Image from 'next/image'
import empty from '@/public/empty.png'
import { useRouter } from 'next/navigation'
import LexicalEditor from '@/app/(main)/_components/Lexical/LexicalEditor'
import { cn } from '@/lib/utils'
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type SelectedItems = {
  epic: string | null;
  story: string | null;
}

export default function EpicLayout({ params, handleEditorChange, onAddEpics, onDeleteEpic, onEditorBlur, onEpicNameChange, }: { 
  params: { 
    projectId: Id<"projects">;
    epicId?: Id<"epics">;
  },
  handleEditorChange: (epicId: Id<"epics">, field: string, value: any) => Promise<void>;
  onAddEpics: () => Promise<void>;
  onDeleteEpic: (epicId: Id<"epics">) => Promise<void>;
  onEditorBlur: () => Promise<void>;
  onEpicNameChange: (epicId: Id<"epics">, name: string) => Promise<void>;
  epics: any[];
}) {
  const router = useRouter()
  
  // Use the projectId from params
  const projectId = params.projectId;
  const epicId = params.epicId;

  // Initialize selected items with the first epic if available, otherwise null
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({ 
    epic: null, 
    story: null 
  });

  // State to manage expanded epics
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set())
  // State to manage editing epic ID
  const [editingEpicId, setEditingEpicId] = useState<string | null>(null)
  // State to manage editing epic name
  const [editingEpicName, setEditingEpicName] = useState<string>('')
  // State to manage sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Get authentication token
  const { getToken } = useAuth()

  // Query to get epics for the project
  const epics = useQuery(api.epics.getEpics, { projectId })
  // Query to get all user stories for the project
  const allUserStories = useQuery(api.userstories.getUserStories, { projectId });
  // Query to get selected epic by ID
  const selectedEpic = useQuery(api.epics.getEpicById,
    selectedItems.epic ? { epicId: selectedItems.epic as Id<"epics"> } : "skip"
  )
  // Log selected epic query result
  // useEffect(() => {
  //   console.log('selectedEpic query result:', selectedEpic);
  // }, [selectedEpic]);

  // Query to get selected user story by ID
  const selectedUserStory = useQuery(api.userstories.getUserStoryById,
    selectedItems.story ? { userStoryId: selectedItems.story as Id<"userStories"> } : "skip"
  )
  // Log selected user story query result
  // useEffect(() => {
  //   console.log('selectedUserStory query result:', selectedUserStory);
  // }, [selectedUserStory]);

  // Mutation to create a new epic
  const createEpic = useMutation(api.epics.createEpics)
  // Mutation to update an epic
  const updateEpic = useMutation(api.epics.updateEpic)
  // Mutation to delete an epic
  const deleteEpic = useMutation(api.epics.deleteEpic)
  // Mutation to create a new user story
  const createUserStory = useMutation(api.userstories.createUserStory)
  // Mutation to update a user story
  const updateUserStory = useMutation(api.userstories.updateUserStory)
  // Mutation to delete a user story
  const deleteUserStory = useMutation(api.userstories.deleteUserStory)
  
  // Toggle the expansion of an epic
  const toggleEpic = useCallback((epicId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedEpics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(epicId)) {
        newSet.delete(epicId)
      } else {
        newSet.add(epicId)
      }
      return newSet
    })
  }, [])

  // Select an item (epic or story)
  const selectItem = useCallback((type: 'epic' | 'story', id: string, epicId?: string) => {
    setSelectedItems(prev => {
      if (type === 'epic') {
        // When selecting an epic, clear the story selection
        return { epic: id, story: null };
      } else {
        // When selecting a story, keep track of both epic and story
        return { epic: epicId || prev.epic, story: id };
      }
    });
  }, []);

  // Handle adding a new epic
  const handleAddEpic = async () => {
    const newEpicId = await createEpic({ projectId, name: "New Epic", description: "" })
    selectItem('epic', newEpicId)
    setExpandedEpics(new Set(expandedEpics).add(newEpicId))
  }

  // Handle deleting an epic
  const handleDeleteEpic = async (epicId: Id<"epics">) => {
    await deleteEpic({ _id: epicId })
    if (selectedItems.epic === epicId) {
      setSelectedItems({ epic: null, story: null })
    }
    setExpandedEpics(new Set(Array.from(expandedEpics).filter(id => id !== epicId)))
  }

  // First, update the handleCreateUserStory function to properly return the ID
  const handleCreateUserStory = async (epicId: Id<"epics">) => {
    try {
      const newUserStoryId = await createUserStory({
        epicId,
        title: "New User Story",
        description: ""
      });
      selectItem('story', newUserStoryId);
      setExpandedEpics(prev => new Set(prev).add(epicId));
      return newUserStoryId; // Make sure we return the ID
    } catch (error) {
      console.error("Error creating user story:", error);
      throw error;
    }
  };

  // Handle deleting a user story
  const handleDeleteUserStory = async (userStoryId: Id<"userStories">) => {
    await deleteUserStory({ id: userStoryId })
    if (selectedItems.story === userStoryId) {
      setSelectedItems(prev => ({ ...prev, story: null }))
    }
  }

  // Handle changes to an epic
  const handleEpicChange = useCallback((epicId: Id<"epics">, field: string, value: any) => {
    // Skip if no changes or no value
    if (!value || !epicId) {
      return;
    }

    // Single update to database
    updateEpic({
      _id: epicId,
      [field]: value
    }).catch(error => {
      console.error("Error updating epic:", error);
    });
  }, [updateEpic]);

  // Add a handler for user story changes
  const handleUserStoryChange = useCallback((storyId: Id<"userStories">, field: string, value: any) => {
    // Skip if no changes or no value
    if (!value || !storyId) {
      return;
    }

    // Single update to database
    updateUserStory({
      id: storyId,
      [field]: value
    }).catch(error => {
      console.error("Error updating user story:", error);
    });
  }, [updateUserStory]);

  // Log selected epic and user story
  // useEffect(() => {
  //   console.log('Selected Epic:', selectedEpic)
  //   console.log('Selected User Story:', selectedUserStory)
  // }, [selectedEpic, selectedUserStory])

  // Log changes to selected items
  useEffect(() => {
    console.log('selectedItems changed:', selectedItems);
  }, [selectedItems]);

  // Automatically select the first epic if available
  useEffect(() => {
    if (!selectedItems.epic && epics && epics.length > 0 && !params.epicId) {
      const firstEpicId = epics[0]._id;
      selectItem('epic', firstEpicId);
    }
  }, [epics, selectedItems.epic, params.epicId]);

  // Render an epic
  const renderEpic = useCallback((epic: any) => {
    const isExpanded = expandedEpics.has(epic._id)
    const isSelected = selectedItems.epic === epic._id && selectedItems.story === null
    const epicUserStories = allUserStories?.filter((story: any) => story.epicId === epic._id) || []

    return (
      <div key={epic._id} className="">
        <div
          className={`flex items-center rounded-lg px-4 py-1 hover:bg-white transition-colors ${
            isSelected ? 'bg-white font-semibold' : ''
          } cursor-pointer group`}
          onClick={() => {
            selectItem('epic', epic._id)
            setSelectedItems({ epic: epic._id, story: null })
          }}
        >
          <button
            className="mr-2 focus:outline-none"
            onClick={(e) => toggleEpic(epic._id, e)}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          <span 
            className="flex-grow text-left text-sm w-3/4"
            onClick={() => selectItem('epic', epic._id)}
          >
            {epic.name}
          </span>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity w-1/4 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleCreateUserStory(epic._id)
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteEpic(epic._id)
              }}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div>
            {epicUserStories.length === 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="ml-8 mt-2 text-xs flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <AiGenerationIcon />
                Generate User Stories
              </Button>
            ) : (
              renderUserStories(epicUserStories)
            )}
          </div>
        )}
      </div>
    )}, 
    [expandedEpics, selectedItems.epic, selectedItems.story]
  )

  // Render user stories
  const renderUserStories = useCallback((stories: any[]) => {
    return (
      <div>
        {stories.map(story => (
          <div
            key={story._id}
            className={`pl-6 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
              selectedItems.story === story._id ? 'bg-slate-200 font-semibold' : ''
            } group flex items-center justify-between`}
            onClick={(e) => {
              e.stopPropagation()
              selectItem('story', story._id)
            }}
          >
            <div className="flex items-center flex-grow gap-2">
              <BookOpen className="h-3 w-3" />
              <span className="text-sm flex-grow ">{story.title.length > 18 ? story.title.substring(0, 18) + '...' : story.title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteUserStory(story._id)
              }}
            >
              <Trash className="h-3 w-3 " />
            </Button>
          </div>
        ))}
      </div>
    )
  }, [selectedItems.story])

  // State to manage refresh key
  const [refreshKey, setRefreshKey] = useState(0)

  // State to track the latest inserted content
  const [latestInsertedContent, setLatestInsertedContent] = useState<Array<{ type: "add" | "remove" | "unchanged"; content: string; }> | undefined>(undefined);

  // Function to handle inserting markdown content into the selected item
  // This function updates the description of the selected user story or epic with the provided markdown content
  // If no item is selected, it logs an error message
  // The refreshKey state is incremented to trigger a re-render
  const handleInsertMarkdown = useCallback((
    content: string | {
      type: 'structuredUserStory';
      content: {
        title: string;
        description: {
          description: string;
          acceptance_criteria: Array<{
            scenario: string;
            given: string;
            when: string;
            then: string;
          }>;
          interface_elements?: string;
          functional_flow?: string;
          states_and_emptyStates?: string;
          errorMessages_and_validation?: string;
        };
      };
      format: 'lexical';
    }
  ) => {
    if (typeof window === 'undefined') return;

    // Handle structured user story
    if (typeof content === 'object' && content.type === 'structuredUserStory') {
      const { title, description } = content.content;
      
      // Convert structured description to markdown string
      const formattedDescription = `
${description.description}

## Acceptance Criteria
${description.acceptance_criteria.map(ac => `
### Scenario: ${ac.scenario}
- Given: ${ac.given}
- When: ${ac.when}
- Then: ${ac.then}
`).join('\n')}

${description.interface_elements ? `## Interface Elements\n${description.interface_elements}\n` : ''}
${description.functional_flow ? `## Functional Flow\n${description.functional_flow}\n` : ''}
${description.states_and_emptyStates ? `## States and Empty States\n${description.states_and_emptyStates}\n` : ''}
${description.errorMessages_and_validation ? `## Error Messages and Validation\n${description.errorMessages_and_validation}\n` : ''}
`.trim();

      // If we have a selected story, update it
      if (selectedItems.story) {
        // Update existing story
        handleUserStoryChange(
          selectedItems.story as Id<"userStories">, 
          'title', 
          title
        );

        if ((window as any).__insertMarkdown) {
          (window as any).__insertMarkdown(formattedDescription);
        }

        handleUserStoryChange(
          selectedItems.story as Id<"userStories">, 
          'description', 
          formattedDescription
        );
      } 
      // If we have a selected epic, create a new story under it
      else if (selectedItems.epic) {
        // Create new story and handle the Promise properly
        handleCreateUserStory(selectedItems.epic as Id<"epics">)
          .then((newStoryId: Id<"userStories">) => {
            if (!newStoryId) return;

            // Update the new story with the generated content
            handleUserStoryChange(
              newStoryId, 
              'title', 
              title
            );
            
            if ((window as any).__insertMarkdown) {
              (window as any).__insertMarkdown(formattedDescription);
            }

            handleUserStoryChange(
              newStoryId, 
              'description', 
              formattedDescription
            );
          })
          .catch(error => {
            console.error("Error creating new story:", error);
            toast.error("Failed to create new story");
          });
      }
    } 
    // Handle regular markdown
    else if (typeof content === 'string') {
      if ((window as any).__insertMarkdown) {
        (window as any).__insertMarkdown(content);
      }

      // Update the database
      if (selectedItems.story) {
        handleUserStoryChange(
          selectedItems.story as Id<"userStories">, 
          'description', 
          content
        );
      } else if (selectedItems.epic) {
        handleEpicChange(
          selectedItems.epic as Id<"epics">, 
          'description', 
          content
        );
      }
    }
  }, [selectedItems, handleUserStoryChange, handleEpicChange, handleCreateUserStory]);

  // Memoize handlers
  const handleEpicEditorChange = useCallback((id: Id<"epics">, field: string, value: string) => {
    handleEpicChange(id, field, value);
  }, [handleEpicChange]);

  // Memoize the epic editor section
  const EpicEditor = useMemo(() => {
    if (!selectedEpic) return null;
    
    const epicUserStories = allUserStories?.filter((story: any) => story.epicId === selectedEpic._id) || []
    
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between pt-4 px-4 pb-4 w-full">
          <LabelToInput
            key={`${selectedEpic._id}-${selectedEpic.name}`}
            value={selectedEpic.name}
            setValue={(newName) => handleEpicChange(selectedEpic._id, 'name', newName)}
            onBlur={() => {}}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default" 
                className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-blue-300 text-white font-semibold"
              >
                <AiGenerationIconWhite />
                Generate
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem
                disabled={epicUserStories.length > 0}
                onClick={() => handleGenerateUserStories(selectedEpic._id)}
                className="flex items-center gap-2 p-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate Initial User Stories
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleGenerateUserStories(selectedEpic._id)}
                className="flex items-center gap-2 p-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate User Story
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex-1 overflow-y-auto h-[calc(100%-100px)] flex">
          <LexicalEditor
            key={selectedItems.epic as string}
            itemId={selectedItems.epic as Id<"epics">}
            onBlur={onEditorBlur}
            attribute="description"
            projectDetails={{
              _id: selectedItems.epic,
              description: selectedEpic?.description || ''
            }}
            setProjectDetails={(newDetails) => {
              if (selectedItems.epic) {
                handleEditorChange(
                  selectedItems.epic as Id<"epics">,
                  'description',
                  newDetails.description
                );
              }
            }}
            context="epics"
            isRichText={true}
          />
        </div>
      </div>
    );
  }, [selectedEpic, allUserStories, handleEpicChange, handleEditorChange]);

  // Create a memoized UserStory editor component
  const UserStoryEditor = useMemo(() => {
    if (!selectedUserStory) return null;
    
    return (
      <div className='flex flex-col h-full'>
        <header className="flex items-center justify-between pt-4 px-4 pb-4 w-full">
          <LabelToInput
            key={`${selectedUserStory._id}-${selectedUserStory.title}`}
            value={selectedUserStory.title}
            setValue={(newTitle) => handleUserStoryChange(selectedUserStory._id, 'title', newTitle)}
            onBlur={() => {}}
          />
        </header>
        <div className='flex-1 overflow-y-auto flex h-full'>
          <div className='flex-1 px-0 h-[500px]'>
            <LexicalEditor
              key={selectedItems.story as string}
              itemId={selectedItems.story as Id<"userStories">}
              onBlur={async () => {}}
              attribute="description"
              projectDetails={{
                _id: selectedItems.story,
                description: selectedUserStory?.description || ''
              }}
              setProjectDetails={(newDetails) => {
                console.log('Updating user story with:', newDetails);
                if (selectedItems.story) {
                  handleUserStoryChange(
                    selectedItems.story as Id<"userStories">,
                    'description',
                    newDetails.description
                  );
                }
              }}
              context="userStories"
              isRichText={true}
            />
          </div>
        </div>
      </div>
    );
  }, [selectedUserStory, handleUserStoryChange]);

  // Add these state variables at the top of the component
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');

  // Add this state for the simulation interval
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Add this function to handle the simulated progress
  const simulateProgress = () => {
    setGenerationProgress(prev => {
      if (prev >= 99) return prev;
      // Slow down progress as it gets higher
      const remaining = 99 - prev;
      const increment = Math.max(0.5, remaining * 0.1);
      return Math.min(99, prev + increment);
    });
  };

  // Update the handleGenerateEpics function
  const handleGenerateEpics = async () => {
    if (!params.projectId) {
      toast.error("Please select a project first");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Initializing...');

    // Start progress simulation
    progressInterval.current = setInterval(simulateProgress, 300);

    try {
      const token = await getToken();
      const response = await fetch('/api/epics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          projectId: params.projectId,
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
                // Clear the simulation interval
                if (progressInterval.current) {
                  clearInterval(progressInterval.current);
                }
                setGenerationProgress(100);
                setGenerationStatus('Complete!');
                toast.success("Epics generated successfully");
                setTimeout(() => {
                  setIsGenerating(false);
                }, 1000);
                if (onAddEpics) {
                  await onAddEpics();
                }
                return;
              }
              
              // Update status message from the server if provided
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
      console.error("Error generating epics:", error);
      toast.error("Failed to generate epics. Please try again.");
    } finally {
      // Clean up the interval if it's still running
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setIsGenerating(false);
    }
  };

  // Clean up the interval on component unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Memoize the projectId if it's being transformed
  const stableProjectId = useMemo(() => params.projectId?.toString(), [params.projectId]);

  // Add useEffect to log selection changes
  useEffect(() => {
    console.log('Selected epic changed:', selectedItems.epic);
    console.log('Selected epic data:', selectedEpic);
  }, [selectedItems.epic, selectedEpic]);

  // Modify your selection handler
  const handleEpicSelect = useCallback((epicId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      epic: epicId,
      story: null
    }));
  }, []);

  // Add this new handler for single epic generation
  const handleGenerateSingleEpic = async () => {
    if (!params.projectId) {
      toast.error("Please select a project first");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Generating a new epic...');
    progressInterval.current = setInterval(simulateProgress, 300);

    try {
      const token = await getToken();
      const response = await fetch('/api/epics/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          projectId: params.projectId,
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
                // Clear the simulation interval
                if (progressInterval.current) {
                  clearInterval(progressInterval.current);
                }
                setGenerationProgress(100);
                setGenerationStatus('Complete!');
                toast.success("New epic generated successfully");
                setTimeout(() => {
                  setIsGenerating(false);
                }, 1000);
                if (onAddEpics) {
                  await onAddEpics();
                }
                return;
              }
              
              // Update status message from the server if provided
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
      console.error("Error generating epic:", error);
      toast.error("Failed to generate epic. Please try again.");
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setIsGenerating(false);
    }
  };

  // Rename existing handler to be more specific
  const handleGenerateMultipleEpics = async () => {
    // ... existing handleGenerateEpics code ...
  };

  // Add this new function to handle user story generation:
  const handleGenerateUserStories = async (epicId: Id<"epics">) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Generating user stories...');
    
    try {
      const token = await getToken();
      const response = await fetch('/api/userstories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          epicId,
          projectId: params.projectId,
        }),
      });

      // ... rest of the streaming logic similar to handleGenerateEpics ...
      
    } catch (error) {
      console.error("Error generating user stories:", error);
      toast.error("Failed to generate user stories. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Render the main layout
  return (
    <div className="flex h-screen gap-2 p-4">
      <div className="w-72">
        <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-100 rounded-xl h-full">
          <div className="p-2 pt-4">
            <div className="flex flex-col items-center space-y-2 mb-4">
              <Button onClick={handleAddEpic} variant='ghost' className="w-full text-sm justify-start hover:bg-slate-200 pl-2">
                <Plus className="mr-2 h-4 w-4" /> Add Epic
              </Button>
              <Button onClick={handleGenerateSingleEpic} variant='ghost' className="w-full text-sm justify-start hover:bg-slate-200 pl-2">
                <AiGenerationIcon /> 
                <span className="ml-2 font-semibold ">Generate Epic</span>
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="px-2">
              <span className="text-sm pl-2 font-semibold">Epics</span>
              <div className="pt-2">
                {epics?.map(renderEpic)}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
      
      <div className="flex flex-1 gap-2">
        {epics && epics.length > 0 ? (
          <>
            <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-4 bg-white rounded-xl">
              {selectedItems.story ? (
                UserStoryEditor
              ) : selectedItems.epic ? (
                EpicEditor
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select an epic or user story to edit</p>
                </div>
              )}
            </div>
            
            <div className={cn(`group/sidebar ${isCollapsed? 'w-16' : 'w-2/5'} transition-width duration-300`, isResetting && "transition-all ease-in-out duration-300")}>
              <div className="shadow-sm bg-white rounded-xl h-full">
                {selectedItems.story ? (
                  <AIStoryCreator 
                    key={`story-${selectedItems.story}`}
                    onInsertMarkdown={handleInsertMarkdown} 
                    selectedItemContent={selectedUserStory?.description || ''}
                    selectedItemType="userStory"
                    selectedEpic={selectedEpic ? {
                      name: selectedEpic.name,
                      description: selectedEpic.description
                    } : null}
                    selectedUserStory={selectedUserStory}
                    selectedItemId={selectedItems.story}
                    projectId={stableProjectId}
                    isCollapsed={isCollapsed}
                    toggleCollapse={toggleCollapse}
                  />
                ) : selectedItems.epic ? (
                  <AIStoryCreator 
                    key={`epic-${selectedItems.epic}`}
                    onInsertMarkdown={handleInsertMarkdown} 
                    selectedItemContent={selectedEpic?.description || ''}
                    selectedItemType="epic"
                    selectedEpic={selectedEpic ? {
                      name: selectedEpic.name,
                      description: selectedEpic.description
                    } : null}
                    selectedItemId={selectedItems.epic}
                    projectId={stableProjectId}
                    isCollapsed={isCollapsed}
                    toggleCollapse={toggleCollapse}
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-hidden w-full">
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <Image src={empty} alt="No epics" width={100} height={100} />
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
                onClick={handleGenerateMultipleEpics}
                disabled={!projectId}
              >
                <AiGenerationIconWhite />
                Generate Epics
              </Button>
              <div className="text-center">
                <span className="text-gray-500">or</span>
              </div>
              <Button variant="outline" onClick={() => {}}>
                Add Epic manually
              </Button>
            </div>
          </div>
        )}
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-semibold">Generating Epics</h3>
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{generationStatus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
