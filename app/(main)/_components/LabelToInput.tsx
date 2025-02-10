import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LabelToInputProps {
  value: string;
  setValue: (val: string) => void;
  onBlur: () => void;
  onEnter?: (value: string) => void;
  variant?: "default" | "workitem" | "chat" | "document";
}

export default function LabelToInput({
  value,
  setValue,
  onBlur,
  onEnter,
  variant = "default"
}: LabelToInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  };

  const handleBlur = () => {
    setIsEditing(false);
    setValue(inputValue)
    onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsEditing(false);
      setValue(inputValue);
      onEnter?.(inputValue);
    }
  };

  const styles = {
    default: {
      input: "border-gray-300 rounded-md px-3 py-1 text-2xl font-semibold",
      label: "text-gray-700 group-hover:text-gray-900 text-2xl font-semibold mr-2",
      icon: "h-5 w-5 text-gray-300 group-hover:text-gray-600"
    },
    document: {
      input: "border-gray-300 rounded-md px-3 py-1 text-xl font-semibold",
      label: "text-gray-700 group-hover:text-gray-900 text-xl font-semibold mr-2",
      icon: "h-5 w-5 text-gray-400 group-hover:text-slate-800"
    },
    workitem: {
      input: "border-gray-300 rounded-md px-3 py-1 text-sm font-semibold",
      label: "text-gray-700 group-hover:text-gray-900 text-sm font-semibold mr-1",
      icon: "h-4 w-4 text-gray-300 group-hover:text-gray-600"
    },
    chat: {
      input: "border-gray-300 rounded-md px-2 py-0.5 text-sm font-medium",
      label: "text-gray-700 group-hover:text-gray-900 py-0.5 text-sm font-medium mr-1",
      icon: "h-3.5 w-3.5 text-gray-300 group-hover:text-gray-600"
    }
  };

  return (
    <div className="flex items-center w-full">
      {isEditing ? (
        <Input
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={styles[variant].input}
          autoFocus
        />
      ) : (
        <div
          onClick={handleClick}
          className="flex items-center cursor-pointer group"
        >
          <Label className={styles[variant].label}>
            {value || "Click to edit"}
          </Label>
          <Edit
            className={cn(
              styles[variant].icon,
              "transition-colors duration-200"
            )}
          />
        </div>
      )}
    </div>
  );
}
