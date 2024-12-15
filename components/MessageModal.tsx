'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { sendMessage } from '@/actions/send-message'
import { handleImagePaste } from '@/utils/handleImagePaste'

export function MessageModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [pastedImages, setPastedImages] = useState<File[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('message', data.message)
    formData.append('email', data.email)
    pastedImages.forEach((file) => formData.append('images', file))
    attachments.forEach((file) => formData.append('attachments', file))

    const result = await sendMessage(formData)
    setResult(result)
    setIsSubmitting(false)

    if (result.success) {
      reset()
      setPastedImages([])
      setAttachments([])
      setTimeout(() => onOpenChange(false), 2000)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    handleImagePaste(e, (file: File) => {
      setPastedImages((prev) => [...prev, file])
    })
  }

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files as FileList)])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Send Message</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send a Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              {...register('message', { required: true })}
              onPaste={handlePaste}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input id="email" type="email" {...register('email', { required: true })} />
          </div>
          <div className="gap-1">
            <Input
              type="file"
              onChange={handleAttachment}
              ref={fileInputRef}
              className="hidden ml-2"
              multiple
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Add Attachments
            </Button>
            {attachments.length > 0 && (
              <div className="text-sm text-gray-500">
                {attachments.length} file(s) selected
              </div>
            )}
          </div>
          {pastedImages.length > 0 && (
            <div className="text-sm text-gray-500">
              {pastedImages.length} image(s) pasted
            </div>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}

