import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createUserStory = mutation({
  args: {
    epicId: v.id("epics"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const userStoryId = await ctx.db.insert("userStories", {
      epicId: args.epicId,
      title: args.title,
      description: args.description,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });

    return userStoryId;
  },
});

export const getEpicById = query({
  args: { epicId: v.id("epics") },
  handler: async (ctx: any, { epicId }: any) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not Authenticated");
    }

    if (!epicId) {
      throw new Error("Epic ID is required");
    }

    const epic = await ctx.db
      .query("epics")
      .filter((q: any) => q.eq(q.field("_id"), epicId))
      .first();

    if (!epic) {
      throw new Error("Epic not found");
    }

    return {
      ...epic,
      projectId: epic.projectId // Ensure projectId is included in the response
    };
  },
});

export const getEpics = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("epics")
      .filter((q: any) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});

export const updateEpic = mutation({
  args: {
    _id: v.id("epics"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { _id, ...updates } = args;
    const updatedFields = {
      ...updates,
      updatedAt: BigInt(Date.now()),
    };
    await ctx.db.patch(_id, updatedFields);
  },
});

export const deleteEpic = mutation({
  args: { _id: v.id("epics") },
  handler: async (ctx: any, args: any) => {
    const { _id } = args;
    await ctx.db.delete(_id);
  },
});

export const createEpics = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not Authenticated");

    const epic = await ctx.db.insert("epics", {
      name: args.name,
      description: args.description,
      projectId: args.projectId,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });

    return epic;
  },
});
