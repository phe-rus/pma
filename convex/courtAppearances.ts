import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { courtAppearanceSchema, courtSchema, vCourtOutcome, vCourtType } from "./schema";

// ─── Courts ───────────────────────────────────────────────────────────────────

export const getAllCourts = query({
    handler: async (ctx) => {
        return await ctx.db.query("courts").collect();
    },
});

export const getCourtById = query({
    args: { id: v.id("courts") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

export const createCourt = mutation({
    args: courtSchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("courts", args);
        return await ctx.db.get(id);
    },
});

export const updateCourt = mutation({
    args: {
        id: v.id("courts"),
        patch: v.object({
            name: v.optional(v.string()),
            type: v.optional(vCourtType),
            district: v.optional(v.string()),
            address: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

// ─── Court Appearances ────────────────────────────────────────────────────────

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("courtAppearances").collect();
    },
});

export const getById = query({
    args: { id: v.id("courtAppearances") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

export const getByInmate = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) => {
        return await ctx.db
            .query("courtAppearances")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect();
    },
});

export const getUpcoming = query({
    args: { fromDate: v.string() },
    handler: async (ctx, { fromDate }) => {
        return await ctx.db
            .query("courtAppearances")
            .withIndex("byScheduledDate", (q) => q.gte("scheduledDate", fromDate))
            .collect();
    },
});

export const create = mutation({
    args: courtAppearanceSchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("courtAppearances", args);
        // Update inmate's nextCourtDate
        await ctx.db.patch(args.inmateId, { nextCourtDate: args.scheduledDate });
        return await ctx.db.get(id);
    },
});

export const recordOutcome = mutation({
    args: {
        id: v.id("courtAppearances"),
        outcome: vCourtOutcome,
        returnTime: v.optional(v.string()),
        nextDate: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, outcome, returnTime, nextDate, notes }) => {
        const appearance = await ctx.db.get(id);
        if (!appearance) throw new Error("Court appearance not found.");

        await ctx.db.patch(id, { outcome, returnTime, nextDate, notes });

        // Update inmate status and next court date
        const statusPatch: Record<string, string> = {};
        if (nextDate) statusPatch.nextCourtDate = nextDate;
        if (outcome === "convicted") statusPatch.status = "convict";
        else if (outcome === "acquitted") statusPatch.status = "released";
        else statusPatch.status = "remand";

        await ctx.db.patch(appearance.inmateId, statusPatch);
        return await ctx.db.get(id);
    },
});

export const update = mutation({
    args: {
        id: v.id("courtAppearances"),
        patch: v.object({
            scheduledDate: v.optional(v.string()),
            departureTime: v.optional(v.string()),
            returnTime: v.optional(v.string()),
            outcome: v.optional(vCourtOutcome),
            nextDate: v.optional(v.string()),
            officerId: v.optional(v.id("officers")),
            notes: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

export const remove = mutation({
    args: { id: v.id("courtAppearances") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});