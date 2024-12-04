import { mutation, query } from "@/convex/_generated/server";
import { v } from "convex/values";

export const getSidebar = query(async (ctx) => {

  const identity = await ctx.auth.getUserIdentity();

  const projects = await ctx.db.query("projects")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), identity?.subject),
        q.eq(q.field("isArchived"), false),
      ),
    )
    .order("desc")
    .collect();

  const projectsWithEpicsAndUserStories = await Promise.all(
    projects.map(async (project) => {
      const epics = await ctx.db.query("epics")
        .filter((q) => q.eq(q.field("projectId"), project._id))

        .order("desc")
        .collect();

      const epicsWithUserStories = await Promise.all(
        epics.map(async (epic) => {
          const userStories = await ctx.db.query("userStories")
            .filter((q) => q.eq(q.field("epicId"), epic._id))

            .order("desc")
            .collect();

          userStories.map(us => { return { ...us, type: 'user-story' } })
          return {
            _id: epic._id,
            name: epic.name,
            type: 'epic',
            userStories,
          };
        })
      );

      return {
        _id: project._id,
        title: project.title,
        type: 'project',
        epics: epicsWithUserStories,
      };
    })
  );

  return projectsWithEpicsAndUserStories;
});

export const getFirstProjectId = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not Authenticated");
    }

    const project = await ctx.db
      .query("projects")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity?.subject),
          q.eq(q.field("isArchived"), false),
        ),
      ).first();

    return project?._id;
  },
});

export const getProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not Authenticated");
    }

    const projects = await ctx.db
      .query("projects")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity?.subject),
          q.eq(q.field("isArchived"), false),
        ),
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
        q.and(
          q.eq(q.field("userId"), identity?.subject),
          q.eq(q.field("_id"), projectId),
        ),
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

    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    return project.title;
  },
});

export const createProject = mutation({
  args: {
    title: v.string(),
    overview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not Authenticated");
    }

    const userId = identity.subject;

    const project = await ctx.db.insert("projects", {
      title: args.title,
      userId,
      overview: args.overview || "",
      isArchived: false,
      isPublished: false,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    });

    return project;
  },
});

export const updateProject = mutation({
  args: {
    _id: v.id("projects"),
    isArchived: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    overview: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { _id, ...updates } = args;

    return await ctx.db.patch(_id, {
      ...updates,
      updatedAt: BigInt(Date.now())
    });
  }
});

export const archiveProject = mutation({
  args: {
    _id: v.id("projects"),
    isArchived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { _id, isArchived } = args;

    await ctx.db.patch(_id, {
      isArchived: isArchived,
      updatedAt: BigInt(Date.now()),
    });
  },
});