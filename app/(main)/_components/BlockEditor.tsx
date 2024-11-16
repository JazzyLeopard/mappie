"use client";

import "@/app/custom.css";
import { AiPromptButton } from "@/components/ui/AiPromptButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem, ToggleGroupItemNoHover } from "@/components/ui/toggle-group";
import { api } from "@/convex/_generated/api";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { BlockNoteContext, DefaultReactSuggestionItem, getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import { useMutation } from "convex/react";
import { Bold, ChevronDown, ChevronUp, Code, Italic, Loader2, Strikethrough, Underline } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { propertyPrompts } from "./constants";
import { useAuth } from "@clerk/nextjs";
import debounce from 'lodash/debounce';

// Add this utility function at the top of your file
function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

type ContextType = 'project' | 'useCase' | 'functionalRequirement' | 'epics' | 'userStories';

type BlockEditorProps = {
  onBlur: () => Promise<void>;
  attribute: string;
  projectDetails: any;
  setProjectDetails: (value: any) => void;
  context: ContextType;
};

const MarkdownContent = ({ children }: { children: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2" {...props} />,
      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2" {...props} />,
      li: ({ node, ...props }) => <li className="ml-2" {...props} />
    }}
    className="prose prose-sm max-w-none"
  >
    {children}
  </ReactMarkdown>
);

