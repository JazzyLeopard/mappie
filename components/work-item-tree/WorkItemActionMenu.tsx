"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { WorkItem } from "./WorkItemNavigator"

interface WorkItemActionMenuProps {
  item: WorkItem
  onRename: (newName: string) => void
  onUpdateParent: (newParentId: string | undefined) => void
  onMoveToTrash: () => void
  hasChildren?: boolean
  availableParents?: WorkItem[]
}

const getItemIcon = (type: WorkItem["type"]) => {
  const iconStyles = "flex items-center justify-center w-5 h-5 rounded text-xs font-semibold mr-2";
  
  switch (type) {
    case "epic":
      return <span className={`${iconStyles} bg-purple-100 text-purple-700`}>EP</span>;
    case "feature":
      return <span className={`${iconStyles} bg-blue-100 text-blue-700`}>FT</span>;
    case "story":
      return <span className={`${iconStyles} bg-green-100 text-green-700`}>US</span>;
    case "task":
      return <span className={`${iconStyles} bg-orange-100 text-orange-700`}>TA</span>;
  }
};

export function WorkItemActionMenu({ 
  item,
  onRename, 
  onUpdateParent,
  onMoveToTrash, 
  hasChildren = false,
  availableParents = []
}: WorkItemActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: item.name,
    parentId: item.parentId?.toString() || "none"
  })

  const canChangeParent = item.type !== "epic";

  const handleEditClick = () => {
    setIsEditDialogOpen(true)
    setIsOpen(false)
  }

  const handleEditSubmit = () => {
    if (editForm.name.trim()) {
      if (editForm.name !== item.name) {
        onRename(editForm.name.trim())
      }
      const newParentId = editForm.parentId === "none" ? undefined : editForm.parentId
      if (newParentId !== item.parentId?.toString()) {
        onUpdateParent(newParentId)
      }
      setIsEditDialogOpen(false)
    }
  }

  const handleMoveToTrash = () => {
    if (hasChildren) {
      toast.error("Cannot delete items with children", {
        description: "Please unlink or delete the child items first.",
        duration: 4000,
      });
      setIsOpen(false);
      return;
    }
    onMoveToTrash();
    setIsOpen(false);
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3 hover:bg-gray-200" />
            <span className="sr-only">Open menu</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="grid gap-2">
            <Button variant="ghost" size="sm" onClick={handleEditClick} className="justify-start w-full">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMoveToTrash} 
              className={`justify-start w-full ${hasChildren ? 'text-gray-400' : ''}`}
              title={hasChildren ? "Cannot delete items with children" : "Move to trash"}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Move to Trash
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {item.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent" className={!canChangeParent ? "text-gray-400" : ""}>
                Parent {!canChangeParent && "(Epics cannot have parents)"}
              </Label>
              <Select
                value={editForm.parentId}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, parentId: value }))}
                disabled={!canChangeParent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent">
                    {editForm.parentId !== "none" && availableParents?.find(p => p.id.toString() === editForm.parentId) && (
                      <div className="flex items-center">
                        {getItemIcon(availableParents.find(p => p.id.toString() === editForm.parentId)!.type)}
                        <span className="truncate">
                          {availableParents.find(p => p.id.toString() === editForm.parentId)?.name}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center">
                      <span>No Parent</span>
                    </div>
                  </SelectItem>
                  {availableParents?.map((parent) => (
                    <SelectItem 
                      key={parent.id} 
                      value={parent.id.toString()}
                      disabled={parent.id === item.id}
                    >
                      <div className="flex items-center">
                        {getItemIcon(parent.type)}
                        <span className="truncate">{parent.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const transformToWorkItem = (item: any): WorkItem => ({
  id: item._id,
  name: item.title,
  type: item.type,
  items: [],
  order: item.order,
  parentId: item.parentId
});

