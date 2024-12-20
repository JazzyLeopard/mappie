"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wand2, Paperclip } from 'lucide-react'
import { FileAttachment } from '@/components/file-attachment'
import { SpokenLanguage, Attachment, ProjectDetails } from "@/types"
import { Progress } from "@/components/ui/progress"

interface ProjectIdeationProps {
  onSubmit: (description: string, language: SpokenLanguage) => Promise<void>;
  isGenerating: boolean;
  generationProgress?: number;
  generationStatus?: string;
}

export default function ProjectIdeation({ onSubmit, isGenerating, generationProgress = 0, generationStatus = '' }: ProjectIdeationProps) {
  const [projectDescription, setProjectDescription] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<SpokenLanguage | "">("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mockProgress, setMockProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isGenerating) {
      setMockProgress(0);
      progressInterval.current = setInterval(() => {
        setMockProgress(prev => {
          if (prev >= 99) return prev;
          const remaining = 99 - prev;
          const increment = Math.max(0.5, remaining * 0.1);
          return Math.min(99, prev + increment);
        });
      }, 300);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setMockProgress(100);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isGenerating]);

  const getStatusMessage = (progress: number) => {
    if (progress < 25) return "Analyzing your description...";
    if (progress < 50) return "Generating epic structure...";
    if (progress < 75) return "Refining epic details...";
    if (progress < 100) return "Finalizing generation...";
    return "Complete!";
  };

  const handleAttachment = useCallback((files: FileList | null) => {
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        id: uuidv4(),
        file,
        previewUrl: URL.createObjectURL(file)
      }))
      setAttachments(prev => [...prev, ...newAttachments])
    }
  }, [])

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id))
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const files = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        files.push(items[i].getAsFile())
      }
    }
    handleAttachment(files as unknown as FileList)
  }, [handleAttachment])

  const handleGenerate = useCallback(async () => {
    if (!projectDescription || !selectedLanguage) return;
    await onSubmit(projectDescription, selectedLanguage as SpokenLanguage);
  }, [projectDescription, selectedLanguage, onSubmit]);

  return (
    <Card className="w-full border-0 shadow-none">
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-semibold">
                Generating Epic based on your description...
              </h3>
              <Progress value={mockProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {getStatusMessage(mockProgress)}
              </p>
            </div>
          </div>
        </div>
      )}
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder={`🚀 Describe your awesome epic!

✨ What do you want to build?
👥 Who is it for?
🎯 Why are you building it?

Let's bring your ideas to life!`}
            className="min-h-[200px]"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            onPaste={handlePaste}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleAttachment(e.target.files)}
            multiple
            accept="image/*"
          />
        </div>
        {attachments.length > 0 && (
          <div className="flex flex-wrap">
            {attachments.map((attachment) => (
              <FileAttachment
                key={attachment.id}
                attachment={attachment}
                onRemove={handleRemoveAttachment}
              />
            ))}
          </div>
        )}
        <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as SpokenLanguage)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="dutch">Dutch</SelectItem>
            <SelectItem value="turkish">Turkish</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !projectDescription || !selectedLanguage}
          className="bg-gradient-to-r from-pink-500 to-blue-500 text-white flex items-center gap-2"
        >
          {isGenerating ? (
            "Generating..."
          ) : (
            <>
              Generate
              <Wand2 className="w-4 h-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

