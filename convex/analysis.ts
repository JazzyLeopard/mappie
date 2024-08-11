import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api"


export const getAnalysisByProjectId = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, { projectId }) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        if (!projectId) {
            throw new Error("Project ID is required");
        }
        let analysis = await ctx.db
            .query("analysis")
            .filter((q) => q.eq(q.field("projectId"), projectId))
            .first();
        return analysis;

    },
});

export const createAnalysis = mutation({
    args: {
        projectId: v.id("projects"),
        functionalRequirements: v.string(),
        useCase: v.string(),
    },
    handler: async (ctx, args) => {
        const { projectId, functionalRequirements, useCase } = args;

        await ctx.db.insert("analysis", {
            projectId: projectId,
            functionalRequirements: functionalRequirements,
            useCase: useCase,
            createdAt: BigInt(Date.now()), // Use BigInt for timestamps
            updatedAt: BigInt(Date.now()), // Use BigInt for timestamps
        });
    },

})

export const updateAnalysis = mutation({
    args: {
        _id: v.id("analysis"),
        functionalRequirements: v.optional(v.string()),
        useCase: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { _id, ...updates } = args;

        await ctx.db.patch(_id, { ...updates, updatedAt: BigInt(Date.now()) });
    },
});
