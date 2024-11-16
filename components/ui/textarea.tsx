import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  contextLabel?: {
    type: string;
    name: string;
  };
  onSubmit?: () => void;
  sendButton?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, contextLabel, sendButton, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="relative border rounded-lg overflow-hidden">
          {contextLabel && (
            <div className="absolute top-2 left-2 flex items-center gap-2 text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              <span className="font-medium text-slate-500">{contextLabel.type}:</span>
              <span className="text-slate-700">{contextLabel.name}</span>
            </div>
          )}
          <textarea
            className={cn(
              "flex min-h-[120px] w-full bg-background px-3 pt-12 pb-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:outline-none pr-[60px] rounded-lg",
              className
            )}
            ref={ref}
            {...props}
          />
          {sendButton && (
            <div className="absolute bottom-2 right-2">
              {sendButton}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
