import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { recordMovementSchema, vMovementType } from "./schema";

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("recordMovements").collect();
    },
});

export const getById = query({
    args: { id: v.id("recordMovements") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

export const getByInmate = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) => {
        return await ctx.db
            .query("recordMovements")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect();
    },
});

export const getByType = query({
    args: { movementType: vMovementType },
    handler: async (ctx, { movementType }) => {
        return await ctx.db
            .query("recordMovements")
            .withIndex("byMovementType", (q) => q.eq("movementType", movementType))
            .collect();
    },
});

/** Get all movements that haven't returned yet (open movements) */
export const getOpenMovements = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("recordMovements")
            .filter((q) => q.eq(q.field("returnDate"), undefined))
            .collect();
    },
});

export const create = mutation({
    args: recordMovementSchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("recordMovements", args);

        // Update inmate status based on movement type
        const statusMap: Record<string, string> = {
            transfer: "transferred",
            hospital: "remand",     // still in system, just at hospital
            court: "at_court",
            work_party: "remand",
            release: "released",
        };
        const newStatus = statusMap[args.movementType];
        if (newStatus) {
            await ctx.db.patch(args.inmateId, { status: newStatus as any });
        }

        // If transfer, update prisonId
        if (args.movementType === "transfer" && args.toPrisonId) {
            await ctx.db.patch(args.inmateId, { prisonId: args.toPrisonId });
        }

        return await ctx.db.get(id);
    },
});

export const recordReturn = mutation({
    args: {
        id: v.id("recordMovements"),
        returnDate: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, returnDate, notes }) => {
        const movement = await ctx.db.get(id);
        if (!movement) throw new Error("Movement not found.");

        await ctx.db.patch(id, { returnDate, ...(notes ? { notes } : {}) });

        // Restore inmate to remand/convict — caller should update status separately
        // or optionally pass in desired status here
        return await ctx.db.get(id);
    },
});

export const update = mutation({
    args: {
        id: v.id("recordMovements"),
        patch: v.object({
            destination: v.optional(v.string()),
            departureDate: v.optional(v.string()),
            returnDate: v.optional(v.string()),
            reason: v.optional(v.string()),
            notes: v.optional(v.string()),
            officerId: v.optional(v.id("officers")),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

export const remove = mutation({
    args: { id: v.id("recordMovements") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});