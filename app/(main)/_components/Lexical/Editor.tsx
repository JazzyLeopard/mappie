/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { $createParagraphNode, $createTextNode, $getRoot, createCommand, LexicalCommand } from 'lexical';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSettings } from './context/SettingsContext';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
import AIEditPlugin from './plugins/AiEditPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';
import FigmaPlugin from './plugins/FigmaPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownPlugin from './plugins/MarkdownShortcutPlugin';
import { ENHANCED_TRANSFORMERS } from './plugins/MarkdownTransformers';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import PollPlugin from './plugins/PollPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableHoverActionsPlugin from './plugins/TableHoverActionsPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import { CAN_USE_DOM } from './shared/canUseDOM';
import ContentEditable from './ui/ContentEditable';
import { $createParagraphNode, $createTextNode, $getRoot, $isRangeSelection, $getSelection, COMMAND_PRIORITY_LOW, createCommand, LexicalCommand, LexicalNode, $insertNodes } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { PASTE_COMMAND } from 'lexical';
import AIEditPlugin from './plugins/AiEditPlugin';
import MarkdownPlugin from './plugins/MarkdownShortcutPlugin';
import { ENHANCED_TRANSFORMERS } from './plugins/MarkdownTransformers';
import { IS_APPLE } from './shared/environment';
import { Command } from 'lucide-react';
import AiGenerationIcon from '@/icons/AI-Generation';
import AIWriterPlugin from './plugins/AIWriterPlugin';


type EditorProps = {
  attribute: string;
  setProjectDetails: (value: any) => void;
  initialContent?: string;
  context: string;
  itemId: string;
};

