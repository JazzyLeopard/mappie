/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import * as React from 'react';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { CAN_USE_DOM } from './shared/canUseDOM';
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS, ELEMENT_TRANSFORMERS, TEXT_FORMAT_TRANSFORMERS, TEXT_MATCH_TRANSFORMERS, ORDERED_LIST } from '@lexical/markdown';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { debounce } from 'lodash';

import { createWebsocketProvider } from './collaboration';
import { useSettings } from './context/SettingsContext';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import CommentPlugin from './plugins/CommentPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';
import FigmaPlugin from './plugins/FigmaPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import PollPlugin from './plugins/PollPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableHoverActionsPlugin from './plugins/TableHoverActionsPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import ContentEditable from './ui/ContentEditable';
import { $createParagraphNode, $createTextNode, $getRoot, $getSelection, COMMAND_PRIORITY_LOW, createCommand, LexicalCommand } from 'lexical';
import { DEFAULT_TRANSFORMERS } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Doc } from 'yjs';
import { Provider } from '@lexical/yjs';
import { WebsocketProvider } from 'y-websocket';
import { Id } from '@/convex/_generated/dataModel';
import { PASTE_COMMAND } from 'lexical';
import AIEditPlugin, { SuggestionCardNode } from './plugins/AiEditPlugin';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { ENHANCED_TRANSFORMERS, PLAYGROUND_TRANSFORMERS } from './plugins/MarkdownTransformers';
import MarkdownPlugin from './plugins/MarkdownShortcutPlugin';

const skipCollaborationInit =
  // @ts-expect-error
  window.parent != null && window.parent.frames.right === window;

type EditorProps = {
  attribute: string;
  setProjectDetails: (value: any) => void;
  initialContent?: string;
  context: string;
  itemId: string;
};

function EditorOnChangePlugin({ onChange }: { onChange: (editorState: any) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let isUpdating = false;

    return editor.registerUpdateListener(({ editorState }) => {
      // Prevent recursive updates
      if (isUpdating) return;

      try {
        isUpdating = true;
        const json = JSON.stringify(editorState.toJSON());
        onChange(json);
      } finally {
        isUpdating = false;
      }
    });
  }, [editor, onChange]);

  return null;
}

// Define the custom command
const UPDATE_EDITOR_COMMAND: LexicalCommand<void> = createCommand('UPDATE_EDITOR');

