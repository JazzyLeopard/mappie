'use client';

import { Button } from "@/components/ui/button";
import { Copy, Replace } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef, useCallback } from 'react';

interface MarkdownCardProps {
  content?: string;
  metadata?: {
    title?: string;
    type?: string;
  };
  onInsert: (markdown: string) => void;
  onReplace: (newContent: string) => Promise<void>;
  isLoading?: boolean;
}

export function MarkdownCard({ content, metadata, onInsert, onReplace, isLoading }: MarkdownCardProps) {
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamedContent, setStreamedContent] = useState('');
  const markdownRef = useRef<HTMLDivElement | null>(null); // Ref for the rendered markdown content

  // Update streamed content when content prop changes
  useEffect(() => {
    if (content) {
      setStreamedContent(content);
      setIsStreaming(false);
    }
  }, [content]);

  // Handle copying the content
  const handleCopy = useCallback(() => {
    try {
      const markdownElement = markdownRef.current;
      if (!markdownElement) {
        toast.error('Content not found for copying');
        return;
      }

      // Create a selection range and copy content
      const range = document.createRange();
      range.selectNodeContents(markdownElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const successful = document.execCommand('copy'); // Copy selected content to clipboard
      if (successful) {
        toast.success('Copied to clipboard');
      } else {
        toast.error('Copy to clipboard failed');
      }

      // Cleanup selection
      selection?.removeAllRanges();
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Copy to clipboard failed');
    }
  }, []);

  // Skeleton loading while streaming or loading
  if (isLoading || isStreaming) {
    return (
      <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
        <div className="h-10 overflow-hidden border-b bg-neutral-50 px-3 flex items-center justify-end gap-2">
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
    <div className="w-full mb-4 rounded-lg border border-neutral-200 overflow-hidden bg-white">
      <div className="h-10 overflow-hidden border-b bg-neutral-50 px-3 flex items-center justify-end gap-2">
        <div className="relative group flex items-center justify-between gap-2 w-full">
          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>

          {/* Replace Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={async () => {
              try {
                await onReplace(streamedContent || '');
                toast.success('Text replaced successfully');
              } catch (error) {
                console.error('Replace error:', error);
                toast.error('Failed to replace text');
              }
            }}
          >
            <Replace className="h-4 w-4 mr-2" />
            Replace full text
          </Button>
        </div>
      </div>

      {/* Markdown Content */}
      <div
        ref={markdownRef} // Reference for the copy functionality
        className="overflow-x-auto max-w-full p-4 px-6 min-w-[300px]"
      >
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
          {streamedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
