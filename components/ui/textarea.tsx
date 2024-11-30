import * as React from "react"

import { cn } from "@/lib/utils"
import { Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Button } from "./button";
import { Paperclip, Plus } from "lucide-react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  contextLabels?: Array<{
    type: string;
    name: string;
  }>;
  onSubmit?: () => void;
  streamState?: {
    isGenerating: boolean;
    isWaitingForTool: boolean;
  };
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, contextLabels = [], streamState, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div>
          {contextLabels.map((label, index) => (
              <div key={index} className="absolute top-2 left-2 flex items-center gap-2 text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              <span className="font-medium text-slate-500">{label.type}:</span>
              <span className="text-slate-700">{label.name}</span>
            </div>
          ))}
          <textarea
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              contextLabels?.length > 0 ? "pt-10" : "pt-3",
              className
            )}
            ref={ref}
            {...props}
          />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add content</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Attach file</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button
                        type="submit"
                        size="icon" 
                        disabled={streamState?.isGenerating || streamState?.isWaitingForTool || !props.value}
                        className="h-8 w-8"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
              </div>
            </div>
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
