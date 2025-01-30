"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { WorkItemCreationDialog } from "./WorkItemCreationDialog"

interface EmptyWorkItemsProps {
  onCreateNew: (workItem: any) => void
}

export function EmptyWorkItems({ onCreateNew }: EmptyWorkItemsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
        <div className="bg-slate-50 p-6 rounded-lg max-w-md">
          <h3 className="text-xl font-semibold mb-2">No work items yet</h3>
          <p className="text-sm text-slate-600 mb-6">
            Create your first work item to start organizing your project. Begin with an Epic to break down large pieces of work.
          </p>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            size="lg" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Work Item
          </Button>
        </div>
      </div>

      <WorkItemCreationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateWorkItem={(workItem) => {
          onCreateNew(workItem)
          setIsDialogOpen(false)
        }}
      />
    </>
  )
} 