import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx: any) => {
    return await ctx.storage.generateUploadUrl();
});

export const getStorageById = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx: any, args: any) => {
        return await ctx.db.system.query("_storage")
            .filter((q: any) => q.eq(q.field("_id"), args.storageId))
            .first();
    },
});

export const getStorageURL = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx: any, args: any) => {
        return await ctx.storage.getUrl(args.storageId)
    },
});

export const getDocumentById = query({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx: any, args: any) => {
        const document = await ctx.db
            .query("documents")
            .filter((q: any) => q.eq(q.field("projectId"), args.projectId))
            .first();

        return document
    },
});

export const deleteDocument = mutation({
    args: {
        documentId: v.id("documents"),
        summaryId: v.id("_storage"),
    },
    handler: async (ctx: any, args: any) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        const document = await ctx.db.get(args.documentId);
        const summary = await ctx.db.get(args.summaryId);

        if (!document) {
            throw new Error("Document not found");
        }

        await ctx.db.delete(args.documentId);
        await ctx.db.delete(args.summaryId);

        if (document.storageId) {
            await ctx.storage.delete(document.storageId);
        }

        if (summary.storageId) {
            await ctx.storage.delete(summary.storageId);
        }
    },
});

export const saveDocument = mutation({
    args: {
        projectId: v.id("projects"),
        storageId: v.id("_storage"),
        summaryId: v.id("_storage"),
        size: v.number(),
        filename: v.optional(v.string()),
    },
    handler: async (ctx: any, args: any) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        const document = await ctx.db.insert("documents", {
            projectId: args.projectId,
            storageId: args.storageId,
            summaryId: args.summaryId,
            filename: args.filename || "",
            size: args.size,
            createdAt: BigInt(Date.now()),
            updatedAt: BigInt(Date.now()),
        });

        return document;
    },
});

export const getDocuments = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const documents = await ctx.db
            .query("documents")
            .filter((q) => q.eq(q.field("projectId"), args.projectId))
            .collect();

        return Promise.all(
            documents.map(async (document) => ({
                ...document,
                url: document.storageId ? await ctx.storage.getUrl(document.storageId) : undefined,
                // summaryUrl: document.summaryId ? await ctx.storage.getUrl(document.summaryId) : undefined
            }))
        );
    },
});
