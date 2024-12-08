"use client"

import React, { useState, useCallback, useRef } from "react"
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wand2, Paperclip } from 'lucide-react'
import { FileAttachment } from '@/components/file-attachment'
import { SpokenLanguage, Attachment, ProjectDetails } from "@/types"

interface ProjectIdeationProps {
  onSubmit: (description: string, language: SpokenLanguage) => Promise<void>;
  isGenerating: boolean;
}

export default function ProjectIdeation({ onSubmit, isGenerating }: ProjectIdeationProps) {
  const [projectDescription, setProjectDescription] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<SpokenLanguage | "">("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generate Project with AI</h2>
        </div>
        <div className="relative">
          <Textarea
            placeholder={`🚀 Describe your awesome project!

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
          className="gap-2"
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

