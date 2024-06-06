import { mutation } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
	args: {
		title: v.string(),
		userId: v.string(),
		description: v.string(),
		isPublished: v.boolean(),
	},
	handler: async (ctx, args) => {
		const projectId = await ctx.db.insert("projects", {
			title: args.title,
			userId: args.userId,
			description: args.description,
			isPublished: args.isPublished,
			isArchived: false,
			createdAt: BigInt(Date.now()), // Use BigInt for timestamps
			updatedAt: BigInt(Date.now()), // Use BigInt for timestamps
		});

		return projectId;
	},
});
