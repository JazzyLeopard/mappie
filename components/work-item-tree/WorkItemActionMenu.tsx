"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface WorkItemActionMenuProps {
  onRename: (newName: string) => void
  onMoveToTrash: () => void
}

export function WorkItemActionMenu({ onRename, onMoveToTrash }: WorkItemActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState("")

  const handleRenameClick = () => {
    setIsRenaming(true)
  }

  const handleRenameSubmit = () => {
    if (newName.trim()) {
      onRename(newName.trim())
      setNewName("")
      setIsRenaming(false)
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3 hover:bg-gray-200" />
          <span className="sr-only">Open menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="grid gap-2">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="New name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-8"
              />
              <Button size="sm" className="h-8 px-2" onClick={handleRenameSubmit}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleRenameClick} className="justify-start w-full">
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onMoveToTrash} className="justify-start w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Move to Trash
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

