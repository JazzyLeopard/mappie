import { api } from '@/convex/_generated/api';
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Attachment } from "@/types";
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { useMutation, useQuery } from 'convex/react';
import { Paperclip, Plus, Send } from "lucide-react";
import Image from 'next/image';
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from 'sonner';
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { MentionPopup } from "./MentionPopup";
import { MentionItem, TextareaProps } from "./types";
import { useMentions } from "./useMentions";
import { ImagePreview } from "./ImagePreview";

const getPillPrefix = (type: string) => {
    switch (type) {
        case 'UseCase':
            return 'UC';
        case 'FunctionalRequirement':
            return 'FR';
        case 'Feature':
            return 'FEAT';
        case 'UserStory':
            return 'US';
        case 'Overview':
            return 'Epic';
        default:
            return '';
    }
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, contextLabels = [], streamState, variant = 'default', projectId, selectedItemId, selectedItemType, onChange, ...props }, ref) => {

        const { getToken } = useAuth();
        const fileInputRef = useRef<HTMLInputElement>(null)

        const [uploadedImages, setUploadedImages] = useState<any[]>([])
        const [selectedImage, setSelectedImage] = useState<{
            id: Id<"imageUpload">;
            url: string;
            filename: string;
        } | null>(null);

        const storageKey = `mentionState-${projectId}`;
        const {
            mentionState,
            typedText,
            textareaRef,
            handleMentionSelect,
            handleChange,
            handleKeyDown
        } = useMentions(onChange, storageKey);

        const generateUploadUrl = useMutation(api.imageUpload.generateUploadUrl);

        // Add this query to get items
        const items = useQuery(api.projects.getProjectFullDetails,
            projectId ? { projectId: projectId as Id<"projects"> } : "skip"
        );

        const images = useQuery(api.imageUpload.getUploadedImageById, {
            projectId: projectId!,
            itemId: selectedItemId!,
            itemType: selectedItemType!
        });

        console.log("images", images)

        const deleteImage = useMutation(api.imageUpload.deleteImage);
        // Add ref for pills container
        const pillsContainerRef = useRef<HTMLDivElement>(null);

        // Add effect to adjust textarea padding
        useEffect(() => {
            if (pillsContainerRef.current && textareaRef.current) {
                const pillsHeight = pillsContainerRef.current.offsetHeight;
                textareaRef.current.style.paddingTop = `${Math.max(pillsHeight + 8, 40)}px`;
            }
        }, [mentionState.selectedItems, contextLabels]); // Update when pills change

        useEffect(() => {
            if (mentionState.selectedItems.length > 0) {
                console.log('Selected Pills:', mentionState.selectedItems.map(item => ({
                    type: item.type,
                    title: item.title,
                    id: item.id,
                })));
            }
        }, [mentionState.selectedItems]);

        // Set images when they're loaded from Convex
        useEffect(() => {
            if (images) {
                const formattedImages = images.map(image => ({
                    id: image._id,
                    name: image.filename,
                    previewUrl: image.url,
                    storageId: image.imageStorageId,
                    itemId: image.itemId,
                    itemType: image.itemType,
                    content: image.content
                }));
                setUploadedImages(formattedImages);
            }
        }, [images, selectedItemId, selectedItemType]);

        // Clean up preview URLs when component unmounts

        const filteredItems = useMemo(() => {
            if (!items) return [];

            // Convert object items into a flat array of MentionItem
            const allItems: MentionItem[] = [
                // Overview
                { id: items.project._id, type: 'Overview', title: items.project.title },

                // Functional Requirements
                ...items.functionalRequirements.map(fr => ({
                    id: fr._id,
                    type: 'FunctionalRequirement' as const,
                    title: fr.title
                })),

                // Use Cases
                ...items.useCases.map(useCase => ({
                    id: useCase._id,
                    type: 'UseCase' as const,
                    title: useCase.title
                })),

                // Features (Epics)
                ...items.epics.map(epic => ({
                    id: epic._id,
                    type: 'Feature' as const,
                    title: epic.name
                })),

                // User Stories (nested within epics)
                ...items.epics.flatMap(epic =>
                    epic.userStories?.map(story => ({
                        id: story._id,
                        type: 'UserStory' as const,
                        title: story.title
                    })) || []
                )
            ];


            if (!mentionState.searchText) return allItems;
            return allItems.filter(item =>
                item.title.toLowerCase().includes(mentionState.searchText.toLowerCase())
            );
        }, [items, mentionState.searchText]);

        // Combine refs
        const combinedRef = React.useCallback(
            (element: HTMLTextAreaElement) => {
                textareaRef.current = element;
                if (typeof ref === 'function') {
                    ref(element);
                } else if (ref) {
                    ref.current = element;
                }
            },
            [ref]
        );

        const handleAttachment = async (files: FileList | null) => {
            if (!files || !projectId || !selectedItemId || !selectedItemType) {
                toast.error("Missing required context information");
                return;
            }

            await Promise.all(
                Array.from(files).map(async (file) => {
                    console.log("file", file)
                    try {
                        const token = await getToken({ template: "convex" });
                        const postUrl = await generateUploadUrl();
                        const result = await fetch(postUrl, {
                            method: "POST",
                            headers: { "Content-Type": file!.type },
                            body: file,
                        });
                        const { storageId } = await result.json();
                        console.log("result", storageId)


                        const extractedInfo = await axios.post('/api/imageUpload', {
                            projectId,
                            storageId,
                            filename: file.name,
                            itemId: selectedItemId,
                            itemType: selectedItemType
                        }, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })

                        if (extractedInfo.status === 200) {
                            console.log("API Response: ", extractedInfo.data);
                            toast.success("File uploaded successfully")

                            setUploadedImages(prev => [...prev, {
                                id: extractedInfo.data._id,
                            }])

                        } else {
                            toast.error("File upload failed: " + extractedInfo?.data?.message || "Unknown error");
                        }

                    } catch (error) {
                        console.error("Error uploading file: ", error);
                        toast.error("File upload failed");
                    }
                })
            )
        };

        console.log(uploadedImages)

        const handleDelete = useCallback(async (imageId: Id<"imageUpload">) => {
            try {
                await deleteImage({ imageId });
                toast.success("Image deleted successfully");
            } catch (error) {
                console.error("Error deleting image:", error);
                toast.error("Failed to delete image");
            }
        }, [deleteImage]);

        return (
            <>
                <div className="space-y-1 relative">
                    {mentionState.isOpen && (
                        <MentionPopup
                            items={filteredItems || []}
                            searchText={mentionState.searchText}
                            onSelect={handleMentionSelect}
                            position={mentionState.position}
                            selectedItems={mentionState.selectedItems} // Pass selected items
                            activeIndex={mentionState.activeIndex} // Pass active index
                            selectedType={mentionState.selectedType}
                        />
                    )}

                    <div className="relative">
                        {variant === 'chat' && (
                            <div
                                ref={pillsContainerRef}
                                className="absolute top-[1px] left-0 right-0 m-[1px] bg-background/95 backdrop-blur-sm"
                            >
                                <div className="max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                    <div className="flex flex-wrap items-center gap-1.5 p-1.5">
                                        {/* Context Labels */}
                                        {contextLabels.map((label, index) => (
                                            <div key={`context-${index}`}
                                                className="inline-flex shrink-0 items-center gap-1.5 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200"
                                            >
                                                <span className="font-medium text-slate-500">{label.type}:</span>
                                                <span className="text-slate-700">{label.name}</span>
                                            </div>
                                        ))}

                                        {/* Images Pill */}
                                        {uploadedImages.map((image) => (
                                            image.previewUrl ? (
                                                <div
                                                    key={image.id}
                                                    className="inline-flex shrink-0 items-center gap-1.5 text-[11px] bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200"
                                                >
                                                    <button
                                                        onClick={() => setSelectedImage({
                                                            id: image.id,
                                                            url: image.previewUrl,
                                                            filename: image.filename
                                                        })}
                                                        className="flex items-center gap-1 text-blue-700 hover:text-blue-900"
                                                    >
                                                        <div className="h-3 w-3 relative overflow-hidden rounded-sm">
                                                            <Image
                                                                src={image.previewUrl}
                                                                alt={`Uploaded file: ${image.filename || 'Image attachment'}`}
                                                                className="object-cover"
                                                                fill
                                                                sizes="12px"
                                                                priority
                                                            />
                                                        </div>
                                                        <span className="font-medium">Image</span>
                                                    </button>
                                                </div>
                                            ) : null
                                        ))}

                                        {/* Selected Mention Pills */}
                                        {mentionState.selectedItems.map((item, index) => (
                                            <div key={`mention-${item.id}-${index}`}
                                                className="inline-flex shrink-0 items-center gap-1 text-[11px] bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200"
                                            >
                                                <span className="text-blue-700">
                                                    <span className="font-medium">{getPillPrefix(item.type)}: </span>
                                                    {item.title}
                                                </span>
                                                <button
                                                    onClick={() => handleMentionSelect({
                                                        type: item.type,
                                                        items: [item],
                                                        action: 'remove'
                                                    })}
                                                    className="text-blue-400 hover:text-blue-600 ml-0.5"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <textarea
                            ref={combinedRef}
                            className={cn(
                                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                variant === 'chat' ? "pb-14" : "pb-3",
                                className
                            )}
                            value={typedText}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            {...props}
                        />
                        {variant === 'chat' && (
                            <div className="absolute bottom-[1px] left-2 right-2 flex items-center justify-between bg-background/95 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                                                        <Plus className="h-4 w-4 text-gray-400" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Coming soon...</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <Paperclip className="h-4 w-4 text-gray-400" />
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            className="hidden"
                                                            onChange={(e) => handleAttachment(e.target.files)}
                                                            multiple
                                                            accept="image/*"
                                                        />
                                                    </Button>
                                                </TooltipTrigger>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={streamState?.isGenerating || streamState?.isWaitingForTool || !props.value}
                                        className="h-8 w-8 mb-2"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Preview Dialog */}
                {selectedImage && (
                    <ImagePreview
                        src={selectedImage.url}
                        alt="preview"
                        isOpen={!!selectedImage}
                        onClose={() => setSelectedImage(null)}
                        onDelete={() => handleDelete(selectedImage.id)}
                    />
                )}
            </>
        );
    }
);

Textarea.displayName = "Textarea";

export { Textarea };

