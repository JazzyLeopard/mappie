"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FileText, Paperclip, Plus } from "lucide-react"

export function ResourceSelector() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Paperclip className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="grid gap-4">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => {
              console.log("Knowledge base selection")
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            From Knowledge Base
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => {
              console.log("Computer file selection")
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            From Computer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 