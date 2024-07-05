import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function LabelToInput({ value, setValue, onBlur }: { value: string, setValue: (val: string) => void, onBlur: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  // const [value, setValue] = useState('');

  const handleClick = () => {
    setIsEditing(true);
  };

  const updateValue = (val: string) => {
    setValue(val);
  }

  const handleBlur = () => {
    setIsEditing(false);
    onBlur()
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className="flex items-center w-full">
      {isEditing ? (
        <Input
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent the default action to avoid form submission
                setValue(value); // Directly update the state with the current value
                setIsEditing(false); // Set editing to false to close the input field
                onBlur(); // Call onBlur to handle any additional blur effects
                console.log('Input updated:', value); // Log the updated value
            }
        }}
          className="border-gray-300 rounded-md px-3 py-2 text-2xl font-semibold"
        />
      ) : (
        <Label
          onClick={handleClick}
          className="cursor-pointer text-gray-700 hover:text-gray-900 text-2xl font-semibold"
        >
          {value || 'Click to edit'}
        </Label>
      )}
    </div>
  );
}