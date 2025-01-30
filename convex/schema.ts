import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { SYSTEM_TEMPLATES } from "./utils/systemTemplates";

// Types
export type WorkItemType = "epic" | "feature" | "story" | "task";

export const WORK_ITEM_HIERARCHY: Record<WorkItemType, WorkItemType[]> = {
  epic: [],
  feature: ["epic"],
  story: ["epic", "feature"],
  task: ["epic", "feature", "story"]
} as const;

export const isValidParentChild = (parentType: WorkItemType | undefined, childType: WorkItemType): boolean => {
  if (!parentType) return childType === "epic"; // Only epics can be root items
  return WORK_ITEM_HIERARCHY[childType].includes(parentType);
};

export default defineSchema({
  // Main workspace table
  workspaces: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
    isArchived: v.boolean(),
    projectType: v.optional(v.union(
      v.literal("software"),
      v.literal("hardware"),
      v.literal("service"),
      v.literal("other")
    )),
    metadata: v.optional(v.object({
      industry: v.optional(v.string()),
      objectives: v.optional(v.array(v.string())),
      stakeholders: v.optional(v.array(v.string())),
      timeline: v.optional(v.object({
        startDate: v.int64(),
        targetDate: v.optional(v.int64())
      }))
    })),
    settings: v.optional(v.object({
      defaultTemplates: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    })),
    createdAt: v.int64(),
    updatedAt: v.int64(),
  })
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  // Work items (epics, features, stories, tasks)
  workItems: defineTable({
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("workItems")),
    type: v.union(
      v.literal("epic"),
      v.literal("feature"),
      v.literal("story"),
      v.literal("task")
    ),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    order: v.number(),
    metadata: v.optional(v.object({
      priority: v.optional(v.string()),
      complexity: v.optional(v.string()),
      estimatedEffort: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      assignee: v.optional(v.string()),
      dueDate: v.optional(v.int64()),
    })),
    createdAt: v.int64(),
    updatedAt: v.int64(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_parent", ["parentId"])
    .index("by_type", ["workspaceId", "type"])
    .index("by_createdAt", ["createdAt"])
    .index("by_order", ["order"])
    .index("by_workspace_and_order", ["workspaceId", "order"]),

  // Knowledge base (templates, documents)
  knowledgeBase: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    type: v.union(
      v.literal("document"),
      v.literal("pdf"),
      v.literal("docx"),
      v.literal("csv"),
      v.literal("json"),
      v.literal("md"),
      v.literal("txt"),
      v.literal("ppt"),
      v.literal("image"),
      v.literal("template"),
      v.literal("reference")
    ),
    templateType: v.optional(v.union(
      v.literal("prd"),
      v.literal("funcReq"),
      v.literal("useCase"),
      v.literal("epic"),
      v.literal("feature"),
      v.literal("userStory"),
      v.literal("custom")
    )),
    title: v.string(),
    content: v.string(),
    isSystemTemplate: v.boolean(),
    metadata: v.optional(v.object({
      description: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      placeholders: v.optional(v.array(v.string())),
      version: v.optional(v.string()),
      lastUsed: v.optional(v.int64()),
      useCount: v.optional(v.number()),
      clonedFrom: v.optional(v.id("knowledgeBase")),
    })),
    storageId: v.optional(v.id("_storage")),
    fileSize: v.optional(v.number()),
    createdAt: v.int64(),
    updatedAt: v.int64(),
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.int64()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["workspaceId", "type"])
    .index("by_template", ["isSystemTemplate", "templateType"])
    .index("by_createdAt", ["createdAt"]),

  // AI chat messages
  messages: defineTable({
    workspaceId: v.id("workspaces"),
    itemId: v.optional(v.id("workItems")),
    itemType: v.string(),
    messages: v.array(v.object({
      id: v.optional(v.string()),
      role: v.union(
        v.literal("system"),
        v.literal("user"),
        v.literal("assistant"),
        v.literal("function"),
        v.literal("tool"),
        v.literal("data")
      ),
      content: v.string(),
      toolInvocations: v.optional(v.array(v.object({
        toolName: v.string(),
        toolCallId: v.string(),
        state: v.string(),
        args: v.optional(v.any()),
        result: v.optional(v.object({
          content: v.string(),
          metadata: v.optional(v.object({
            title: v.optional(v.string()),
            type: v.optional(v.string())
          }))
        }))
      })))
    })),
    createdAt: v.int64(),
    updatedAt: v.int64(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_item", ["itemId"])
    .index("by_itemId_and_type", ["itemId", "itemType"])
    .index("by_createdAt", ["createdAt"]),

  // Sharing settings
  sharing: defineTable({
    workspaceId: v.id("workspaces"),
    shareId: v.string(),
    status: v.boolean(),
    createdBy: v.string(),
    createdAt: v.int64(),
    updatedAt: v.int64(),
  })
    .index("by_shareId", ["shareId"])
    .index("by_workspace", ["workspaceId"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    // Add other fields as needed
  }),

  templates: defineTable({
    title: v.string(),
    type: v.optional(v.union(
      v.literal("prd"),
      v.literal("funcReq"),
      v.literal("useCase"),
      v.literal("epic"),
      v.literal("feature"),
      v.literal("userStory"),
      v.literal("custom"),
      v.literal("srs"),
      v.literal("techSpec"),
      v.literal("testPlan"),
      v.literal("releaseNotes")
    )),
    content: v.string(),
    aiPrompt: v.string(),
    isSystemTemplate: v.boolean(),
    metadata: v.object({
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      tags: v.array(v.string()),
      version: v.string(),
      useCount: v.number(),
      status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
      lastUsed: v.optional(v.number()),
      createdBy: v.optional(v.string()),
    }),
    workspaceId: v.optional(v.id("workspaces")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_system", ["isSystemTemplate"])
    .index("by_workspace", ["workspaceId"]),

  // Optional: Template usage statistics
  templateUsage: defineTable({
    templateId: v.id("templates"),
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    usedAt: v.number(),
    documentId: v.id("knowledgeBase"), // Reference to the document created from this template
    metadata: v.optional(v.object({
      success: v.boolean(), // Was the template useful?
      feedback: v.optional(v.string()),
      completionTime: v.optional(v.number()), // How long it took to complete
    })),
  })
    .index("by_template", ["templateId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_date", ["usedAt"]),
});