export default function Editor({
  attribute,
  setProjectDetails,
  initialContent,
  context,
  itemId,
}: EditorProps): JSX.Element {
  const { historyState } = useSharedHistoryContext();
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      hasLinkAttributes,
      isCharLimitUtf8,
      isRichText,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings();

  const [editor] = useLexicalComposerContext();
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const isInitialized = useRef(false);

  // Get mutations
  const updateProject = useMutation(api.projects.updateProject);
  const updateEpic = useMutation(api.epics.updateEpic);
  const updateUserStory = useMutation(api.userstories.updateUserStory);

  const handleChange = useCallback((editorStateJSON: string) => {
    if (context === 'epics') {
      try {
        editor.update(() => {
          const markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
          
          // Update the project details with the markdown
          setProjectDetails(markdown);
          
          // Force editor update to ensure proper rendering
          editor.dispatchCommand(UPDATE_EDITOR_COMMAND, undefined);
        });
      } catch (error) {
        console.error('Error converting to markdown:', error);
      }
    }
  }, [context, editor, setProjectDetails]);

  // Initialize editor content
  useEffect(() => {
    if (editor && initialContent && !isInitialized.current) {
      isInitialized.current = true;

      editor.update(() => {
        try {
          // First try to parse as JSON
          const parsedContent = JSON.parse(initialContent);

          // Check if this is a markdown string stored in JSON
          if (typeof parsedContent === 'string' && parsedContent.includes('**')) {
            // Convert markdown to Lexical nodes
            $convertFromMarkdownString(parsedContent, TRANSFORMERS);
          } else {
            // If it's a Lexical state JSON, use it directly
            const state = editor.parseEditorState(parsedContent);
            editor.setEditorState(state);
          }
        } catch (error) {
          // If JSON parsing fails, treat the content as direct markdown
          if (typeof initialContent === 'string' && initialContent.includes('**')) {
            $convertFromMarkdownString(initialContent, TRANSFORMERS);
          } else {
            // Fallback to creating a new paragraph with plain text
            const root = $getRoot();
            root.clear();
            const paragraph = $createParagraphNode();
            const text = $createTextNode(String(initialContent));
            paragraph.append(text);
            root.append(paragraph);
          }
        }
      });
    }
  }, [editor, initialContent]);

  // Viewport size handling
  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);
    return () => window.removeEventListener('resize', updateViewPortWidth);
  }, [isSmallWidthViewport]);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const placeholder = isCollab
    ? 'Enter some collaborative rich text...'
    :
    'Enter your text here...';

  // Modify the insertMarkdown function to handle immediate updates
  const insertMarkdown = useCallback((markdown: string) => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      $convertFromMarkdownString(markdown, TRANSFORMERS);

      // Use the properly typed command
      editor.dispatchCommand(UPDATE_EDITOR_COMMAND, undefined);

      // Also update the project details
      setProjectDetails(markdown);
    });
  }, [editor, setProjectDetails]);

  // Add a command listener for updates
  useEffect(() => {
    if (editor) {
      return editor.registerCommand(
        UPDATE_EDITOR_COMMAND,
        () => {
          editor.getEditorState().read(() => {
            // Force a re-render of the editor
            editor.update(() => { }, { discrete: true });
          });
          return true;
        },
        1
      );
    }
  }, [editor]);

  useEffect(() => {
    // Register paste handler
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const pastedText = event.clipboardData?.getData('text/plain');
        if (pastedText?.trim()) {
          // Check for markdown content
          if (pastedText.match(/[#\-*`>]|\d+\./)) {
            event.preventDefault();
            
            editor.update(() => {
              $convertFromMarkdownString(pastedText, ENHANCED_TRANSFORMERS);
            });
            
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return (
    <>
      {isRichText && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
      <div className="w-full">
        <DragDropPaste />
        <AutoFocusPlugin />
        <HistoryPlugin externalHistoryState={isCollab ? historyState : undefined} />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <EmojiPickerPlugin />
        <AutoEmbedPlugin />
        <EditorOnChangePlugin onChange={handleChange} />
        <MarkdownInsertionPlugin onInsertMarkdown={insertMarkdown} />
        <RichTextPlugin
          contentEditable={
            <div className="h-full w-full overflow-auto scrollbar-thin">
              <div className="w-full min-h-[900px] relative" ref={onRef}>
                <ContentEditable
                  className="h-full w-full pl-6 outline-none"
                  placeholder={placeholder}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <MarkdownPlugin />
        <CodeHighlightPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        <TablePlugin
          hasCellMerge={tableCellMerge}
          hasCellBackgroundColor={tableCellBackgroundColor}
        />
        <TableCellResizer />
        <ImagesPlugin />
        <InlineImagePlugin />
        <LinkPlugin hasLinkAttributes={hasLinkAttributes} />
        <PollPlugin />
        <TwitterPlugin />
        <YouTubePlugin />
        <FigmaPlugin />
        <ClickableLinkPlugin disabled={false} />
        <HorizontalRulePlugin />
        <EquationsPlugin />
        <ExcalidrawPlugin />
        <TabFocusPlugin />
        <TabIndentationPlugin />
        <CollapsiblePlugin />
        <PageBreakPlugin />
        <LayoutPlugin />

        {floatingAnchorElem && !isSmallWidthViewport && (
          <>
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            <AIEditPlugin anchorElem={floatingAnchorElem} />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <TableCellActionMenuPlugin
              anchorElem={floatingAnchorElem}
              cellMerge={true}
            />
            <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </>
        )}

        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
            maxLength={5}
          />
        )}
        {isAutocomplete && <AutocompletePlugin />}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
      </div>
    </>
  );
}

// Update the MarkdownInsertionPlugin to handle immediate updates
function MarkdownInsertionPlugin({
  onInsertMarkdown
}: {
  onInsertMarkdown: (markdown: string) => void
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editor && typeof window !== 'undefined') {
      (window as any).__lexicalEditor = editor;
      (window as any).__insertMarkdown = (markdown: string) => {
        onInsertMarkdown(markdown);

        // Use the properly typed command
        editor.update(() => {
          editor.dispatchCommand(UPDATE_EDITOR_COMMAND, undefined);
        });
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__lexicalEditor;
        delete (window as any).__insertMarkdown;
      }
    };
  }, [editor, onInsertMarkdown]);

  return null;
}