"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, GitPullRequest, ListTodo, Target, ArrowRight, Paperclip, Send, Plus, Check, ChevronRight, Puzzle, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback, useMemo } from "react"
import { SYSTEM_TEMPLATES } from "@/convex/utils/systemTemplates"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ScrollArea } from "@/components/ui/scroll-area-1"
import { Id } from "@/convex/_generated/dataModel"
import { Switch } from "@/components/ui/switch"
import { ResourceSelector } from "@/components/work-items/ResourceSelector"
import { cn } from "@/lib/utils"

type WorkItemType = "epic" | "feature" | "story" | "task"
type CreationMethod = "template" | "ai" | "blank" | "select-parent" | null

// Add new types for AI generation
type AIGenerationOptions = {
  generateMultiple: boolean
  includeUserStories: boolean
}

interface WorkItemCreationDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateWorkItem: (workItem: any) => void
  parentItem?: {
    id: string
    type: WorkItemType
  }
}

interface ParentSelectionProps {
  selectedType: WorkItemType
  onSelect: (parentId: string) => void
  onBack: () => void
  workspaceId: string
}

function ParentSelection({ selectedType, onSelect, onBack, workspaceId }: ParentSelectionProps) {
  const workItems = useQuery(api.workItems.getWorkItems, { workspaceId: workspaceId as Id<"workspaces"> })
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedParentId || selectedType !== "task") {
      onSelect(selectedParentId || "")
    }
  }

  useEffect(() => {
    console.log("Current selectedParentId:", selectedParentId)
  }, [selectedParentId])

  const validParents = workItems?.filter(item => {
    if (selectedType === "feature") return item.type === "epic"
    if (selectedType === "story") return item.type === "epic" || item.type === "feature"
    if (selectedType === "task") return item.type === "story"
    return false
  })

  return (
    <>
      <DialogHeader>
        <Button variant="ghost" onClick={onBack} className="absolute left-4 top-4">
          ← Back
        </Button>
        <DialogTitle className="text-center">
          Select Parent {selectedType === "feature" ? "Epic" : 
                       selectedType === "story" ? "Epic or Feature" : 
                       "Story"}
        </DialogTitle>
      </DialogHeader>

      <ScrollArea className="max-h-[400px] mt-4">
        <div className="grid gap-2 p-2">
          {validParents?.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-4">
              No valid parent items found. {selectedType === "task" 
                ? "Please create a Story first." 
                : `You can create this ${selectedType} without a parent.`}
            </div>
          ) : (
            validParents?.map((item) => (
              <Button
                key={item._id}
                variant="outline"
                className={`w-full justify-between h-auto p-4 ${
                  selectedParentId === item._id ? 'border-primary' : ''
                }`}
                onClick={() => {
                  console.log("Setting parent ID to:", item._id)
                  setSelectedParentId(item._id)
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Badge>
                </div>
                {selectedParentId === item._id && <Check className="h-4 w-4" />}
              </Button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-2 mt-4">
        {selectedType !== "task" && (
          <Button variant="outline" onClick={() => onSelect("")}>
            Skip
          </Button>
        )}
        <Button 
          onClick={handleContinue}
          disabled={selectedType === "task" && !selectedParentId}
        >
          Continue
        </Button>
      </div>
    </>
  )
}

export function WorkItemCreationDialog({ isOpen, onClose, onCreateWorkItem, parentItem }: WorkItemCreationDialogProps) {
  const [selectedType, setSelectedType] = useState<WorkItemType | null>(null)
  const [creationMethod, setCreationMethod] = useState<CreationMethod>(null)
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [selectedParentId, setSelectedParentId] = useState<string>("")
  const workspaces = useQuery(api.workspaces.getWorkspaces)
  const workspace = workspaces?.[0]
  const [aiGenerationStep, setAIGenerationStep] = useState<"options" | "prompt" | null>(null)
  const [aiOptions, setAIOptions] = useState<AIGenerationOptions>({
    generateMultiple: false,
    includeUserStories: false
  })

  useEffect(() => {
    if (!isOpen) {
      setSelectedType(null)
      setCreationMethod(null)
      setTitle("")
      setPrompt("")
      setSelectedParentId("")
      setAIGenerationStep(null)
      setAIOptions({
        generateMultiple: false,
        includeUserStories: false
      })
    } else if (parentItem) {
      setSelectedParentId(parentItem.id)
    }
  }, [isOpen, parentItem])

  // Determine valid options based on parent type
  const validOptions = useMemo(() => {
    if (parentItem?.type === "epic") {
      return [
        {
          type: "feature",
          label: "Feature",
          icon: Puzzle,
          description: "A significant piece of functionality that delivers business value"
        },
        {
          type: "story",
          label: "Story",
          icon: BookOpen,
          description: "A user-focused description of a feature or requirement"
        }
      ]
    }
    
    // Default options when no parent or other parent types
    return [
      {
        type: "epic",
        label: "Epic",
        icon: Target,
        description: "A large body of work that can be broken down into features"
      },
      {
        type: "feature",
        label: "Feature",
        icon: Puzzle,
        description: "A significant piece of functionality that delivers business value"
      }
    ]
  }, [parentItem])

  const handleTypeSelection = (type: WorkItemType) => {
    setSelectedType(type)
  }

  const handleCreationMethodSelect = (method: CreationMethod) => {
    setCreationMethod(method)  // Set the method first
    
    // If parent is already known, skip parent selection and set it directly
    if (parentItem) {
      if (method === "ai") {
        // For AI generation, go straight to options/prompt
        if (selectedType === "feature") {
          setAIGenerationStep("options")
        } else {
          setAIGenerationStep("prompt")
        }
      } else if (method === "template") {
        // Create with template content
        const workItem = {
          type: selectedType!,
          title: `Untitled ${selectedType}`,
          description: getTemplateContent(selectedType!),
          parentId: parentItem.id,
          status: "todo"
        }
        onCreateWorkItem(workItem)
        onClose()
      } else if (method === "blank") {
        // Create blank work item
        const workItem = {
          type: selectedType!,
          title: `Untitled ${selectedType}`,
          description: "",
          parentId: parentItem.id,
          status: "todo"
        }
        onCreateWorkItem(workItem)
        onClose()
      }
    } else {
      // Rest of the existing logic for when there's no parent
      if (selectedType === "epic") {
        if (method === "ai") {
          setAIGenerationStep("prompt")
        } else if (method === "template") {
          handleParentSelection("")
        } else {
          handleParentSelection("")
        }
      } else {
        setCreationMethod("select-parent")
        if (method === "ai") {
          setSelectedParentId("ai")
        } else if (method === "template") {
          setSelectedParentId("template")
        } else if (method === "blank") {
          setSelectedParentId("blank")
        }
      }
    }
  }

  const handleBack = () => {
    setSelectedType(null)
  }

  const handleParentSelection = useCallback((parentId: string) => {
    if (selectedParentId === "ai") {
      // AI generation flow remains the same
      setSelectedParentId(parentId)
      setCreationMethod("ai")
      
      if (selectedType === "feature") {
        setAIGenerationStep("options")
      } else {
        setAIGenerationStep("prompt")
      }
    } else if (selectedParentId === "template") {
      // Template flow
      const workItem = {
        type: selectedType!,
        title: `Untitled ${selectedType}`,
        description: getTemplateContent(selectedType!),
        parentId: parentId || undefined,
        status: "todo"
      }
      onCreateWorkItem(workItem)
      onClose()
    } else if (selectedParentId === "blank") {
      // Blank flow
      const workItem = {
        type: selectedType!,
        title: `Untitled ${selectedType}`,
        description: "",
        parentId: parentId || undefined,
        status: "todo"
      }
      onCreateWorkItem(workItem)
      onClose()
    }
  }, [selectedType, creationMethod, selectedParentId, onCreateWorkItem, onClose])

  const getTemplateContent = (type: WorkItemType): string => {
    switch (type) {
      case "epic":
        return SYSTEM_TEMPLATES.epic.content
      case "feature":
        return SYSTEM_TEMPLATES.feature.content
      case "story":
        return SYSTEM_TEMPLATES.userStory.content // Changed from story to userStory to match template key
      case "task":
        return "# Task\n\n## Description\n\n## Acceptance Criteria\n"
      default:
        return ""
    }
  }

  // New component for AI generation options
  const AIGenerationOptions = () => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <Button 
            variant="ghost" 
            onClick={() => {
              setCreationMethod("select-parent")
              setSelectedParentId("ai")
            }} 
            className="absolute left-4 top-4"
          >
            ← Back
          </Button>
          <DialogTitle className="text-center">
            Generation Options
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-6">
            {/* Feature Generation Option */}
            <div className="space-y-4">
              <Label>Feature Generation</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className={`w-full h-auto py-4 px-6 ${
                    !aiOptions.generateMultiple ? 'border-primary' : ''
                  }`}
                  onClick={() => setAIOptions(prev => ({ ...prev, generateMultiple: false }))}
                >
                  <div className="flex w-full items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-left">Single Feature</div>
                      <div className="w-[85%]">
                        <p className="text-sm text-muted-foreground mt-1 text-left break-words">
                          Generate one detailed feature
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {!aiOptions.generateMultiple && <Check className="h-4 w-4" />}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className={`w-full h-auto py-4 px-6 ${
                    aiOptions.generateMultiple ? 'border-primary' : ''
                  }`}
                  onClick={() => setAIOptions(prev => ({ ...prev, generateMultiple: true }))}
                >
                  <div className="flex w-full items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-left">Multiple Features</div>
                      <div className="w-[85%]">
                        <p className="text-sm text-muted-foreground mt-1 text-left break-words">
                          Generate a set of related features
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {aiOptions.generateMultiple && <Check className="h-4 w-4" />}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* User Stories Option */}
            <div className="space-y-4">
              <Label>User Stories</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className={`w-full h-auto py-4 px-6 ${
                    !aiOptions.includeUserStories ? 'border-primary' : ''
                  }`}
                  onClick={() => setAIOptions(prev => ({ ...prev, includeUserStories: false }))}
                >
                  <div className="flex w-full items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-left">Features Only</div>
                      <div className="w-[85%]">
                        <p className="text-sm text-muted-foreground mt-1 text-left break-words">
                          Generate features without stories
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {!aiOptions.includeUserStories && <Check className="h-4 w-4" />}
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className={`w-full h-auto py-4 px-6 ${
                    aiOptions.includeUserStories ? 'border-primary' : ''
                  }`}
                  onClick={() => setAIOptions(prev => ({ ...prev, includeUserStories: true }))}
                >
                  <div className="flex w-full items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-left">Include Stories</div>
                      <div className="w-[85%]">
                        <p className="text-sm text-muted-foreground mt-1 text-left break-words">
                          Generate stories for each feature
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {aiOptions.includeUserStories && <Check className="h-4 w-4" />}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setAIGenerationStep("prompt")}
            className="w-full mt-4"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (!selectedType) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {parentItem 
                ? `Add to ${parentItem.type.charAt(0).toUpperCase() + parentItem.type.slice(1)}`
                : "Create New Work Item"
              }
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              {
                type: "epic",
                label: "Epic",
                icon: Target,
                description: "A large body of work that can be broken down into features"
              },
              {
                type: "feature",
                label: "Feature",
                icon: Puzzle,
                description: "A significant piece of functionality that delivers business value"
              },
              {
                type: "story",
                label: "Story",
                icon: BookOpen,
                description: "A user-focused description of a feature or requirement"
              },
              {
                type: "task",
                label: "Task",
                icon: ListTodo,
                description: "A small, specific piece of work that needs to be completed"
              }
            ].map((option) => (
              <Button
                key={option.type}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleTypeSelection(option.type as WorkItemType)}
              >
                <div className="flex items-start gap-3 w-full">
                  <option.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground break-words">
                      {parentItem 
                        ? `Create a new ${option.label.toLowerCase()} under this ${parentItem.type}`
                        : option.description
                      }
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!creationMethod) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <Button variant="ghost" onClick={handleBack} className="absolute left-4 top-4">
              ← Back
            </Button>
            <DialogTitle className="text-center">
              Create {selectedType?.charAt(0).toUpperCase() + selectedType?.slice(1)}
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex justify-center items-center gap-6 mt-8 px-4">
            {/* Use Template */}
            <div
              onClick={() => handleCreationMethodSelect("template")}
              className="w-full max-w-[280px] transform -rotate-3 transition-transform hover:-translate-y-1"
            >
              <Card className="relative overflow-hidden cursor-pointer">
                <CardContent className="relative bg-white/95 mt-32 p-6">
                  <h3 className="text-xl font-semibold mb-2">Use Template</h3>
                  <p className="text-sm text-gray-600 mb-8">Start with a pre-built template</p>
                  <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </div>

            {/* Generate with AI */}
            <div
              onClick={() => handleCreationMethodSelect("ai")}
              className="w-full max-w-[320px] z-10 transform transition-transform hover:-translate-y-1"
            >
              <Card className="relative overflow-hidden border-2 cursor-pointer">
                <Badge className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Recommended
                </Badge>
                <CardContent className="relative bg-white/95 mt-40 p-6">
                  <h3 className="text-2xl font-semibold mb-2">Generate with AI</h3>
                  <p className="text-sm text-gray-600 mb-8">Describe what you need and let AI create it</p>
                  <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </div>

            {/* Start from blank */}
            <div
              onClick={() => handleCreationMethodSelect("blank")}
              className="w-full max-w-[280px] transform rotate-3 transition-transform hover:-translate-y-1"
            >
              <Card className="relative overflow-hidden cursor-pointer">
                <CardContent className="relative bg-white/95 mt-32 p-6">
                  <h3 className="text-xl font-semibold mb-2">Start from blank</h3>
                  <p className="text-sm text-gray-600 mb-8">Create from scratch</p>
                  <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (creationMethod === "ai") {
    // Show options for features regardless of parent
    if (selectedType === "feature" && aiGenerationStep === "options") {
      return <AIGenerationOptions />
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <Button 
              variant="ghost" 
              onClick={() => {
                if (aiGenerationStep === "prompt") {
                  if (selectedType === "epic") {
                    // For epics, go directly back to creation method selection
                    setCreationMethod(null)
                  } else if (selectedType === "feature") {
                    setAIGenerationStep("options")
                  } else {
                    setCreationMethod("select-parent")
                    setSelectedParentId("ai")
                  }
                } else if (aiGenerationStep === "options") {
                  setCreationMethod("select-parent")
                  setSelectedParentId("ai")
                } else {
                  setCreationMethod(null)
                }
              }} 
              className="absolute left-4 top-4"
            >
              ← Back
            </Button>
            <DialogTitle className="text-center">
              Generate {aiOptions.generateMultiple ? "Features" : selectedType?.charAt(0).toUpperCase() + selectedType?.slice(1)}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Only show title field for single feature generation */}
            {!aiOptions.generateMultiple && (
              <div className="grid gap-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder={`Enter ${selectedType} title or leave blank for AI to generate`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="prompt" className="flex items-center gap-2">
                {selectedType === "epic" ? (
                  <>
                    Prompt <span className="text-red-500">*</span>
                  </>
                ) : (
                  "Prompt (Optional)"
                )}
              </Label>
              <div className="relative">
                <Textarea
                  id="prompt"
                  placeholder={
                    selectedType === "epic"
                      ? "Use @ to reference related documents or work items. Describe the high-level goal and scope of your epic. What business value will it deliver?"
                      : aiOptions.generateMultiple
                        ? "Use @ to reference related documents or work items. Describe the features you need or leave blank to generate based on the epic"
                        : "Use @ to reference related documents or work items. Add specific requirements or leave blank to generate based on parent context"
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={cn(
                    "min-h-[150px] pr-24",
                    selectedType === "epic" && !prompt && "border-red-500"
                  )}
                  required={selectedType === "epic"}
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <ResourceSelector />
                  <Button
                    size="icon"
                    onClick={() => {
                      if (selectedType === "epic" && !prompt) {
                        toast.error("Please provide a description for your epic")
                        return
                      }
                      // Handle AI generation
                      console.log("Generating with AI", {
                        type: selectedType,
                        parentId: parentItem?.id,
                        options: aiOptions,
                        title,
                        prompt
                      })
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedType === "epic"
                  ? "Provide clear context and objectives. Reference existing documents with @ for better results."
                  : parentItem 
                    ? `AI will analyze the epic's context to generate ${aiOptions.generateMultiple ? 'features' : 'a feature'}${aiOptions.includeUserStories ? ' with user stories' : ''}. Use @ to reference additional context.`
                    : "AI responses may be inaccurate"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (creationMethod === "select-parent" && workspace) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <ParentSelection
            selectedType={selectedType!}
            onSelect={handleParentSelection}
            onBack={() => setCreationMethod(null)}
            workspaceId={workspace._id}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return null
}

