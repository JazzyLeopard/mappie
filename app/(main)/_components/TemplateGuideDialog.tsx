import { Dialog, DialogContent } from "@/components/ui/dialog";
import { placeholderOverview } from "./constants";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface TemplateGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (content: string) => void;
}

export function TemplateGuideDialog({ isOpen, onClose, onUseTemplate }: TemplateGuideDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="mb-4 border-b border-blue-100 pb-3">
          <div className="flex justify-between items-start mb-3">
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-2">Project Overview Guide 🎯</h2>
              <p className="text-sm">Click "Use Template" to add this structure to your project document.</p>
              <div className="mt-2 w-full">
                <Alert>
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    This will replace the current content of your document.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
          <Button
            onClick={() => onUseTemplate(placeholderOverview)}
            className="w-full"
          >
            Use Template
          </Button>
        </div>

        <div className="space-y-6 px-2">
          <div>
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
              <h4 className="text-sm uppercase font-bold mb-2 mt-4" {...props} />
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
            {placeholderOverview}
          </ReactMarkdown>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-100">
            <p className="text-sm text-blue-600">
              Click "Use Template" to add this structure to your project
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 