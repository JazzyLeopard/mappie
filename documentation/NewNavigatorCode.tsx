import { useState, useCallback, useRef } from "react"
import { ChevronRight, Plus } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { WorkItemActionMenu } from "@/components/work-item-tree/WorkItemActionMenu"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useDrag, useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'

type WorkItemType = "epic" | "feature" | "story" | "task"

type WorkItem = {
  id: string
  name: string
  type: WorkItemType
  items?: WorkItem[]
  order: number
  parentId?: string
}

interface WorkItemNavigatorProps {
  item: WorkItem
  animated?: boolean
  onSelect: (item: WorkItem) => void
  onRename: (item: WorkItem, newName: string) => void
  onMoveToTrash: (item: WorkItem) => void
  onAddItem: (parentItem?: WorkItem) => void
  selectedItemId?: string
  parentIsOpen?: boolean
  index: number
  parentId: string
  onReorder: (itemId: string, newParentId: string, newOrder: number) => void
  isExpanded?: boolean
}

const BASE_ORDER = 1000 
const MIN_GAP = 100    

export function WorkItemNavigator({
  item,
  animated = true,
  onSelect,
  onRename,
  onMoveToTrash,
  onAddItem,
  selectedItemId,
  parentIsOpen = true,
  index,
  parentId,
  onReorder,
  isExpanded = false
}: WorkItemNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [isOverTop, setIsOverTop] = useState(true)
  const [isDragStarted, setIsDragStarted] = useState(false)

  const [{ isDragging }, drag] = useDrag({
    type: 'WORK_ITEM',
    item: () => {
      setIsDragStarted(true)
      return {
        id: item.id,
        type: item.type,
        index,
        parentId
      }
    },
    end: () => {
      setTimeout(() => {
        setIsDragStarted(false)
      }, 100)
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [{ isOver, canDrop, draggedItem }, drop] = useDrop({
    accept: 'WORK_ITEM',
    canDrop: (draggedItem: any) => {
      if (draggedItem.type === 'epic') {
        return item.type === 'epic'
      }
      const validChildTypes = getValidChildTypes(item.type)
      return (validChildTypes.includes(draggedItem.type) || draggedItem.type === item.type) 
             && draggedItem.id !== item.id
    },
    hover: (_, monitor) => {
      if (!monitor.isOver({ shallow: true })) return

      const clientOffset = monitor.getClientOffset()
      if (!clientOffset || !ref.current) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      setIsOverTop(hoverClientY < hoverMiddleY)
    },
    drop: (draggedItem: any) => {
      if (!isOver || !canDrop) return
      
      const targetParentId = draggedItem.type === item.type ? parentId : item.id
      const siblings = item.items || []
      let newOrder: number
      
      if (draggedItem.type === item.type) {
        if (isOverTop) {
          const prevItem = siblings[index - 1]
          if (!prevItem) {
            newOrder = item.order - BASE_ORDER
          } else {
            newOrder = prevItem.order + Math.floor((item.order - prevItem.order) / 2)
          }
        } else {
          const nextItem = siblings[index + 1]
          if (!nextItem) {
            newOrder = item.order + BASE_ORDER
          } else {
            newOrder = item.order + Math.floor((nextItem.order - item.order) / 2)
          }
        }
      } else {
        if (siblings.length === 0) {
          newOrder = BASE_ORDER
        } else {
          const lastChild = siblings[siblings.length - 1]
          newOrder = lastChild.order + BASE_ORDER
        }
      }
      
      if (newOrder > Number.MAX_SAFE_INTEGER / 2 || 
          Math.abs(newOrder - item.order) < MIN_GAP) {
        const normalizedOrder = siblings.reduce((acc, sibling, idx) => {
          const normalizedPos = BASE_ORDER * (idx + 1)
          onReorder(sibling.id, targetParentId, normalizedPos)
          return normalizedPos
        }, BASE_ORDER)
        
        newOrder = isOverTop ? 
          normalizedOrder - BASE_ORDER : 
          normalizedOrder + BASE_ORDER
      }
      
      onReorder(draggedItem.id, targetParentId, newOrder)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      draggedItem: monitor.getItem()
    })
  })

  drag(drop(ref))

  const isSelected = selectedItemId === item.id

  const handleIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (item.items?.length) {
        setIsOpen((prev) => !prev)
      }
    },
    [item.items],
  )

  const handleItemClick = useCallback((e: React.MouseEvent) => {
    if (isDragging || isDragStarted) return
    
    const target = e.target as HTMLElement
    if (
      target.closest('button') || 
      target.closest('[role="menuitem"]')
    ) {
      return
    }
    
    onSelect(item)
  }, [item, onSelect, isDragging, isDragStarted])

  const handleRename = useCallback(
    (newName: string) => {
      onRename(item, newName)
    },
    [item, onRename],
  )

  const handleMoveToTrash = useCallback(() => {
    onMoveToTrash(item)
  }, [item, onMoveToTrash])

  const getValidChildTypes = (parentType: WorkItemType): WorkItemType[] => {
    switch (parentType) {
      case "epic":
        return ["feature", "story"];  // Added "story" as valid child type for epics
      case "feature":
        return ["story"];
      case "story":
        return ["task"];
      default:
        return [];
    }
  };

  const canAddChild = useCallback((parentType: WorkItemType) => {
    return getValidChildTypes(parentType).length > 0;
  }, []);

  const ItemIcon = () => {
    const showChevron = isHovered && item.items && item.items.length > 0

    return (
      <div className="relative w-4 h-4">
        <AnimatePresence initial={false} mode="wait">
          {showChevron ? (
            <motion.span
              key="chevron"
              initial={{ opacity: 0, rotate: isOpen ? 90 : 0 }}
              animate={{ opacity: 1, rotate: isOpen ? 90 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ChevronRight className="size-4 text-gray-500" />
            </motion.span>
          ) : (
            <motion.span
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {getItemIcon(item.type)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const getItemIcon = (type: WorkItemType) => {
    const style = { fontSize: "14px" }
    switch (type) {
      case "epic":
        return <span style={style}>🏆</span>
      case "feature":
        return <span style={style}>🌟</span>
      case "story":
        return <span style={style}>📖</span>
      case "task":
        return <span style={style}>✅</span>
    }
  }

  if (!parentIsOpen) return null

  return (
    <div ref={ref} className="relative">
      {isOver && canDrop && draggedItem?.type === item.type && (
        <div 
          className="absolute left-0 right-0 h-0.5 bg-blue-500 pointer-events-none" 
          style={{ top: isOverTop ? '-1px' : 'calc(100% - 1px)' }} 
        />
      )}
      
      <motion.div 
        layout
        transition={{ 
          layout: { duration: 0.2 },
          opacity: { duration: 0.2 }
        }}
        className={cn(
          "rounded-lg",
          "cursor-grab active:cursor-grabbing",
          item.id === draggedItem?.id && isDragging && "opacity-50",
          isOver && draggedItem && draggedItem.type !== item.type && (
            canDrop ? "bg-emerald-100/50" : "bg-red-100/50"
          )
        )}
      >
        <motion.div 
          layout="position"
          className={cn(
            "flex items-center gap-2 rounded-lg p-2",
            isSelected ? "bg-slate-200" : "hover:bg-slate-200",
            "transition-colors duration-200"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleItemClick}
        >
          <button className="p-0.5 focus:outline-none" onClick={handleIconClick}>
            <ItemIcon />
          </button>
          <span className="flex-grow truncate" title={item.name}>
            {item.name}
          </span>
          {isHovered && (
            <>
              {canAddChild(item.type) && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0" 
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddItem(item)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <WorkItemActionMenu onRename={handleRename} onMoveToTrash={handleMoveToTrash} />
            </>
          )}
        </motion.div>

        <AnimatePresence>
          {isOpen && item.items && item.items.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-6 overflow-hidden"
            >
              {item.items.map((child, index) => (
                <WorkItemNavigator
                  key={child.id}
                  item={child}
                  index={index}
                  parentId={item.id}
                  onSelect={onSelect}
                  onRename={onRename}
                  onMoveToTrash={onMoveToTrash}
                  onAddItem={onAddItem}
                  selectedItemId={selectedItemId}
                  onReorder={onReorder}
                  isExpanded={isExpanded}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isDragging && item.id === draggedItem?.id && (
        <div
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 100,
            left: '0',
            top: '0',
            width: 'calc(100% - 2rem)',
          }}
          className="mx-2 p-2 bg-white shadow-xl ring-1 ring-slate-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <ItemIcon />
            <span className="truncate">{item.name}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function AddWorkItemButton({ onAddItem }: { onAddItem: () => void }) {
  return (
    <Button
      variant="ghost"
      size="lg"
      className="w-full justify-start text-xs text-slate-500 hover:bg-white h-8 mt-2"
      onClick={onAddItem}
    >
      <Plus className="h-3 w-3 mr-2" />
      New Work Item
    </Button>
  );
}
