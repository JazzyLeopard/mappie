'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, FileDown, Grid } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { toast } from 'sonner'

interface MarkdownCardProps {
  content: string;
  onInsert: (content: string) => void;
}

export function MarkdownCard({ content, onInsert }: MarkdownCardProps) {
  return (
    <Card className="relative p-4 pb-6 bg-white">
      <div className="absolute top-2 right-2 flex gap-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', content);
          }}
        >
          <Grid className="h-4 w-4" />
          <span className="sr-only">Drag to editor</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onInsert(content)}
        >
          <FileDown className="h-4 w-4" />
          <span className="sr-only">Insert at cursor</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            navigator.clipboard.writeText(content);
            toast.success('Copied to clipboard');
          }}
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy to clipboard</span>
        </Button>
      </div>
      
      <div className="pt-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({node, ...props}) => (
              <h1 className="text-xl font-bold mb-2" {...props} />
            ),
            h2: ({node, ...props}) => (
              <h2 className="text-lg font-semibold mb-2" {...props} />
            ),
            h3: ({node, ...props}) => (
              <h3 className="text-md font-medium mb-1" {...props} />
            ),
            ul: ({node, ...props}) => (
              <ul className="list-disc pl-4 mb-2" {...props} />
            ),
            li: ({node, ...props}) => (
              <li className="mb-1" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </Card>
  );
}