import { Id } from "@/convex/_generated/dataModel"

export interface SearchableItem {
  id: Id<"workItems"> | Id<"knowledgeBase">
  type: 'epic' | 'feature' | 'story' | 'task' | 'document'
  title: string
  path?: string
} 