export default function BlockEditor({
  onBlur,
  attribute,
  projectDetails,
  setProjectDetails,
  context,
}: BlockEditorProps) {

  const { getToken } = useAuth();
  const [previousContent, setPreviousContent] = useState<string>('');
  const [newAIContent, setNewAIContent] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [generatedProperties, setGeneratedProperties] = useState<Record<string, boolean>>({});

  const updateProjectMutation = useMutation(api.projects.updateProject);
  const updateUseCaseMutation = useMutation(api.useCases.updateUseCase);
  const updateFunctionalRequirementMutation = useMutation(api.functionalRequirements.updateFunctionalRequirement);
  const updateEpicMutation = useMutation(api.epics.updateEpic)
  const updateUserStoryMutation = useMutation(api.userstories.updateUserStory)

  const editor = useCreateBlockNote({
    initialContent: undefined // Don't set initial content here
  });
  
  // Track if we're currently initializing content
  const [isInitializing, setIsInitializing] = useState(true);
  const [initialContent, setInitialContent] = useState<string>('');
  
  // Initialize content only once when component mounts
  useEffect(() => {
    const initializeEditor = async () => {
      if (projectDetails && projectDetails[attribute] && 
          projectDetails[attribute] !== initialContent) {
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(
            projectDetails[attribute] || ''
          );
          editor.replaceBlocks(editor.document, blocks);
          setInitialContent(projectDetails[attribute]);
          setIsInitializing(false);
        } catch (error) {
          console.error("Error initializing editor:", error);
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };

    initializeEditor();
  }, [editor, projectDetails, attribute]);

  const handleOnBlur = async () => {
    onBlur();
  }

  const jsonReplacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Define the mapping for prompts based on context and attribute
  const promptMapping: { [key: string]: { [key: string]: string } } = {
    project: {
      overview: propertyPrompts['overview'],
      problemStatement: propertyPrompts['problemStatement'],
      userPersonas: propertyPrompts['userPersonas'],
      featuresInOut: propertyPrompts['featuresInOut'],
      successMetrics: propertyPrompts['successMetrics'],
      userScenarios: propertyPrompts['userScenarios'],
      featurePrioritization: propertyPrompts['featurePrioritization'],
      risksDependencies: propertyPrompts['risksDependencies'],
    },
    useCase: {
      description: propertyPrompts['useCases'],
    },
    functionalRequirement: {
      description: propertyPrompts['functionalRequirements'],
    },
    epics: {
      description: propertyPrompts['epics']
    },
    userStories: {
      description: propertyPrompts['userStories']
    }
  };

  const handleAIEnhancement = async (customPrompt?: string) => {
    setIsLoading(true);

    let currentContent = null;
    if (!isEditorEmpty) {
      currentContent = await editor.blocksToMarkdownLossy(editor.document);
      setPreviousContent(currentContent);
    }

    // Determine the correct prompt based on context and attribute
    let prompt = promptMapping[context]?.[attribute] || "Enhance the following content:";

    // Log the selected prompt for debugging
    console.log("Selected Prompt:", prompt);
    console.log("Context:", context);
    console.log("Attribute:", attribute);

    try {
      const token = await getToken({ template: "convex" });
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: attribute,
          data: currentContent,
          instructions: customPrompt || prompt,
          projectDetails: projectDetails,
          context: context,
        }, jsonReplacer),
      });

      const result = await response.json();

      currentContent = await editor.blocksToMarkdownLossy(editor.document);
      setPreviousContent(currentContent);

      if (response.ok) {
        setNewAIContent(result.response);
        setShowComparison(true);

        setGeneratedProperties(prev => ({
          ...prev,
          [attribute]: true, // Mark this specific attribute as generated
        }));

        // Request a summary of changes
        setIsSummaryLoading(true);
        const summaryResponse = await fetch('/api/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldContent: currentContent,
            newContent: result.response,
          }),
        });
        const summaryResult = await summaryResponse.json();
        setChangeSummary(summaryResult.summary);
        setIsSummaryLoading(false);
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAIContent = async () => {
    await handleAIResponse(newAIContent);

    setShowComparison(false);
  };

  type StyleKeys = keyof typeof editor.schema.styleSchema;

  const toggleStyle = (style: StyleKeys) => {
    editor.focus();
    console.log("Current active styles:", editor.getActiveStyles());

    if (editor.schema.styleSchema[style].propSchema !== "boolean") {
      throw new Error("can only toggle boolean styles");
    }

    const isActive = style in editor.getActiveStyles();
    editor.toggleStyles({ [style]: !isActive } as any);
    console.log("updated active styles:", editor.getActiveStyles());
  };

  // Track the last cursor position
  const [lastCursorPosition, setLastCursorPosition] = useState<any>(null);

  const saveContent = useCallback(async () => {
    if (isInitializing) return;

    try {
      const markdownContent = await editor.blocksToMarkdownLossy(editor.document);
      
      // Update local state
      setProjectDetails((prev: any) => ({
        ...prev,
        [attribute]: markdownContent
      }));

      // Save to database
      switch (context) {
        case 'userStories':
          await updateUserStoryMutation({
            id: projectDetails._id,
            description: markdownContent
          });
          break;
        case 'epics':
          await updateEpicMutation({
            _id: projectDetails._id,
            description: markdownContent
          });
          break;
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  }, [editor, projectDetails._id, attribute, context, isInitializing]);

  // Custom function to get filtered Slash Menu items
  const getCustomSlashMenuItems = (
    editor: BlockNoteEditor
  ): DefaultReactSuggestionItem[] => {
    const defaultItems = getDefaultReactSlashMenuItems(editor);
    // Filter out the Heading items
    return defaultItems.filter(
      (item) => !["Heading 1", "Heading 2", "Heading 3"].includes(item.title)
    );
  };

  // Function to handle AI responses
  const handleAIResponse = async (aiResponse: string) => {
    try {
      // Parse the markdown to blocks
      const blocks = await editor.tryParseMarkdownToBlocks(aiResponse);
      
      // Replace the current content with new blocks
      editor.replaceBlocks(editor.document, blocks);
      
      // Update local state
      setProjectDetails({
        ...projectDetails,
        [attribute]: aiResponse
      });

      // Create mutation payload based on context
      switch (context) {
        case 'project':
          await updateProjectMutation({
            _id: projectDetails._id,
            [attribute]: aiResponse
          });
          break;
        case 'useCase':
          await updateUseCaseMutation({
            id: projectDetails._id,
            [attribute]: aiResponse
          });
          break;
        case 'functionalRequirement':
          await updateFunctionalRequirementMutation({
            id: projectDetails._id,
            content: aiResponse
          });
          break;
        case 'epics':
          await updateEpicMutation({
            _id: projectDetails._id,
            [attribute]: aiResponse
          });
          break;
        case 'userStories':
          await updateUserStoryMutation({
            id: projectDetails._id,
            [attribute]: aiResponse
          });
          break;
      }

      console.log("Content saved to convex Db", aiResponse);
    } catch (error) {
      console.error("Error handling AI response:", error);
    }
  };

  const checkEditorContent = useCallback(async () => {
    const content = await editor.blocksToMarkdownLossy(editor.document);
    setIsEditorEmpty(content.trim() === '');
  }, [editor]);

  useEffect(() => {
    checkEditorContent(); // Check initial content
    editor.onChange(checkEditorContent);

    return () => {
      // No need to explicitly remove the listener
      // The editor instance will be destroyed when the component unmounts
    };
  }, [editor, checkEditorContent]);

  // Update the editor when projectDetails changes
  useEffect(() => {
    const updateEditorContent = async () => {
      if (projectDetails && projectDetails[attribute]) {
        const blocks = await editor.tryParseMarkdownToBlocks(
          typeof projectDetails[attribute] === 'string' 
            ? projectDetails[attribute] 
            : ''
        );
        editor.replaceBlocks(editor.document, blocks);
      }
    };

    updateEditorContent();
  }, [editor, projectDetails, attribute]);

  // Add this state to track selection
  const [hasSelection, setHasSelection] = useState(false);

  // Add a selection change handler
  const handleSelectionChange = useCallback(() => {
    const selection = editor.getSelection();
    setHasSelection(!!selection);
  }, [editor]);

  // Renders the editor instance using a React component.
  return (
    <div className="min-h-full flex flex-col">
      {/* @ts-ignore */}
      <BlockNoteContext.Provider value={editor}>
        <div className="sticky top-0 z-20 bg-white w-full mb-2">
          <div className="flex justify-between rounded-lg pl-1 mt-2">
            <ToggleGroup className="py-1 laptop-1024:flex laptop-1024:flex-wrap laptop-1024:justify-start" type="single" defaultValue="none">
              <ToggleGroupItem value="bold" className="border mr-3" onClick={() => toggleStyle("bold")}>
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" className="border mr-3" onClick={() => toggleStyle("italic")}>
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" className="border mr-3" onClick={() => toggleStyle("underline")}>
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="strike" className="border mr-3" onClick={() => toggleStyle("strike")}>
                <Strikethrough className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="code" className="border mr-3" onClick={() => toggleStyle("code")}>
                <Code className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItemNoHover value="ai">
                <AiPromptButton
                  onClick={(customPrompt) => handleAIEnhancement(customPrompt)}
                  hasExistingContent={generatedProperties[attribute] || !isEditorEmpty}
                  loading={isLoading}
                  showingComparison={showComparison}
                />
              </ToggleGroupItemNoHover>
              {/* <ToggleGroupItemNoHover value="brainstorm" onClick={onOpenBrainstormChat}>
                <BrainstormChatButton />
              </ToggleGroupItemNoHover> */}
            </ToggleGroup>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pt-4">
          {isLoading ? (
            <div className="mt-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <BlockNoteView
              editor={editor}
              formattingToolbar={false}
              data-theming-css
              sideMenu={true}
              slashMenu={false}
              onBlur={handleOnBlur}
              onChange={() => {
                if (!isInitializing) {
                  saveContent();
                }
              }}
            />
          )}
        </div>
      </BlockNoteContext.Provider>
      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Compare and Confirm - {toTitleCase(attribute)}</h2>
              <Button
                variant="outline"
                onClick={() => setShowSummary(!showSummary)}
                className="mb-4 flex items-center hover:text-blue-800"
              >
                {showSummary ? <ChevronUp className="mr-2" /> : <ChevronDown className="mr-2" />}
                {showSummary ? "Hide Summary" : "Show Summary of Changes"}
              </Button>
              {showSummary && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Summary of Changes:</h3>
                  {isSummaryLoading ? (
                    <div className="flex items-center text-gray-500">
                      <Loader2 className="animate-spin mr-2" />
                      Generating summary...
                    </div>
                  ) : (
                    <MarkdownContent>{changeSummary}</MarkdownContent>
                  )}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Previous Content</h3>
                  <div className="border p-4 rounded bg-gray-50 max-h-[30vh] overflow-y-auto">
                    <MarkdownContent>{previousContent}</MarkdownContent>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">New AI-Generated Content</h3>
                  <div className="border p-4 rounded bg-blue-50 max-h-[30vh] overflow-y-auto">
                    <MarkdownContent>{newAIContent}</MarkdownContent>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setShowComparison(false)}>Cancel</Button>
                <Button onClick={handleConfirmAIContent}>Confirm and Apply</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .bn-side-menu {
          z-index: -10;
        }
      `}</style>
    </div>
  );
}

{/* <AiPromptButton onToggle={toggleAiPrompt} {...{isAiPromptOpen}}/> */ }

