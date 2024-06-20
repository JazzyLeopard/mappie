import {
	mutation,
	query,
} from "@/convex/_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import projects from "@/pages/api/projects";

export const getProjects = query({
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new Error("Not Authenticated");
		}

		const projects = await ctx.db
			.query("projects")
			.filter((q) =>
				q.eq(q.field("userId"), identity?.subject)
			)
			?.collect();

		return projects;
	},
});

export const createProject = mutation({
	args: {
		title: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new Error("Not Authenticated");
		}

		const project = await ctx.db.insert("projects", {
			title: args.title,
			userId: identity.subject,
			isArchived: false,
			createdAt: BigInt(Date.now()), // Use BigInt for timestamps
			updatedAt: BigInt(Date.now()), // Use BigInt for timestamps
		});

		return project;
	},
});
