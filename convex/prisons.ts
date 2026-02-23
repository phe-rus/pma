import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { prisonSchema, vPrisonType } from "./schema";

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("prisons").collect();
    },
});

export const getById = query({
    args: { id: v.id("prisons") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

export const getByCode = query({
    args: { code: v.string() },
    handler: async (ctx, { code }) => {
        return await ctx.db
            .query("prisons")
            .withIndex("byCode", (q) => q.eq("code", code))
            .unique();
    },
});

export const getByType = query({
    args: { type: vPrisonType },
    handler: async (ctx, { type }) => {
        return await ctx.db
            .query("prisons")
            .withIndex("byType", (q) => q.eq("type", type))
            .collect();
    },
});

export const getActive = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("prisons")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
    },
});

export const create = mutation({
    args: prisonSchema,
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("prisons")
            .withIndex("byCode", (q) => q.eq("code", args.code))
            .unique();
        if (existing) throw new Error(`Prison code "${args.code}" already exists.`);

        const id = await ctx.db.insert("prisons", { isActive: true, ...args });
        return await ctx.db.get(id);
    },
});

export const update = mutation({
    args: {
        id: v.id("prisons"),
        patch: v.object({
            name: v.optional(v.string()),
            type: v.optional(vPrisonType),
            region: v.optional(v.string()),
            district: v.optional(v.string()),
            address: v.optional(v.string()),
            capacity: v.optional(v.number()),
            contactPhone: v.optional(v.string()),
            isActive: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

export const remove = mutation({
    args: { id: v.id("prisons") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});