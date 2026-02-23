import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { inmateVisitsSchema, vVisitStatus } from "./schema";

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("inmateVisits").collect();
    },
});

export const getById = query({
    args: { id: v.id("inmateVisits") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

export const getByInmate = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) => {
        return await ctx.db
            .query("inmateVisits")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect();
    },
});

export const getByStatus = query({
    args: { status: vVisitStatus },
    handler: async (ctx, { status }) => {
        return await ctx.db
            .query("inmateVisits")
            .withIndex("byStatus", (q) => q.eq("status", status))
            .collect();
    },
});

/** Returns all visitors currently inside (checked_in but not checked_out) */
export const getVisitorsInside = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("inmateVisits")
            .withIndex("byStatus", (q) => q.eq("status", "checked_in"))
            .collect();
    },
});

export const getByPrison = query({
    args: { prisonId: v.id("prisons") },
    handler: async (ctx, { prisonId }) => {
        return await ctx.db
            .query("inmateVisits")
            .withIndex("byPrisonId", (q) => q.eq("prisonId", prisonId))
            .collect();
    },
});

export const schedule = mutation({
    args: inmateVisitsSchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("inmateVisits", {
            // @ts-ignore
            status: "scheduled",
            ...args,
        });
        return await ctx.db.get(id);
    },
});

export const checkIn = mutation({
    args: {
        id: v.id("inmateVisits"),
        checkInTime: v.string(),
        approvedById: v.optional(v.id("officers")),
        itemsDeclaration: v.optional(v.string()),
    },
    handler: async (ctx, { id, checkInTime, approvedById, itemsDeclaration }) => {
        await ctx.db.patch(id, {
            status: "checked_in",
            checkInTime,
            ...(approvedById ? { approvedById } : {}),
            ...(itemsDeclaration ? { itemsDeclaration } : {}),
        });
        return await ctx.db.get(id);
    },
});

export const checkOut = mutation({
    args: {
        id: v.id("inmateVisits"),
        checkOutTime: v.string(),
        flagged: v.optional(v.boolean()),
        flagReason: v.optional(v.string()),
    },
    handler: async (ctx, { id, checkOutTime, flagged, flagReason }) => {
        await ctx.db.patch(id, {
            status: "completed",
            checkOutTime,
            ...(flagged !== undefined ? { flagged, flagReason } : {}),
        });
        return await ctx.db.get(id);
    },
});

export const deny = mutation({
    args: {
        id: v.id("inmateVisits"),
        denialReason: v.string(),
    },
    handler: async (ctx, { id, denialReason }) => {
        await ctx.db.patch(id, { status: "denied", denialReason });
        return await ctx.db.get(id);
    },
});

export const cancel = mutation({
    args: { id: v.id("inmateVisits") },
    handler: async (ctx, { id }) => {
        await ctx.db.patch(id, { status: "cancelled" });
        return await ctx.db.get(id);
    },
});

export const update = mutation({
    args: {
        id: v.id("inmateVisits"),
        patch: v.object({
            scheduledDate: v.optional(v.string()),
            reason: v.optional(v.string()),
            notes: v.optional(v.string()),
            flagged: v.optional(v.boolean()),
            flagReason: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

export const remove = mutation({
    args: { id: v.id("inmateVisits") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});