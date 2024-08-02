import { useRef, useState } from "react";
import AiGenerationIconWhite from "@/icons/AI-Generation-White";
import Draggable from "react-draggable";
import { Textarea } from "@/components/ui/textarea";

interface AiPromptbarProps {
  onClose: () => void;
  attribute: string;
  data: any;
  onAIResponse: any;
}

export default function AiPromptBar({ onClose, attribute, data, onAIResponse }: AiPromptbarProps) {

  const [inputValue, setInputValue] = useState("");

  const draggableRef = useRef<HTMLDivElement>(null)

  const [showHistory, setShowHistory] = useState(false);
  const previousPrompts = ["Prompt 1", "Prompt 2", "Prompt 3"]; // Example previous prompts

  // Handle the click event for the generate button
  const handleGenerateClick = async () => {
    if (!inputValue.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: attribute, // Pass the attribute as type
          data: data, // Pass the relevant data
          instructions: inputValue.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('AI Response:', result.response);
        onAIResponse(result.response); // Call the function to update project details
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }

    onClose(); // Close the prompt after generating
  };


  return (
    <Draggable cancel=".no-drag" nodeRef={draggableRef}>
      <div ref={draggableRef} className="flex flex-col items-center min-h-[3rem] max-w-lg p-2 bg-gray-900 text-white rounded-lg">
        <div className="flex items-center w-full">
          <div className="flex items-center justify-center p-2">
            <AiGenerationIconWhite />
          </div>
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What do you want to make happen?"
            className="flex-1 mx-2 bg-transparent text-sm h-4 border border-gray-100 rounded-md outline-none text-white no-drag" // Increased height and added no-drag class
            aria-label="Prompt Input"
          />
          <button
            onClick={handleGenerateClick}
            className="flex items-center justify-center w-6 h-6"
            aria-label="Generate AI Content"
          >
            <ArrowRightIcon className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 ml-2"
            aria-label="Close Prompt">
            <XIcon className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-center w-6 h-6 ml-2"
            aria-label="Toggle History">
            <HistoryIcon className="w-4 h-4 text-white" />
          </button>
        </div>
        {showHistory && (
          <div className="w-full mt-2">
            <h3 className="text-sm text-gray-400">Previous Prompts:</h3>
            <ul className="text-sm text-gray-300">
              {previousPrompts.map((prompt, index) => (
                <li key={index} className="mt-1">
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Draggable >
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v6h6" />
      <path d="M3.05 13A9 9 0 1 0 5 5.27L3 3" />
    </svg>
  );
}