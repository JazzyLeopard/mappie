import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Trash2, Minimize2 } from "lucide-react";

interface ImagePreviewProps {
    src: string;
    alt: string;
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
}

export const ImagePreview = ({ src, alt, isOpen, onClose, onDelete }: ImagePreviewProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-2">
                <DialogTitle className="sr-only">
                    Image Preview: {alt}
                </DialogTitle>

                <div className="relative">
                    {/* Header with controls */}
                    <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                        <button
                            onClick={onClose}
                            className="p-1.5 bg-gray-100/90 hover:bg-gray-200/90 rounded-md transition-colors"
                            title="Collapse"
                        >
                            <Minimize2 className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1.5 bg-red-100/90 hover:bg-red-200/50 rounded-md transition-colors"
                            title="Delete image"
                        >
                            <Trash2 className="h-4 w-4 text-red-700" />
                        </button>
                    </div>

                    {/* Image container */}
                    <div className="relative w-full aspect-video">
                        <Image
                            src={src}
                            alt={alt}
                            className="object-contain"
                            fill
                            sizes="(max-width: 400px) 100vw, 400px"
                            priority
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};