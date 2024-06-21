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


// export const getProjectById = query({
// 	handler: async (ctx) => {
// 		const identity = await ctx.auth.getUserIdentity();

// 		if (!identity) {
// 			throw new Error("Not Authenticated");
// 		}

// 		const { projectId } = ctx.params;

// 		const project = await ctx.db
// 			.query("projects")
// 			.filter((q) =>
// 				q.and(
// 					q.eq(q.field("userId"), identity?.subject),
// 					q.eq(q.field("_id"), projectId)
// 				)
// 			)
// 			?.first();

// 		if (!project) {
// 			throw new Error("Project not found");
// 		}

// 		return project;
// 	},
// });


// export const getProjectById = query({
// 	handler: async (ctx) => {
// 	  const identity = await ctx.auth.getUserIdentity();
  
// 	  if (!identity) {
// 		throw new Error("Not Authenticated");
// 	  }
  
// 	  const { projectId } = ctx.params;
  
// 	  if (!projectId) {
// 		throw new Error("Project ID is required");
// 	  }
  
// 	  const project = await ctx.db
// 		.query("projects")
// 		.filter((q) =>
// 		  q.and(
// 			q.eq(q.field("userId"), identity?.subject),
// 			q.eq(q.field("_id"), projectId)
// 		  )
// 		)
// 		.first();
  
// 	  if (!project) {
// 		throw new Error("Project not found");
// 	  }
  
// 	  return project;
// 	},
//   });
  
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
			description: args.description,
			objectives: args.objectives,
			isArchived: false,
			createdAt: BigInt(Date.now()), // Use BigInt for timestamps
			updatedAt: BigInt(Date.now()), // Use BigInt for timestamps
		});

		return project;
	},
});
