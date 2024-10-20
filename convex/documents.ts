
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const getStorageById = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.db.system.query("_storage")
            .filter((q) => q.eq(q.field("_id"), args.storageId))
            .first();
    },
});

export const getStorageURL = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId)
    },
});

export const getDocumentById = query({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const document = await ctx.db
            .query("documents")
            .filter((q) => q.eq(q.field("projectId"), args.projectId))
            .first();

        return document
    },
});

export const deleteDocument = mutation({
    args: {
        documentId: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        const document = await ctx.db.get(args.documentId);

        if (!document) {
            throw new Error("Document not found");
        }

        await ctx.db.delete(args.documentId);

        if (document.storageId) {
            await ctx.storage.delete(document.storageId);
        }
    },
});

export const saveDocument = mutation({
    args: {
        projectId: v.id("projects"),
        storageId: v.id("_storage"),
        summarizedContent: v.string(),
        filename: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        const document = await ctx.db.insert("documents", {
            projectId: args.projectId,
            storageId: args.storageId,
            summarizedContent: args.summarizedContent,
            filename: args.filename || "",
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
            .filter((q) => q.eq(q.field("projectId"), args.projectId),
            )
            ?.collect();

        return documents;
    },
});
