import React, { useState } from 'react';
import AiGenerationIcon from "@/icons/AI-Generation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, ChevronDown, Icon, Wand, Wand2 } from "lucide-react";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "./input";

interface AiPromptButtonProps {
  onClick: (customPrompt?: string) => void;
  hasExistingContent: boolean;
  loading: boolean;
  showingComparison: boolean;
  className?: string;
  asChild?: boolean;
}

export function AiPromptButton({
  onClick,
  hasExistingContent,
  loading,
  showingComparison,
  className = '',
  asChild = false
}: AiPromptButtonProps) {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleAction = () => {
    onClick(customPrompt.trim() || undefined);
    setCustomPrompt('');
  };

  const buttonContent = (
    <div className="rounded-xl items-center flex">
      {loading ? <Loader2 className="animate-spin" /> : <AiGenerationIcon />}
      <p className="pl-2">
        {loading ? "Generating..." : 
         showingComparison ? "New content below" : 
         hasExistingContent ? "Enhance with AI" : "Generate with AI"}
      </p>
      <ChevronDown className="h-4 w-4 ml-2" />
    </div>
  );

  const buttonProps = {
    className: `bg-transparent border text-gray-700 text-sm rounded-xl hover:bg-slate-200 ${
      loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${className}`,
    disabled: loading,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {asChild ? (
                <div {...buttonProps}>{buttonContent}</div>
              ) : (
                <Button {...buttonProps}>{buttonContent}</Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 p-2" onClick={(e) => e.stopPropagation()}>
              <div className="w-full p-2 rounded-md">
                <p className="mb-2 text-sm font-medium">
                  {hasExistingContent ? "Enhance with AI" : "Generate with AI"}
                </p>
                <div className="flex flex-col">
                  <Input
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Enter additional context (optional)"
                    className="mb-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClick(customPrompt.trim() || undefined);
                      setCustomPrompt('');
                    }} 
                    className="w-full bg-gradient-to-r from-pink-400 to-blue-400 text-white"
                  >
                    <Wand2 className="mr-2 w-4 h-4" />
                    {hasExistingContent ? "Enhance" : "Generate"}
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          {loading ? "Generating content..." : 
           showingComparison ? "New content generated" : 
           hasExistingContent ? "Enhance with AI" : "Generate with AI"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
