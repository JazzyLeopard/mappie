import { v } from "convex/values";
import { mutation, query } from './_generated/server';

export const create = mutation({
    args: {
        projectId: v.id('projects'),
        shareId: v.string(),
        status: v.boolean(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const { projectId, shareId, status, userId } = args;

        return await ctx.db.insert('sharing', {
            projectId,
            shareId,
            status,
            createdBy: userId,
            createdAt: BigInt(Date.now()),
            updatedAt: BigInt(Date.now()),
        });
    },
});

export const getProjectByShareId = query({
    args: { shareId: v.string() },
    handler: async (ctx, args) => {
        // Find the share record
        const share = await ctx.db
            .query("sharing")
            .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
            .first();

        if (!share || share.status !== true) {
            throw new Error("Share link not found or inactive");
        }

        // Get project details
        const project = await ctx.db.get(share.projectId);
        if (!project) {
            throw new Error("Project not found");
        }

        // Get all epics with their user stories
        const epics = await ctx.db
            .query("epics")
            .filter((q) => q.eq(q.field("projectId"), share.projectId))
            .collect();

        // Get all user stories for each epic
        const epicsWithStories = await Promise.all(
            epics.map(async (epic) => {
                const userStories = await ctx.db
                    .query("userStories")
                    .filter((q) => q.eq(q.field("epicId"), epic._id))
                    .collect();

                return {
                    ...epic,
                    type: 'epic',
                    userStories: userStories.map(story => ({
                        ...story,
                        type: 'user-story'
                    }))
                };
            })
        );

        // Get all functional requirements
        const functionalRequirements = await ctx.db
            .query("functionalRequirements")
            .filter((q) => q.eq(q.field("projectId"), share.projectId))
            .collect();

        // Get all use cases
        const useCases = await ctx.db
            .query("useCases")
            .filter((q) => q.eq(q.field("projectId"), share.projectId))
            .collect();

        return {
            project: {
                _id: project._id,
                title: project.title,
                overview: project.overview,
                isArchived: project.isArchived,
                isPublished: project.isPublished,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            },
            epics: epicsWithStories,
            functionalRequirements: functionalRequirements.map(req => ({
                ...req,
                type: 'functional-requirement'
            })),
            useCases: useCases.map(useCase => ({
                ...useCase,
                type: 'use-case'
            })),
            metadata: {
                epicCount: epics.length,
                userStoryCount: epicsWithStories.reduce(
                    (acc, epic) => acc + epic.userStories.length,
                    0
                ),
                functionalRequirementCount: functionalRequirements.length,
                useCaseCount: useCases.length,
            }
        };
    },
});

export const getShareIdByProjectId = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const share = await ctx.db
            .query("sharing")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();

        return share;
    },
});