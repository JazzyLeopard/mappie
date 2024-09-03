import React from 'react';
import AiGenerationIcon from "@/icons/AI-Generation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2 } from "lucide-react"; // Import a loading icon
import { Button } from "./button";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";

interface AiPromptButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  showingComparison: boolean;
  className?: string;
  asChild?: boolean;
}

export function AiPromptButton({ 
  onClick, 
  disabled, 
  loading, 
  showingComparison, 
  className = '',
  asChild = false
}: AiPromptButtonProps) {
  const buttonContent = (
    <div className="rounded-xl items-center flex py-1 px-1">
      {loading ? <Loader2 className="animate-spin" /> : <AiGenerationIconWhite />}
      <p className="pl-2">
        {loading ? "Generating..." : showingComparison ? "New content below" : "Enhance with AI"}
      </p>
    </div>
  );

  const buttonProps = {
    className: `bg-gradient-to-r from-blue-400 to-pink-400 text-white text-xs rounded-xl ${
      disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${className}`,
    onClick: disabled || loading ? undefined : onClick,
    disabled: disabled || loading,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {asChild ? (
            <div {...buttonProps}>{buttonContent}</div>
          ) : (
            <Button {...buttonProps}>{buttonContent}</Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {disabled ? "Provide input first" : loading ? "Generating content..." : showingComparison ? "New content generated" : "Enhance with AI"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
