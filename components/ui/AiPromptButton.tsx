import AiGenerationIcon from "@/icons/AI-Generation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2 } from "lucide-react"; // Import a loading icon

interface AiPromptButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export function AiPromptButton({ onClick, disabled, loading }: AiPromptButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`flex flex-col items-center rounded-xl justify-center bg-white dark:bg-gray-950 ${
              disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={disabled || loading ? undefined : onClick}
          >
            <div className={`max-w-md rounded-xl p-px ${
              disabled || loading ? 'bg-gray-300 dark:bg-gray-700' : 'bg-gradient-to-b from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800'
            }`}>
              <div className="rounded-xl items-center flex py-1 px-3 bg-white dark:bg-gray-900">
                {loading ? <Loader2 className="animate-spin" /> : <AiGenerationIcon />}
                <p className="text-gray-700 dark:text-gray-300 pt-2 pl-2">
                  {loading ? "Generating..." : "Enhance with AI"}
                </p>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {disabled ? "Provide input first" : loading ? "Generating content..." : "Enhance with AI"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
