import * as React from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageAdd: (imageData: string) => void;
  className?: string;
}

export function ImageUpload({ onImageAdd, className }: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setPreview(base64String);
          onImageAdd(base64String);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  // Handle paste events
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              setPreview(base64String);
              onImageAdd(base64String);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onImageAdd]);

  return (
    <div className={cn("relative", className)}>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-h-32 rounded-md object-contain"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={() => {
              setPreview(null);
              onImageAdd('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center justify-center border-2 border-dashed rounded-md p-4 transition-colors",
            isDragActive
              ? "border-primary/50 bg-primary/5"
              : "border-gray-300 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <div className="text-xs text-gray-500 text-center">
              {isDragActive ? (
                "Drop image here"
              ) : (
                <>
                  Drag & drop or click to upload
                  <br />
                  Or paste from clipboard
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 