import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Attachment } from '../types';

interface FileAttachmentProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ attachment, onRemove }) => {
  return (
    <div className="relative inline-block mr-2 mb-2">
      <img
        src={attachment.previewUrl}
        alt="Attachment"
        className="w-20 h-20 object-cover rounded-md"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
        onClick={() => onRemove(attachment.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

