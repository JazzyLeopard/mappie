import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx: any) => {
    return await ctx.storage.generateUploadUrl();
});

export const getStorageById = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.db.system.query("_storage")
            .filter((q: any) => q.eq(q.field("_id"), args.storageId))
            .first();
    },
});

export const getStorageURL = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const url = await ctx.storage.getUrl(args.storageId);
        if (!url) {
            return null;
        }
        return url;
    },
});

export const getUploadedImageById = query({
    args: {
        projectId: v.id("projects"),
        itemId: v.string(),
        itemType: v.string()
    },
    handler: async (ctx, args) => {
        const images = await ctx.db
            .query("imageUpload")
            .filter((q) => q.eq(q.field("projectId"), args.projectId))
            .filter((q) => q.eq(q.field("itemId"), args.itemId))
            .filter((q) => q.eq(q.field("itemType"), args.itemType))
            .collect();

        // Get URLs for all images
        const imagesWithUrls = await Promise.all(
            images.map(async (image) => ({
                ...image,
                url: await ctx.storage.getUrl(image.imageStorageId)
            }))
        );

        return imagesWithUrls;
    }
});

export const deleteImage = mutation({
    args: {
        imageId: v.id("imageUpload"),
    },
    handler: async (ctx: any, args: any) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not Authenticated");
        }

        const image = await ctx.db.get(args.imageId);

        if (!image) {
            throw new Error("Image not found");
        }
        await ctx.db.delete(args.imageId);

        if (image.imageStorageId) {
            await ctx.storage.delete(image.imageStorageId);
        }
    },
});

export const saveContent = mutation({
    args: {
        projectId: v.id("projects"),
        imageStorageId: v.id("_storage"),
        content: v.string(),
        itemType: v.string(),
        itemId: v.string(),
        filename: v.string(),
    },
    handler: async (ctx, args) => {
        // Verify user authentication
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Insert into imageUpload table
        const imageUpload = await ctx.db.insert("imageUpload", {
            projectId: args.projectId,
            imageStorageId: args.imageStorageId,
            content: args.content,
            itemType: args.itemType,
            itemId: args.itemId,
            filename: args.filename,
            createdAt: BigInt(Date.now()),
            updatedAt: BigInt(Date.now())
        });

        return imageUpload;
    }
});