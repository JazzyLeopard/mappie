"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Search, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"

type WorkItemType = "epic" | "feature" | "story" | "task"

interface WorkItemTemplateSelectorProps {
  type: WorkItemType
  onSelect: (template: any) => void
}

export function WorkItemTemplateSelector({
  type,
  onSelect
}: WorkItemTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock templates for UI development
  const templates = [
    { id: 1, title: "Basic Template", description: "A simple template for getting started" },
    { id: 2, title: "Detailed Template", description: "Comprehensive template with all sections" }
  ]

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {templates.map((template) => (
            <Card key={template.id} className="p-4 cursor-pointer hover:shadow-md" onClick={() => onSelect(template)}>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{template.title}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 