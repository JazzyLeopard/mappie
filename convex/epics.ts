import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const createUserStory = mutation({
  args: {
    epicId: v.id("epics"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
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
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("epics")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});

export const updateEpic = mutation({
  args: {
    _id: v.id("epics"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { _id, ...updates } = args;
    const updatedFields = {
      ...updates,
      updatedAt: BigInt(Date.now()),
    };
    await ctx.db.patch(_id, updatedFields);
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
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not Authenticated");
    }

    const userId = identity.subject;

    const epic = await ctx.db.insert("epics", {
      name: args.name,
      description: "",
      projectId: args.projectId,
      createdAt: BigInt(Date.now()), // Use BigInt for timestamps
      updatedAt: BigInt(Date.now()),
    });

    return epic;
  },
})
