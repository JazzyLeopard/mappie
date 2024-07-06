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
		scope: v.optional(v.string()),
		targetAudience: v.optional(v.string()),
		constraints: v.optional(v.string()),
		budget: v.optional(v.string()),
		dependencies: v.optional(v.string()),
		priorities: v.optional(v.string()),
		risks : v.optional(v.string()),
		isArchived: v.boolean(),
		isPublished: v.optional(v.boolean()),
		createdAt: v.int64(), // Storing timestamp as bigint (milliseconds since Unix epoch)
		updatedAt: v.int64(), // Storing timestamp as bigint
	})
		.index("by_userId", ["userId"]) // Index to query projects by userId
		.index("by_createdAt", ["createdAt"]), // Index to query projects by creation time

	epics: defineTable({
		projectId: v.id("projects"),
		name: v.string(),
		description: v.string(),
		status: v.string(), // e.g., 'Not Started', 'In Progress', 'Completed'
		createdAt: v.int64(), // Storing timestamp as bigint
		updatedAt: v.int64(), // Storing timestamp as bigint
		startDate: v.optional(v.int64()), // Storing timestamp as bigint
		endDate: v.optional(v.int64()), // Storing timestamp as bigint
		owner: v.optional(v.string()),
		priority: v.optional(v.string()), // e.g., 'Low', 'Medium', 'High'
		labels: v.optional(v.array(v.string())),
		dependencies: v.optional(v.array(v.id("epics"))), // Array of epic or user story IDs
	})
		.index("by_projectId", ["projectId"]) // Index to query epics by projectId
		.index("by_createdAt", ["createdAt"]), // Index to query epics by creation time

	userStories: defineTable({
		epicId: v.id("epics"),
		title: v.string(),
		description: v.string(),
		acceptanceCriteria: v.optional(v.string()), // Optional field
		interfaceElements: v.optional(v.string()), // Optional field
		inScope: v.optional(v.string()), // Optional field
		outOfScope: v.optional(v.string()), // Optional field
		accessibilityInfo: v.optional(v.string()), // Optional field
		functionalFlow: v.optional(v.string()), // Optional field
		createdAt: v.int64(), // Storing timestamp as bigint
		updatedAt: v.int64(), // Storing timestamp as bigint
	})
		.index("by_epicId", ["epicId"]) // Index to query user stories by epicId
		.index("by_createdAt", ["createdAt"]), // Index to query user stories by creation time
});
