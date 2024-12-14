import { Check, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface SuggestionCardProps {
  content: string;
  onAccept: () => void;
  onTryAgain: () => void;
  onDiscard: () => void;
}

export default function SuggestionCard({
  content,
  onAccept,
  onTryAgain,
  onDiscard,
}: SuggestionCardProps) {
  return (
    <div className="bg-white rounded-lg">
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className="prose prose-sm max-w-none">
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
          {content}
        </ReactMarkdown>
        </div>
      </div>
      <div className="border-t border-gray-200 p-2 flex justify-between items-center bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={onTryAgain}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
        <button
          onClick={onDiscard}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md"
        >
          <X className="w-4 h-4" />
          Discard
        </button>
      </div>
    </div>
  );
} 