function EditorOnChangePlugin({ onChange }: { onChange: (markdown: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const lastMarkdownRef = useRef<string>("");

  const debouncedOnChange = useMemo(
    () => debounce((markdown: string) => {
      onChange(markdown);
    }, 1000),
    [onChange]
  );

  const normalizeMarkdown = (markdown: string): string => {
    return markdown.replace(/\n+$/, '').trim();
  };

  useEffect(() => {
    let isUpdating = false;

    return editor.registerUpdateListener(({ editorState }) => {
      if (isUpdating) return;

      try {
        isUpdating = true;

        // Convert directly to markdown
        const currentMarkdown = editorState.read(() => {
          return $convertToMarkdownString(ENHANCED_TRANSFORMERS);
        });

        const normalizedCurrent = normalizeMarkdown(currentMarkdown);
        const normalizedLast = normalizeMarkdown(lastMarkdownRef.current);

        if (normalizedCurrent !== normalizedLast) {
          lastMarkdownRef.current = normalizedCurrent;
          debouncedOnChange(normalizedCurrent);
        }
      } finally {
        isUpdating = false;
      }
    });
  }, [editor, debouncedOnChange]);

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return null;
}

// Define the custom command
const UPDATE_EDITOR_COMMAND: LexicalCommand<void> = createCommand('UPDATE_EDITOR');

const KeyboardShortcut = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 bg-slate-200 px-1.5 py-0.5 rounded-md text-slate-600 text-xs">
    {children}
  </span>
);

export default function Editor({
  setProjectDetails,
  initialContent,
  context,
}: EditorProps): JSX.Element {
  const { historyState } = useSharedHistoryContext();
  const {
    settings: {
      isCollab,
      isAutocomplete,
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

  const handleChange = useCallback((markdown: string) => {
    setProjectDetails(markdown);
  }, [setProjectDetails]);

  // Initialize editor with markdown content
  useEffect(() => {
    if (editor && initialContent && !isInitialized.current) {
      isInitialized.current = true;

      editor.update(() => {
        // Convert markdown to editor content
        if (typeof initialContent === 'string') {
          $convertFromMarkdownString(initialContent, ENHANCED_TRANSFORMERS);
        } else {
          // Fallback to creating a new paragraph with plain text
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          const text = $createTextNode(String(initialContent));
          paragraph.append(text);
          root.append(paragraph);
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

  const placeholder = useMemo(() => {
    if (isCollab) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-6 bg-slate-100 shadow-[0_0_2px_rgba(0,0,0,0.1)] rounded-xl"></div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-start gap-4 px-4 py-6 bg-slate-100 shadow-[0_0_2px_rgba(0,0,0,0.1)] rounded-xl">
        <div className="text-sm text-muted-foreground text-left space-y-2">
          <p>Start inserting elements by typing the <KeyboardShortcut>/</KeyboardShortcut> key! 📝 </p>
          <p>
            Use{' '}
            <KeyboardShortcut>
              {IS_APPLE ? <Command className="h-3 w-3" /> : <span>CTRL</span>}
              + E
            </KeyboardShortcut>
            {' '}to access the AI Editor ✨</p>
        </div>
      </div>
    );
  }, [isCollab, context]);

  // Modify the insertMarkdown function to handle immediate updates
  const insertMarkdown = useCallback((markdown: string) => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
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
        if (!pastedText?.trim()) return false;

        // More comprehensive markdown detection regex
        const hasMarkdown = /^(#{1,6} |\* |- |\d+\. |> |`{1,3}|---|===|\[.*?\]\(.*?\)|<.*?>)|\n(#{1,6} |\* |- |\d+\. |> |`{1,3})/.test(pastedText);
        
        if (hasMarkdown) {
          event.preventDefault();
          
          editor.update(() => {
            const selection = $getSelection();
            if (!selection || !$isRangeSelection(selection)) return false;

            try {
              // First try to convert the markdown to nodes
              const nodes = $convertFromMarkdownString(pastedText, ENHANCED_TRANSFORMERS);
              
              if (nodes as unknown as LexicalNode[]) {
                // Insert at current selection
                selection.insertNodes(nodes as unknown as LexicalNode[]);
                return true;
              }
            } catch (error) {
              console.error('Error converting markdown:', error);
              // Fallback to inserting as plain text
              selection.insertText(pastedText);
            }
          });
          
          return true;
        }
        
        // Let the default paste handler handle non-markdown text
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return (
    <>
      {isRichText && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
      <div className="w-full pb-8 pt-2 ">
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
              <div className="w-full min-h-[800px] relative" ref={onRef}>
                <ContentEditable
                  className="min-h-[800px] w-full pl-6 outline-none"
                  // @ts-ignore
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
            <AIWriterPlugin anchorElem={floatingAnchorElem} />
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

// Update the MarkdownInsertionPlugin
function MarkdownInsertionPlugin({
  onInsertMarkdown,
}: {
  onInsertMarkdown: (markdown: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editor && typeof window !== 'undefined') {
      (window as any).__lexicalEditor = editor;
      (window as any).__insertMarkdown = (markdown: string) => {
        onInsertMarkdown(markdown);
        editor.update(() => {
          editor.dispatchCommand(UPDATE_EDITOR_COMMAND, undefined);
        });
      };

      // Modified replace function
      (window as any).__replaceMarkdown = (markdown: string) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();

          try {
            // Convert markdown to nodes
            const nodes = $convertFromMarkdownString(
              markdown,
              ENHANCED_TRANSFORMERS
            );

            if (Array.isArray(nodes)) {
              // Use $insertNodes instead of direct append
              $insertNodes(nodes);
              
              // Ensure proper selection
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.anchor.set(root.getFirstChild()?.getKey() ?? '', 0, 'text');
                selection.focus.set(root.getFirstChild()?.getKey() ?? '', 0, 'text');
              }
            }
          } catch (error) {
            console.error('Error converting markdown during replace:', error);
            // Fallback with proper node insertion
            const paragraph = $createParagraphNode();
            const text = $createTextNode(markdown);
            paragraph.append(text);
            $insertNodes([paragraph]);
          }
        });

        // Force a reconciliation
        editor.update(() => {
          editor.dispatchCommand(UPDATE_EDITOR_COMMAND, undefined);
        });
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__lexicalEditor;
        delete (window as any).__insertMarkdown;
        delete (window as any).__replaceMarkdown;
      }
    };
  }, [editor, onInsertMarkdown]);

  return null;
}

// Update the window type declaration
declare global {
  interface Window {
    __lexicalEditor: any;
    __insertMarkdown: (markdown: string) => void;
    __replaceMarkdown: (markdown: string) => void;
  }
}