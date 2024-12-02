import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createCommand, LexicalCommand, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, UNDO_COMMAND, RangeSelection } from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { $createParagraphNode, $createTextNode, $getNodeByKey, $createRangeSelection, $setSelection, $isTextNode, $getRoot } from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { DecoratorNode, } from 'lexical';
import { ReactNode } from 'react';
import type { Spread } from 'lexical';
import ReactMarkdown from 'react-markdown';
import { $convertToMarkdownString, $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type AIEditPayload = {
  prompt: string;
  selectedText: string;
};

export const AI_EDIT_COMMAND: LexicalCommand<AIEditPayload> = createCommand('AI_EDIT_COMMAND');

function PromptPopup({
  onSubmit,
  onClose,
  position,
}: {
  onSubmit: (prompt: string) => void;
  onClose: () => void;
  position: { x: number; y: number } | null;
}) {
  const [prompt, setPrompt] = useState('');
  console.log('PromptPopup render:', { position }); // Debug log

  if (!position) {
    console.log('PromptPopup: No position provided'); // Debug log
    return null;
  }

  return createPortal(
    <div 
      className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        maxWidth: '400px',
        width: '100%',
      }}
    >
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to do with this text?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (prompt.trim()) {
                  onSubmit(prompt);
                }
              }
            }}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:border-gradient-to-tr from-pink-400 to-blue-400"
            placeholder="e.g., Make it more formal, Summarize it, etc."
            rows={3}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(prompt)}
            disabled={!prompt.trim()}
            className="px-3 py-2 text-sm font-semibold text-white bg-gradient-to-tr from-pink-400 to-blue-400 hover:bg-gradient-to-br rounded-md disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: {
  suggestion: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200 my-2">
      <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-3xl font-bold mb-6 border-b pb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-bold mb-4 mt-4" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold mb-3 mt-3" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-lg font-medium mb-2 mt-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-gray-600 leading-relaxed" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-6 space-y-2 text-gray-600" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-6 space-y-2 text-gray-600" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed" {...props} />
            ),
            code: ({ node, ...props }) => (
                <code className="bg-gray-100 text-pink-500 px-1 py-0.5 rounded text-sm" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 mb-4" {...props} />
            ),
          }}
        >
        {suggestion}
      </ReactMarkdown>
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onReject}
          className="px-3 py-2 text-sm font-normal border border-red-300 text-red-500 bg-red-200 hover:bg-red-300 rounded-md"
        >
          Reject
        </button>
        <button
          onClick={onAccept}
          className="px-3 py-2 text-sm font-semibold border border-green-300 text-green-600 bg-green-200 hover:bg-green-300 rounded-md"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export type SerializedSuggestionCardNode = Spread<
  {
    suggestion: string;
  },
  SerializedLexicalNode
>;

export class SuggestionCardNode extends DecoratorNode<JSX.Element> {
  __suggestion: string;
  __element: JSX.Element | null;

  static getType(): string {
    return 'suggestion-card';
  }

  static clone(node: SuggestionCardNode): SuggestionCardNode {
    return new SuggestionCardNode(node.__suggestion, node.__element, node.__key);
  }

  constructor(suggestion: string = '', element: JSX.Element | null = null, key?: NodeKey) {
    super(key);
    this.__suggestion = suggestion;
    this.__element = element;
  }

  setSuggestion(suggestion: string): void {
    const writable = this.getWritable();
    writable.__suggestion = suggestion;
  }

  setElement(element: JSX.Element): void {
    const writable = this.getWritable();
    writable.__element = element;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'suggestion-card-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return this.__element || <div />;
  }

  exportJSON(): SerializedSuggestionCardNode {
    return {
      suggestion: this.__suggestion,
      type: 'suggestion-card',
      version: 1,
    };
  }
}

export default function AIEditPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptPosition, setPromptPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedMarkdown, setSelectedMarkdown] = useState<string>('');
  const [storedSelection, setStoredSelection] = useState<any>(null);

  const handleButtonClick = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Store selection and position
        setStoredSelection(selection.clone());
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setPromptPosition({
            x: rect.left,
            y: rect.bottom + window.scrollY + 10,
          });
        }

        // Get markdown from selection
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        setSelectedMarkdown(markdown);
        setShowPrompt(true);
      }
    });
  }, [editor]);

  const handleGenerateAISuggestion = useCallback(async (prompt: string) => {
    try {
      editor.update(() => {
        // Get the full text content
        const root = $getRoot();
        const fullText = $convertToMarkdownString(TRANSFORMERS);
        
        const selection = $getSelection();
        if (!selection || !$isRangeSelection(selection)) {
          if (storedSelection && $isRangeSelection(storedSelection)) {
            $setSelection(storedSelection);
          } else {
            return;
          }
        }

        const selectedText = selection?.getTextContent();
        const rangeSelection = selection as RangeSelection;
        const anchorNode = rangeSelection.anchor.getNode();
        const topLevelElement = anchorNode.getTopLevelElement();
        
        if (topLevelElement) {
          // Create suggestion node with loading state
          const suggestionNode = new SuggestionCardNode(selectedText);
          const loadingElement = (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 my-2">
              <div className="animate-pulse">Generating suggestion...</div>
            </div>
          );
          suggestionNode.setElement(loadingElement);
          topLevelElement.insertAfter(suggestionNode);

          // Make API call with full context
          fetch('/api/inline-editor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, selectedText, fullText }),
          })
            .then(response => response.json())
            .then(data => {
              editor.update(() => {
                const suggestionElement = (
                  <SuggestionCard
                    suggestion={data.diff}
                    onAccept={() => {
                      editor.update(() => {
                        // Replace entire editor content with the new version
                        const root = $getRoot();
                        root.clear();
                        $convertFromMarkdownString(data.text, TRANSFORMERS);
                        suggestionNode.remove();
                      });
                    }}
                    onReject={() => {
                      editor.update(() => {
                        suggestionNode.remove();
                      });
                    }}
                  />
                );
                suggestionNode.setElement(suggestionElement);
              });
            });
        }
      });
    } catch (error) {
      console.error('AI Edit error:', error);
    } finally {
      setShowPrompt(false);
      setPromptPosition(null);
    }
  }, [editor, storedSelection]);

  useEffect(() => {
    return editor.registerCommand(
      AI_EDIT_COMMAND,
      () => {
        handleButtonClick();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, handleButtonClick]);

  return (
    <div data-test-id="ai-edit-plugin">
      {showPrompt && promptPosition ? (
        <PromptPopup
          onSubmit={handleGenerateAISuggestion}
          onClose={() => {
            setShowPrompt(false);
            setPromptPosition(null);
          }}
          position={promptPosition}
        />
      ) : null}
    </div>
  );
}