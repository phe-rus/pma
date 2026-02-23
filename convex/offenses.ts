import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { offenseSchema, vOffenseCategory } from "./schema";

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("offenses").collect();
    },
});

export const getById = query({
    args: { id: v.id("offenses") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

export const getByCategory = query({
    args: { category: vOffenseCategory },
    handler: async (ctx, { category }) => {
        return await ctx.db
            .query("offenses")
            .withIndex("byCategory", (q) => q.eq("category", category))
            .collect();
    },
});

export const create = mutation({
    args: offenseSchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("offenses", args);
        return await ctx.db.get(id);
    },
});

export const update = mutation({
    args: {
        id: v.id("offenses"),
        patch: v.object({
            name: v.optional(v.string()),
            act: v.optional(v.string()),
            section: v.optional(v.string()),
            chapter: v.optional(v.string()),
            category: v.optional(vOffenseCategory),
            amendedBy: v.optional(v.string()),
            description: v.optional(v.string()),
            maxSentenceYears: v.optional(v.number()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

export const remove = mutation({
    args: { id: v.id("offenses") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});