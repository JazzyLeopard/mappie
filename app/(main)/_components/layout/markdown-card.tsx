'use client'

import { Button } from "@/components/ui/button"
import { Copy, FileDown, Grid } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { toast } from 'sonner'
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface MarkdownCardProps {
  content?: string;
  metadata?: {
    title?: string;
    type?: string;
  };
  onInsert: (markdown: string) => void;
  isLoading?: boolean;
}

// Add this CSS animation at the top of your file, after the imports
const loadingAnimation = {
  '@keyframes typing': {
    '0%': { width: '0%' },
    '20%': { width: '20%' },
    '40%': { width: '40%' },
    '60%': { width: '60%' },
    '80%': { width: '80%' },
    '100%': { width: '100%' }
  }
};

export function MarkdownCard({ content, metadata, onInsert, isLoading }: MarkdownCardProps) {
  
  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
        <div className="h-10 border-b bg-neutral-50 px-3 flex items-center justify-end gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-7 rounded-md" />
          ))}
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-4 w-[90%]" />
          <div className="pt-4">
            <Skeleton className="h-[120px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
      <div className="h-10 border-b bg-neutral-50 px-3 flex items-center justify-end gap-2">
        <div className="relative group">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', content || '');
                }}
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Drag to editor</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Drag to editor
            </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onInsert(content || '')}
              >
                <FileDown className="h-4 w-4" />
                <span className="sr-only">Insert at cursor</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Insert at cursor
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  navigator.clipboard.writeText(content || '');
                  toast.success('Copied to clipboard');
                }}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy to clipboard</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Copy to clipboard
            </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>  
      </div>

      <div className="p-4 px-6 min-w-[300px]">
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
              <h4 className="text-lg font-medium mb-2 mt-4" {...props} />
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
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}