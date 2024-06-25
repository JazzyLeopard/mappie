import {
	mutation,
	query,
} from "@/convex/_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import projects from "@/pages/api/projects";
import { describe } from "node:test";

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


export const getProjectById = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, { projectId }) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new Error("Not Authenticated");
		}

		if (!projectId) {
			throw new Error("Project ID is required");
		}

		const project = await ctx.db
			.query("projects")
			.filter((q) =>
				q.and(q.eq(q.field("userId"), identity?.subject), q.eq(q.field("_id"), projectId))
			)
			.first();

		if (!project) {
			throw new Error("Project not found");
		}

		return project;
	},
});

export const getProjectNameById = query({
	args: { projectId: v.id("projects") },
	handler: async (ctx, { projectId }) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new Error("Not Authenticated");
		}

		if (!projectId) {
			throw new Error("Project ID is required");
		}

		const project = await ctx.db.get(projectId)
		// .query("projects")
		// .filter((q) =>
		// 	q.and(q.eq(q.field("userId"), identity?.subject), q.eq(q.field("_id"), projectId))
		// )
		// .();

		if (!project) {
			throw new Error("Project not found");
		}

		return project.title;
	},
})


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
			description: '',
			objectives: '',
			isArchived: false,
			createdAt: BigInt(Date.now()), // Use BigInt for timestamps
			updatedAt: BigInt(Date.now()), // Use BigInt for timestamps
		});

		return project;
	},
});

export const updateProject = mutation({
	args: {
		_id: v.id("projects"),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		objectives: v.optional(v.string()),
		stakeholders: v.optional(v.string()),
		scope: v.optional(v.string()),
		targetAudience: v.optional(v.string()),
		constraints: v.optional(v.string()),
		budget: v.optional(v.string()),
		dependencies: v.optional(v.string()),
		priorities: v.optional(v.string()),
		risks: v.optional(v.string()),
		isArchived: v.optional(v.boolean()),
		isPublished: v.optional(v.boolean()),

	},
	handler: async (ctx, args) => {
		const { _id, ...updates } = args;

		await ctx.db.patch(_id, { ...updates, updatedAt: BigInt(Date.now()) });
	},
});

export const archiveProject = mutation({
	args: {
		_id: v.id("projects"),
		isArchived: v.boolean()
	},
	handler: async (ctx, args) => {
		const { _id, isArchived } = args;

		await ctx.db.patch(_id, { isArchived: isArchived, updatedAt: BigInt(Date.now()) });
	},
})