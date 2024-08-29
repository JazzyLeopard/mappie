"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCreateBlockNote, getDefaultReactSlashMenuItems, DefaultReactSuggestionItem, SuggestionMenuController, BlockNoteContext, CreateLinkButton, NestBlockButton, UnnestBlockButton } from "@blocknote/react";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@/app/custom.css";
import { AiPromptButton } from "@/components/ui/AiPromptButton";
import { propertyPrompts } from "./constants";
import { Bold, Italic, Underline, Strikethrough, Code, MessageSquare, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { debounce } from "lodash";
import { ToggleGroup, ToggleGroupItem, ToggleGroupItemNoHover } from "@/components/ui/toggle-group";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import BrainstormChatButton from "./ChatButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Add this utility function at the top of your file
function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

type BlockEditorProps = {
  onBlur: () => Promise<void>;
  attribute: string;
  projectDetails: any;
  setProjectDetails: (value: any) => void;
  onOpenBrainstormChat: () => void;
};

const MarkdownContent = ({ children }: { children: string }) => (
  <ReactMarkdown 
    remarkPlugins={[remarkGfm]}
    components={{
      ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2" {...props} />,
      ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2" {...props} />,
      li: ({node, ...props}) => <li className="ml-2" {...props} />
    }}
    className="prose prose-sm max-w-none"
  >
    {children}
  </ReactMarkdown>
);

const BlockEditor: React.FC<BlockEditorProps> = ({
  onBlur,
  attribute,
  projectDetails,
  setProjectDetails,
  onOpenBrainstormChat,
}) => {
  if (!projectDetails || !attribute || typeof setProjectDetails !== 'function') {
    console.error('BlockEditor: Missing required props', { projectDetails, attribute, setProjectDetails });
    return null; // or some fallback UI
  }

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [previousContent, setPreviousContent] = useState<string>('');
  const [newAIContent, setNewAIContent] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [formattedData, setFormattedData] = useState<string>()
  const [showSummary, setShowSummary] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const editor = useCreateBlockNote({ initialContent: undefined });

  const handleEditorChange = useCallback(() => {
    if (!editor || !editor.document) return;

    const saveContent = async () => {
      const content = await editor.blocksToMarkdownLossy(editor.document);
      console.log('BlockEditor: Saving content', { attribute, content });
      setProjectDetails((prevDetails: any) => {
        console.log('BlockEditor: Previous details', prevDetails);
        const newDetails = { ...prevDetails, [attribute]: content };
        console.log('BlockEditor: New details', newDetails);
        return newDetails;
      });
    };
    saveContent();
  }, [editor, attribute, setProjectDetails]);

  const checkEditorContent = useCallback(() => {
    if (!editor || !editor.document) return;

    editor.blocksToMarkdownLossy(editor.document).then(content => {
      setIsEditorEmpty(content.trim() === '');
    });
  }, [editor]);

  useEffect(() => {
    if (!editor || !projectDetails || !projectDetails[attribute]) return;

    const initializeEditor = async () => {
      const newBlock = await editor.tryParseMarkdownToBlocks(projectDetails[attribute]);
      editor.replaceBlocks(editor.document, newBlock);
    };
    initializeEditor();
  }, [editor, projectDetails, attribute]);

  const updateProjectMutation = useMutation(api.projects.updateProject)

  const handleOnBlur = async () => {
    onBlur();
    const formatted = await editor.blocksToMarkdownLossy(editor.document);
    setFormattedData(formatted)
  }

  const jsonReplacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  const handleAIEnhancement = async () => {
    setIsLoading(true);
    const currentContent = await editor.blocksToMarkdownLossy(editor.document);
    setPreviousContent(currentContent);
    const prompt = propertyPrompts[attribute] || "Enhance the following content:";

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: attribute,
          data: currentContent,
          instructions: prompt,
          projectDetails: projectDetails,
        }, jsonReplacer),
      });

      const result = await response.json();

      if (response.ok) {
        setNewAIContent(result.response);
        setShowComparison(true);
        
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
    // Focus the editor before making changes
    editor.focus();

    // Retrieve the block using getBlock
    const block = await editor.tryParseMarkdownToBlocks(aiResponse)

    //Function to save the Markdown content to db
    const markDownContent = await editor.blocksToMarkdownLossy(block)

    try {
      await updateProjectMutation({
        [attribute]: markDownContent, _id: projectDetails._id,
      })

      console.log("Content saved to convex Db", markDownContent);
    } catch (error) {
      console.log("Error saving content to db", error);
      return
    }

    editor.replaceBlocks(editor.document, block);

    if (!block) {
      console.error("Block not found!");
      return;
    }
    console.log("Current Block:", block);
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* @ts-ignore */}
      <BlockNoteContext.Provider value={editor}>
        <div className="sticky top-0 z-20 bg-white">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <ToggleGroup className="py-2" type="single" defaultValue="none">
              <ToggleGroupItem value="bold" onClick={() => toggleStyle("bold")}>
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" onClick={() => toggleStyle("italic")}>
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" onClick={() => toggleStyle("underline")}>
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="strike" onClick={() => toggleStyle("strike")}>
                <Strikethrough className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="code" onClick={() => toggleStyle("code")}>
                <Code className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItemNoHover value="ai" onClick={handleAIEnhancement}>
                <AiPromptButton 
                  onClick={handleAIEnhancement} 
                  disabled={isEditorEmpty || isLoading} 
                  loading={isLoading} 
                  showingComparison={showComparison}
                  asChild={true}
                  className="w-full p-1 px-2"
                />
              </ToggleGroupItemNoHover>
              {/* <ToggleGroupItemNoHover value="brainstorm" onClick={onOpenBrainstormChat}>
                <BrainstormChatButton />
              </ToggleGroupItemNoHover> */}
            </ToggleGroup>
          </div>
        </div>
        <div className="flex-1 overflow-auto pt-4">
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
            >
              <SuggestionMenuController
                triggerCharacter={"/"}
                getItems={async (query) =>
                  filterSuggestionItems(getCustomSlashMenuItems(editor), query)
                }
              />
            </BlockNoteView>
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
};

export default BlockEditor;
