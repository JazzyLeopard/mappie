import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createUserStory = mutation({
	args: {
		epicId: v.id("epics"),
		title: v.string(),
		description: v.string(),
		acceptanceCriteria: v.optional(v.string()),
		interfaceElements: v.optional(v.string()),
		inScope: v.optional(v.string()),
		outOfScope: v.optional(v.string()),
		accessibilityInfo: v.optional(v.string()),
		functionalFlow: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userStoryId = await ctx.db.insert("userStories", {
			epicId: args.epicId,
			title: args.title,
			description: args.description,
			acceptanceCriteria: args.acceptanceCriteria,
			interfaceElements: args.interfaceElements,
			inScope: args.inScope,
			outOfScope: args.outOfScope,
			accessibilityInfo: args.accessibilityInfo,
			functionalFlow: args.functionalFlow,
			createdAt: BigInt(Date.now()),
			updatedAt: BigInt(Date.now()),
        });

		return userStoryId;
	},
});

export const getEpicById = query({
	args: { epicId: v.id("epics") },
	handler: async (ctx, { epicId }) => {
	  const identity = await ctx.auth.getUserIdentity();
  
	  if (!identity) {
		throw new Error("Not Authenticated");
	  }
  
	  if (!epicId) {
		throw new Error("Project ID is required");
	  }
  
	  const epic = await ctx.db
		.query("epics")
		.filter((q) =>
		  q.and(
			q.eq(q.field("_id"), epicId),
		  ),
		)
		.first();
  
	  if (!epic) {
		throw new Error("Epic not found");
	  }
  
	  return epic;
	},
  });

export const getEpics = query({
	handler: async (ctx) => {
	  const identity = await ctx.auth.getUserIdentity();
  
	  if (!identity) {
		throw new Error("Not Authenticated");
	  }
  
	  const epics = await ctx.db
		.query("epics")
		.filter((q) =>
		  q.and(
			// q.eq(q.field(""), identity?.subject),
		  ),
		)
		?.collect();
  
	  return epics;
	},
});

export const updateEpic = mutation({
	args: {
		id: v.id("epics"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		objectives: v.optional(v.string()),
		requirements: v.optional(v.string()),
		stakeholders: v.optional(v.string()),
		timeline: v.optional(v.string()),
		successMetrics: v.optional(v.string()),
		status: v.optional(v.string()),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		owner: v.optional(v.string()),
		priority: v.optional(v.string()),
		labels: v.optional(v.array(v.string())),
		dependencies: v.optional(v.array(v.id("epics"))),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		const updatedFields = {
			...updates,
			updatedAt: BigInt(Date.now()),
			startDate: updates.startDate
				? BigInt(new Date(updates.startDate).getTime())
				: undefined,
			endDate: updates.endDate
				? BigInt(new Date(updates.endDate).getTime())
				: undefined,
		};
		await ctx.db.patch(id, updatedFields);
	},
});

export const deleteEpic = mutation({
	args: { id: v.id("epics") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});

export const createEpics = mutation({
    args: {
        projectId: v.id("projects"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        const userId = identity.subject;

        const epic = await ctx.db.insert("epics", {
            title: args.title,
            description: "",
            objectives: "",
            status: "",
            projectId: args.projectId,
            createdAt: BigInt(Date.now()), // Use BigInt for timestamps
            updatedAt: BigInt(Date.now()),
        });

        return epic;
    },
})