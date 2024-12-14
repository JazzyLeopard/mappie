import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState, useRef } from 'react';
import { $getRoot } from 'lexical';
import { $convertToMarkdownString, $convertFromMarkdownString } from '@lexical/markdown';
import { ENHANCED_TRANSFORMERS } from '../../plugins/MarkdownTransformers';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

function DiffDialog({
  oldSection,
  newSection,
  open,
  onOpenChange,
  onAccept,
  onReject,
}: {
  oldSection: string;
  newSection: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Review Changes</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full pr-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-red-500 mb-2">Section to Replace:</h4>
              <div className="bg-red-50 p-4 rounded-md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => (
                        <h1 className="text-3xl font-bold mb-6 border-b pb-2" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-2xl font-bold mb-4 mt-6" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-xl font-semibold mb-3 mt-4" {...props} />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 className="text-xs uppercase font-extrabold mb-2 mt-4" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="text-gray-600 leading-relaxed mb-4" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600" {...props} />
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
                  {oldSection}
                </ReactMarkdown>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-500 mb-2">New Content:</h4>
              <div className="bg-green-50 p-4 rounded-md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => (
                        <h1 className="text-3xl font-bold mb-6 border-b pb-2" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-2xl font-bold mb-4 mt-6" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-xl font-semibold mb-3 mt-4" {...props} />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 className="text-xs uppercase font-extrabold mb-2 mt-4" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="text-gray-600 leading-relaxed mb-4" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600" {...props} />
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
                  {newSection}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onReject} className="px-3 py-2 text-sm font-normal border border-red-300 text-red-500 bg-red-50 hover:bg-red-100 rounded-md">
            Cancel
          </button>
          <button onClick={onAccept} className="px-3 py-2 text-sm font-semibold border border-green-300 text-green-600 bg-green-50 hover:bg-green-100 rounded-md">
            Replace
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ReplacementPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [pendingReplacement, setPendingReplacement] = useState<{
    oldSection: string;
    newSection: string;
  } | null>(null);

  const simulateProgress = useCallback(() => {
    setProgress((prev) => {
      if (prev >= 90) {
        return prev;
      }
      return prev + Math.random() * 10;
    });
  }, []);

  const handleReplace = useCallback(async (newContent: string) => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setStatus('Analyzing content for replacement...');
      progressInterval.current = setInterval(simulateProgress, 300);

      const currentContent = editor.getEditorState().read(() => {
        return $convertToMarkdownString(ENHANCED_TRANSFORMERS);
      });

      const response = await fetch('/api/replace-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newContent,
          existingText: currentContent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process replacement');
      }

      const data = await response.json();

      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setProgress(100);
      setStatus('Replacement processed successfully');

      setPendingReplacement({
        oldSection: data.replacedSection,
        newSection: data.newSection
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Replace error:', error);
      toast.error('Failed to process replacement');
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setIsProcessing(false);
      setProgress(0);
      setStatus('');
    }
  }, [editor]);

  useEffect(() => {
    if (editor && typeof window !== 'undefined') {
      (window as any).__replaceMarkdown = handleReplace;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__replaceMarkdown;
      }
    };
  }, [editor, handleReplace]);

  // Add progress dialog
  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-semibold">Processing Replacement</h3>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>
          </div>
        </div>
      )}
      {pendingReplacement && (
        <DiffDialog
          oldSection={pendingReplacement.oldSection}
          newSection={pendingReplacement.newSection}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAccept={() => {
            editor.update(() => {
              const currentContent = $convertToMarkdownString(ENHANCED_TRANSFORMERS);
              const newContent = currentContent.replace(
                pendingReplacement.oldSection,
                pendingReplacement.newSection
              );
              const root = $getRoot();
              root.clear();
              $convertFromMarkdownString(newContent, ENHANCED_TRANSFORMERS);
            });
            setPendingReplacement(null);
            setIsDialogOpen(false);
            toast.success('Changes applied');
          }}
          onReject={() => {
            setPendingReplacement(null);
            setIsDialogOpen(false);
          }}
        />
      )}
    </>
  );
}