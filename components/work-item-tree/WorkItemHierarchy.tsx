"use client"

import { useState, useCallback } from "react"
import { WorkItemNavigator } from "@/components/work-item-tree/WorkItemNavigator"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { WorkItemCreationDialog } from "@/components/work-items/WorkItemCreationDialog"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "react-hot-toast"

type WorkItemType = "epic" | "feature" | "story" | "task"

type WorkItem = {
  id: string
  name: string
  type: WorkItemType
  items?: WorkItem[]
  order: number;
  parentId?: string;
}

const getValidChildTypes = (parentType: WorkItemType): WorkItemType[] => {
  switch (parentType) {
    case "epic":
      return ["feature"]
    case "feature":
      return ["story"]
    case "story":
      return ["task"]
    default:
      return []
  }
}

interface WorkItemHierarchyProps {
  onReorder: (itemId: string, newParentId: string, newOrder: number) => void;
}

export function WorkItemHierarchy({ onReorder, ...props }: WorkItemHierarchyProps) {
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null)
  const [isCreatingWorkItem, setIsCreatingWorkItem] = useState(false)

  // Get workspace and work items
  const workspaces = useQuery(api.workspaces.getWorkspaces)
  const workspace = workspaces?.[0]
  const workItems = useQuery(
    api.workItems.getWorkItems, 
    workspace ? { workspaceId: workspace._id } : "skip"
  )

  const createWorkItem = useMutation(api.workItems.createWorkItem)
  const updateWorkItem = useMutation(api.workItems.updateWorkItem)
  const deleteWorkItem = useMutation(api.workItems.deleteWorkItem)

  const handleRename = async (item: WorkItem, newName: string) => {
    try {
      await updateWorkItem({
        id: item.id as Id<"workItems">,
        title: newName
      })
      toast.success("Work item renamed")
    } catch (error) {
      toast.error("Failed to rename work item")
      console.error(error)
    }
  }

  const handleMoveToTrash = async (item: WorkItem) => {
    try {
      await deleteWorkItem({
        id: item.id as Id<"workItems">
      })
      toast.success("Work item deleted")
      if (selectedItem?.id === item.id) {
        setSelectedItem(null)
      }
    } catch (error) {
      toast.error("Failed to delete work item")
      console.error(error)
    }
  }

  const handleAddItem = async (parentItem?: WorkItem) => {
    if (!workspace?._id) {
      toast.error("No workspace selected")
      return
    }

    try {
      const newItemId = await createWorkItem({
        workspaceId: workspace._id,
        parentId: parentItem ? (parentItem.id as Id<"workItems">) : undefined,
        type: parentItem 
          ? getValidChildTypes(parentItem.type)[0] 
          : "epic",
        title: `New ${parentItem ? getValidChildTypes(parentItem.type)[0] : "epic"}`,
        description: "",
        status: "todo"
      })

      toast.success("Work item created")
    } catch (error) {
      toast.error("Failed to create work item")
      console.error(error)
    }
  }

  if (!workspace || !workItems) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full">
      <div className="p-4 bg-slate-100 rounded-lg h-full w-full overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Work Items</h2>
        <div className="space-y-0.5">
          {workItems.map((item, index) => (
            <WorkItemNavigator
              key={item._id}
              index={index}
              parentId="root"
              item={{
                id: item._id,
                name: item.title,
                type: item.type,
                order: item.order,
                parentId: item.parentId
              }}
              onSelect={setSelectedItem}
              onRename={handleRename}
              onMoveToTrash={handleMoveToTrash}
              onAddItem={handleAddItem}
              selectedItemId={selectedItem?.id}
              onReorder={onReorder}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


