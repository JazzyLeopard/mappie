import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { createPortal } from 'react-dom';

interface PromptPopupProps {
  onSubmit: (prompt: string) => void;
  onClose: () => void;
  position: { x: number; y: number } | null;
}

export default function PromptPopup({ onSubmit, onClose, position }: PromptPopupProps) {
  const [prompt, setPrompt] = useState('');

  if (!position) return null;

  return createPortal(
    <div 
      className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '320px',
      }}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-lg">AI Writer</h3>
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What would you like the AI to write about?"
          className="min-h-[100px] resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500"
        />
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onSubmit(prompt)}
            disabled={!prompt.trim()}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Generate
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
} 