import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { input } from "@nextui-org/react";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";

interface LabelToInputProps {
  value: string;
  setValue: (val: string) => void;
  onBlur: () => void;
  onEnter?: (value: string) => void;
}

export default function LabelToInput({
  value,
  setValue,
  onBlur,
  onEnter,
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

  return (
    <div className="flex items-center w-full">
      {isEditing ? (
        <Input
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="border-gray-300 rounded-md px-3 py-2 text-2xl font-semibold"
          autoFocus
        />
      ) : (
        <div
          onClick={handleClick}
          className="flex items-center cursor-pointer group"
        >
          <Label
            className="text-gray-700 group-hover:text-gray-900 text-2xl font-semibold mr-2"
          >
            {value || "Click to edit"}
          </Label>
          <Edit
            className="h-5 w-5 text-gray-300 group-hover:text-gray-600 transition-colors duration-200"
          />
        </div>
      )}
    </div>
  );
}
