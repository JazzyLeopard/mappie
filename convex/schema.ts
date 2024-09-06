import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    objectives: v.string(),
    onboarding: v.number(),
    stakeholders: v.optional(v.string()),
    requirements: v.optional(v.string()),
    scope: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    constraints: v.optional(v.string()),
    budget: v.optional(v.string()),
    dependencies: v.optional(v.string()),
    priorities: v.optional(v.string()),
    risks: v.optional(v.string()),
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
});

