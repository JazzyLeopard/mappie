"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote, getDefaultReactSlashMenuItems, DefaultReactSuggestionItem, SuggestionMenuController, BlockNoteContext } from "@blocknote/react";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@/app/custom.css";
import { AiPromptButton } from "@/components/ui/AiPromptButton";
import { propertyPrompts } from "./constants";
import { useState, useEffect, useCallback } from "react";
import { Bold, Italic, Underline, Strikethrough, Code, MessageSquare } from "lucide-react"
import { debounce } from "lodash";
import { ToggleGroup, ToggleGroupItem, ToggleGroupItemNoHover } from "@/components/ui/toggle-group";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import BrainstormChatButton from "./ChatButton";

type BlockEditorProps = {
  onBlur: () => Promise<void>;
  attribute: string;
  projectDetails: any;
  setProjectDetails: (value: any) => void;
  onOpenBrainstormChat: () => void; // Add this new prop
};

export default function BlockEditor({
  onBlur,
  attribute,
  projectDetails,
  setProjectDetails,
  onOpenBrainstormChat, // Add this new prop
}: BlockEditorProps) {

  const [formattedData, setFormattedData] = useState<string>()

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
    const formatted = await editor.blocksToMarkdownLossy(editor.document);
    setFormattedData(formatted)
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
        handleAIResponse(result.response);
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setIsLoading(false);
    }
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


  const saveContent = debounce(async () => {
    const content = await editor.blocksToMarkdownLossy(editor.document)
    //const content = JSON.stringify(editor.document); // Retrieve the document content
    setProjectDetails((prevDetails: any) => ({
      ...prevDetails,
      [attribute]: content,
    }));
    setProjectDetails(content)

  }, 2000);

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
    <>
      <div>
        {/* @ts-ignore */}
        <BlockNoteContext.Provider value={editor}>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <ToggleGroup type="single" defaultValue="none">
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
                <AiPromptButton onClick={handleAIEnhancement} disabled={isEditorEmpty || isLoading} loading={isLoading} />
              </ToggleGroupItemNoHover>
              <ToggleGroupItemNoHover value="brainstorm" onClick={onOpenBrainstormChat}>
                <BrainstormChatButton />
              </ToggleGroupItemNoHover>
            </ToggleGroup>
          </div>
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
              sideMenu={false}
              slashMenu={false} // Disable default Slash Menu
              onBlur={handleOnBlur}
              style={{ paddingTop: "16px" }}
            >
              <SuggestionMenuController
                triggerCharacter={"/"}
                // Replaces the default Slash Menu items with our custom ones.
                getItems={async (query) =>
                  filterSuggestionItems(getCustomSlashMenuItems(editor), query)
                }
              />
            </BlockNoteView>
          )}
          {/* <h1>Formatted Data: {formattedData}</h1> */}
        </BlockNoteContext.Provider>
      </div>

    </>
  );
}

{/* <AiPromptButton onToggle={toggleAiPrompt} {...{isAiPromptOpen}}/> */ }