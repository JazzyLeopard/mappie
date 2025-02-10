import * as React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Send, Paperclip, Plus, X, Search, FileText, Folder, ListTodo } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { Id } from "convex/_generated/dataModel"
import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { SearchPopoverContent } from "@/ai/ai-chat"

interface SearchableItem {
  id: Id<"workItems"> | Id<"knowledgeBase">
  type: 'epic' | 'feature' | 'story' | 'task' | 'document'
  title: string
  path?: string
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  contextLabels?: Array<{
    name: string
    onRemove?: () => void
    className?: string
  }>
  streamState?: {
    isGenerating: boolean
    isWaitingForTool: boolean
  }
  variant?: 'default' | 'chat'
  onSelectItem?: (item: SearchableItem) => void
  selectedItems?: SearchableItem[]
  workspaceId?: Id<"workspaces"> | null
  onMentionSelect?: (item: SearchableItem) => void
}

const useMergedRef = <T,>(
  ...refs: (React.ForwardedRef<T> | React.RefObject<T>)[]
) => {
  return useCallback((element: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<T>).current = element;
      }
    });
  }, [refs]);
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, contextLabels = [], streamState, variant = 'default', onSelectItem, selectedItems, workspaceId, onMentionSelect, ...props }, ref) => {
    const [showToolbarSearch, setShowToolbarSearch] = useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const plusButtonRef = React.useRef<HTMLButtonElement>(null)
    const toolbarPopoverRef = React.useRef<HTMLDivElement>(null)

    // Make sure we're using the ref correctly
    const combinedRef = useMergedRef(ref, textareaRef);

    // Just pass through keyboard events to parent
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      props.onKeyDown?.(e);
    };

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (showToolbarSearch && 
            plusButtonRef.current && 
            toolbarPopoverRef.current &&
            !plusButtonRef.current.contains(event.target as Node) &&
            !toolbarPopoverRef.current.contains(event.target as Node)) {
          setShowToolbarSearch(false);
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showToolbarSearch])

    return (
      <div className="space-y-1">
        <div className="relative w-full">
          {variant === 'chat' ? (
            <div className="relative">
              {contextLabels.length > 0 && (
                <div className="absolute top-[1px] left-0 right-0 m-[1px] h-10 bg-slate-100/95 backdrop-blur-sm">
                  {contextLabels.map((label, index) => (
                    <div 
                      key={index} 
                      className="absolute top-2 left-2 flex items-center gap-1 text-xs bg-slate-200 px-2 py-1 rounded-md"
                    >
                      <span className="text-slate-700">{label.name}</span>
                      {label.onRemove && (
                        <button onClick={label.onRemove} className="ml-1 hover:text-slate-900">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <textarea
                ref={combinedRef}
                onKeyDown={handleKeyDown}
                className={cn(
                  "flex min-h-[80px] max-h-[120px] w-full lg:max-w-80% rounded-md border border-input bg-slate-100 px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  contextLabels?.length > 0 ? "pt-10" : "pt-3",
                  "pb-14",
                  className
                )}
                {...props}
              />
              {/* Chat toolbar */}
              <div className="absolute bottom-[1px] left-2 right-2 flex items-center justify-between bg-slate-100/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Button
                    ref={plusButtonRef}
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-slate-200"
                    onClick={() => setShowToolbarSearch(!showToolbarSearch)}
                  >
                    <Plus className="h-4 w-4 text-gray-700" />
                  </Button>
                  {showToolbarSearch && workspaceId && (
                    <div 
                      ref={toolbarPopoverRef}
                      className="absolute bottom-full mb-2 left-0"
                      style={{ zIndex: 1000 }}
                    >
                      <SearchPopoverContent
                        workspaceId={workspaceId}
                        onSelectItem={(item) => {
                          onSelectItem?.(item);
                          setShowToolbarSearch(false);
                        }}
                        selectedItems={selectedItems || []}
                      />
                    </div>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-200">
                          <Paperclip className="h-4 w-4 text-gray-700" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coming soon...</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={streamState?.isGenerating || streamState?.isWaitingForTool || !props.value}
                  className="h-8 w-8 mb-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <textarea
              ref={combinedRef}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
              )}
              {...props}
            />
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
