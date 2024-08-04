import AiGenerationIcon from "@/icons/AI-Generation";
import { Button } from "./button";

export function AiPromptButton() {
  return (
    <Button variant="outline" >
      <AiGenerationIcon/>
      <p className="text-sm text-left pl-2">Enhance with AI</p>
    </Button>
  );
}