"use client"

import { useState } from "react"
import { Check, Search } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area-1"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface KnowledgeBaseSelectorProps {
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
}

export function KnowledgeBaseSelector({
  selectedItems,
  onSelectionChange
}: KnowledgeBaseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const documents = useQuery(api.knowledgeBase.getRecent, { limit: 100 })

  const toggleItem = (itemId: string) => {
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId]
    onSelectionChange(newSelection)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="space-y-4">
          {documents?.map((doc) => (
            <div
              key={doc._id}
              className={cn(
                "flex items-center space-x-2 rounded-lg p-2 hover:bg-slate-100",
                selectedItems.includes(doc._id) && "bg-slate-100"
              )}
            >
              <Checkbox
                checked={selectedItems.includes(doc._id)}
                onCheckedChange={() => toggleItem(doc._id)}
              />
              <div className="flex-1 overflow-hidden">
                <h4 className="font-medium truncate">{doc.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  Last edited {new Date(Number(doc.updatedAt)).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {documents?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No documents found
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="text-sm text-muted-foreground">
        {selectedItems.length} items selected
      </div>
    </div>
  )
} 