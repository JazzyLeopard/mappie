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
import { debounce } from "lodash";
import { Bold, ChevronDown, ChevronUp, Code, Italic, Loader2, LucideSeparatorVertical, Strikethrough, Underline } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { propertyPrompts } from "./constants";
import { BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@radix-ui/react-separator";

// Add this utility function at the top of your file
function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    function (txt) {
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
  onOpenBrainstormChat,
}: BlockEditorProps) {

  const [previousContent, setPreviousContent] = useState<string>('');
  const [newAIContent, setNewAIContent] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const updateProjectMutation = useMutation(api.projects.updateProject)

  const editor = useCreateBlockNote({
    initialContent: undefined
  })

  useEffect(() => {
    const initializeEditor = async () => {
      if (projectDetails[attribute]) {
        const newBlock = await editor.tryParseMarkdownToBlocks(projectDetails[attribute])
        editor.replaceBlocks(editor.document, newBlock)
      }
    }
    initializeEditor()
  }, [])

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
    await updateProjectMutation({ [attribute]: newAIContent, _id: projectDetails._id });
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


  const saveContent = async () => {
    const content = await editor.blocksToMarkdownLossy(editor.document)
    //const content = JSON.stringify(editor.document); // Retrieve the document content
    setProjectDetails(content);
  };

  useEffect(() => {
    if (editor) {
      editor.onChange(() => {
        saveContent();
      });
    }
  }, [editor, attribute, setProjectDetails]);

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

  // Renders the editor instance using a React component.
  return (
    <div className="min-h-full flex flex-col overflow-hidden">
      {/* @ts-ignore */}
      <BlockNoteContext.Provider value={editor}>
        <div className="sticky top-0 z-20 bg-white w-full">
          <div className="flex justify-between border rounded-lg pl-2 mt-2">
            <ToggleGroup className="py-1 laptop-1024:flex laptop-1024:flex-wrap laptop-1024:justify-start" type="single" defaultValue="none">
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
              <p className="mx-1 text-gray-200">|</p>
              <ToggleGroupItemNoHover value="ai" disabled={!projectDetails[attribute]} onClick={handleAIEnhancement}>
                <AiPromptButton
                  onClick={handleAIEnhancement}
                  disabled={isEditorEmpty || isLoading}
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
        <div className="flex-1 overflow-auto pt-4">
          {isLoading ? (
            <div className="mt-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <BlockNoteView className=""
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
}

{/* <AiPromptButton onToggle={toggleAiPrompt} {...{isAiPromptOpen}}/> */ }
