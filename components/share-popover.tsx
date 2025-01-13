"use client"

import { useState, useEffect } from "react"
import { Check, Copy, ExternalLink, Link2, Link2Off } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useAuth } from "@clerk/nextjs"
import { toast } from "react-hot-toast"

interface SharePopoverProps {
  projectId: Id<"projects">;
  onShare?: () => Promise<void>;
  variant?: 'default' | 'nav';
}

export function SharePopover({ projectId, onShare, variant }: SharePopoverProps) {
  const { userId } = useAuth();
  const createShare = useMutation(api.shareLink.create);
  const shareData = useQuery(api.shareLink.getShareIdByProjectId, { projectId });
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    if (shareData) {
      setIsPublished(shareData.status);
      setShareLink(`${window.location.origin}/share/${shareData.shareId}`);
    }
  }, [shareData]);

  const handlePublish = async () => {
    if (userId) {
      try {
        // If we already have a shareId, reuse it
        const shareId = shareData?.shareId || Math.random().toString(36).substring(2, 15);
        await createShare({
          projectId,
          shareId,
          status: true,
          userId,
        });
        
        setShareLink(`${window.location.origin}/share/${shareId}`);
        setIsPublished(true);
        if (onShare) await onShare();
        copyToClipboard();
      } catch (error) {
        console.error("Failed to publish: ", error);
      }
    }
  }

  const handleUnpublish = async () => {
    if (userId && shareData?.shareId) {
      try {
        await createShare({
          projectId,
          shareId: shareData.shareId,
          status: false,
          userId,
        });
        setIsPublished(false);
        toast.success("Link unpublished successfully");
      } catch (error) {
        console.error("Failed to unpublish:", error);
        toast.error("Failed to unpublish link");
      }
    }
  }

  const getDisplayLink = () => {
    if (!shareData?.shareId) return '';
    return `${window.location.origin}/share/${shareData.shareId}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getDisplayLink())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2",
            isPublished ? "text-black" : "",
            variant === 'nav' && "w-full text-sm bg-black p-4 text-white hover:bg-white hover:text-black"
          )}
        >
          {isPublished ? (
            <>
              <Link2 className="h-4 w-4" />
              <span className={cn(
                "text-sm",
                (variant === 'nav' || !variant) && "underline"
              )}>Shared</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Share Epic Link
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Share this page</h4>
          <div className="flex space-x-2">
            <Input
              value={getDisplayLink()}
              readOnly
              className={cn(
                "h-9 cursor-default focus-visible:ring-0",
                isPublished ? "bg-white" : "bg-muted text-muted-foreground"
              )}
            />
            <Button
              size="sm"
              className="px-3"
              variant="outline"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <Button
              size="sm"
              variant={isPublished ? "destructive" : "default"}
              onClick={isPublished ? handleUnpublish : handlePublish}
            >
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
            <Button
              size="sm"
              className="gap-2"
              variant="outline"
              onClick={() => window.open(getDisplayLink(), '_blank')}
            >
              Open page
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


