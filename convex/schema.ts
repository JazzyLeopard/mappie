import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    userId: v.string(),
    onboarding: v.number(),
    title: v.string(),
    overview: v.string(),
    problemStatement: v.string(),
    userPersonas: v.optional(v.string()),
    featuresInOut: v.optional(v.string()),
    successMetrics: v.optional(v.string()),
    userScenarios: v.optional(v.string()),
    featurePrioritization: v.optional(v.string()),
    risksDependencies: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.optional(v.boolean()),
    createdAt: v.int64(), // Storing timestamp as bigint (milliseconds since Unix epoch)
    updatedAt: v.int64(), // Storing timestamp as bigint
  })
    .index("by_userId", ["userId"]) // Index to query projects by userId
    .index("by_createdAt", ["createdAt"]), // Index to query projects by creation time

  useCases: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(), // This will contain all sub-requirements
    createdAt: v.int64(),
    updatedAt: v.int64(),
  }).index("by_projectId", ["projectId"]),
  // Index to query projects by creation time,

  functionalRequirements: defineTable({
    projectId: v.id("projects"),
    content: v.string(),
    createdAt: v.int64(),
    updatedAt: v.int64(),
  }).index("by_projectId", ["projectId"])
    .index("by_createdAt", ["createdAt"]), // Index to query functional requirements by creation time

  epics: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.string(),
    createdAt: v.int64(), // Storing timestamp as bigint
    updatedAt: v.int64(), // Storing timestamp as bigint
  })
    .index("by_projectId", ["projectId"]) // Index to query epics by projectId
    .index("by_createdAt", ["createdAt"]), // Index to query epics by creation time

  userStories: defineTable({
    epicId: v.id("epics"),
    title: v.string(),
    description: v.string(),
    createdAt: v.int64(), // Storing timestamp as bigint
    updatedAt: v.int64(), // Storing timestamp as bigint
  })
    .index("by_epicId", ["epicId"]) // Index to query user stories by epicId
    .index("by_createdAt", ["createdAt"]), // Index to query user stories by creation time

  documents: defineTable({
    projectId: v.id("projects"), // Associate the document with a project
    storageId: v.id("_storage"),
    filename: v.string(), // Store the file name
    summarizedContent: v.string(), // Store the summarized content
    createdAt: v.int64(), // Storing timestamp as bigint
    updatedAt: v.int64(), // Storing timestamp as bigint
  })
    .index("by_projectId", ["projectId"]) // Index to query documents by projectId  
    .index("by_createdAt", ["createdAt"]), // Index to query epics by creation time,

  messages: defineTable({
    itemId: v.string(),
    itemType: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal('system'), v.literal('user'), v.literal('assistant'), 
                   v.literal('function'), v.literal('data'), v.literal('tool')),
      content: v.string(),
      id: v.string(),
      toolInvocations: v.optional(v.array(v.object({
        toolName: v.string(),
        toolCallId: v.string(),
        state: v.string(),
        args: v.optional(v.object({
          content: v.string(),
          metadata: v.optional(v.object({
            title: v.optional(v.string()),
            type: v.optional(v.string())
          }))
        })),
        result: v.optional(v.object({
          content: v.string(),
          metadata: v.optional(v.object({
            title: v.optional(v.string()),
            type: v.optional(v.string())
          }))
        }))
      })))
    })),
    projectId: v.id("projects"),
    createdAt: v.int64(),
    updatedAt: v.int64()
  })
    .index("by_itemId_and_type", ["itemId", "itemType"])
    .index("by_projectId", ["projectId"])
    .index("by_createdAt", ["createdAt"]),
});
