import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createCommand, LexicalCommand, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, $createRangeSelection, $setSelection, LexicalNode, $getRoot, createEditor, TextNode, ElementNode } from 'lexical';
import { useCallback, useEffect, useState, useRef } from 'react';
import PromptPopup from './PromptPopup';
import SuggestionCard from './SuggestionCard';
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { useParams } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { createPortal } from 'react-dom';
import { COMMAND_PRIORITY_NORMAL, KEY_MODIFIER_COMMAND } from 'lexical';
import { selectNode } from '@excalidraw/excalidraw/types/utils';
import { useAuth } from "@clerk/nextjs";


export const AI_WRITER_COMMAND: LexicalCommand<void> = createCommand('AI_WRITER_COMMAND');

export default function AIWriterPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptPosition, setPromptPosition] = useState<{ x: number; y: number } | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const selectionInfo = useRef<{
    anchor: { offset: number; key: string };
    focus: { offset: number; key: string };
  } | null>(null);
  const params = useParams();
  const { getToken } = useAuth();

  const handleButtonClick = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Store detailed selection information
        selectionInfo.current = {
          anchor: {
            offset: selection.anchor.offset,
            key: selection.anchor.key,
          },
          focus: {
            offset: selection.focus.offset,
            key: selection.focus.key,
          },
        };

        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setPromptPosition({
            x: rect.left,
            y: rect.bottom + window.scrollY + 10,
          });
          setShowPrompt(true);
        }
      }
    });
  }, [editor]);

  const handleGenerateAI = useCallback(async (prompt: string) => {
    try {
      const token = await getToken({ template: "convex" });
      
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          projectId: params?.projectId,
        }),
      });

      const data = await response.json();
      if (data.content) {
        setProgress(100);
        setTimeout(() => {
          setSuggestion(data.content);
        }, 500);
      }
    } catch (error) {
      console.error('AI Writer error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params?.projectId]);

  const handleAccept = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      
      // If no selection, try to use stored selection
      if (!selection || !$isRangeSelection(selection)) {
        if (selectionInfo.current) {
          const range = $createRangeSelection();
          range.anchor.set(selectionInfo.current.anchor.key, selectionInfo.current.anchor.offset, 'text');
          range.focus.set(selectionInfo.current.focus.key, selectionInfo.current.focus.offset, 'text');
          $setSelection(range);
        } else {
          return;
        }
      }

      // Get the current selection after potential restoration
      const currentSelection = $getSelection();
      if (!currentSelection || !$isRangeSelection(currentSelection)) return;

      try {
        // Instead of inserting text directly, convert from markdown first
        const nodes = $convertFromMarkdownString(
          suggestion || '',
          TRANSFORMERS,
          currentSelection.anchor.getNode() as ElementNode,
          true,        // Preserve new lines
        );

        // Insert the converted nodes at the current selection
        if (Array.isArray(nodes)) {
          currentSelection.insertNodes(nodes);
        }
      } catch (error) {
        console.error('Failed to convert markdown:', error);
        // Fallback to plain text if conversion fails
        currentSelection.insertText(suggestion || '');
      }
    });
    
    setSuggestion(null);
    selectionInfo.current = null;
  }, [editor, suggestion]);

  useEffect(() => {
    return editor.registerCommand(
      AI_WRITER_COMMAND,
      () => {
        handleButtonClick();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, handleButtonClick]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (k: KeyboardEvent) => {
        if ((k.ctrlKey || k.metaKey) && k.key === 'k') {
          k.preventDefault();
          
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const domSelection = window.getSelection();
              if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                if (rect.width === 0) {
                  // No selection or cursor is at start - use the parent element's position
                  const parentElement = range.startContainer.parentElement;
                  if (parentElement) {
                    const parentRect = parentElement.getBoundingClientRect();
                    setPromptPosition({
                      x: parentRect.left,
                      y: parentRect.bottom + window.scrollY,
                    });
                  }
                } else {
                  // Normal selection
                  setPromptPosition({
                    x: rect.left,
                    y: rect.bottom + window.scrollY + 10,
                  });
                }
                setShowPrompt(true);
              }
            }
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor]);

  

  return createPortal(
    <>
      {showPrompt && promptPosition && (
        <PromptPopup
          onSubmit={handleGenerateAI}
          onClose={() => {
            setShowPrompt(false);
            setPromptPosition(null);
          }}
          position={promptPosition}
        />
      )}
      <div className="fixed bottom-4 right-4 z-[9999] max-w-2xl w-full">
        {isLoading && (
          <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
            <div className="mb-4">Generating content...</div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        {!isLoading && suggestion && (
          <div className="bg-white rounded-lg shadow-xl border border-gray-200">
            <SuggestionCard
              content={suggestion}
              onAccept={handleAccept}
              onTryAgain={() => handleGenerateAI(lastPrompt)}
              onDiscard={() => setSuggestion(null)}
            />
          </div>
        )}
      </div>
    </>,
    anchorElem
  );
} 