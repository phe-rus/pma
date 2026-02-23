import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { officerSchema } from "./schema";

export const getAll = query({
    handler: async (ctx) => ctx.db.query("officers").collect(),
});

export const getById = query({
    args: { id: v.id("officers") },
    handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getByBadgeNumber = query({
    args: { badgeNumber: v.string() },
    handler: async (ctx, { badgeNumber }) =>
        ctx.db
            .query("officers")
            .withIndex("byBadgeNumber", (q) => q.eq("badgeNumber", badgeNumber))
            .unique(),
});

export const getByPrison = query({
    args: { prisonId: v.id("prisons") },
    handler: async (ctx, { prisonId }) =>
        ctx.db
            .query("officers")
            .withIndex("byPrisonId", (q) => q.eq("prisonId", prisonId))
            .collect(),
});

export const getActive = query({
    handler: async (ctx) =>
        ctx.db
            .query("officers")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect(),
});

// ─── Officer with biometrics + attendance summary ─────────────────────────────

export const getWithBiometricsSummary = query({
    args: { id: v.id("officers") },
    handler: async (ctx, { id }) => {
        const officer = await ctx.db.get(id);
        if (!officer) return null;

        const today = new Date().toISOString().split("T")[0];

        const [photos, fingerprints, todayAttendance] = await Promise.all([
            ctx.db.query("photoBucket")
                .withIndex("byOfficerId", (q) => q.eq("officerId", id))
                .collect(),
            ctx.db.query("fingerPrints")
                .withIndex("byOfficerId", (q) => q.eq("officerId", id))
                .collect(),
            ctx.db.query("officerAttendance")
                .withIndex("byOfficerDate", (q) => q.eq("officerId", id).eq("date", today))
                .collect(),
        ]);

        return {
            ...officer,
            photoCount: photos.length,
            confirmedPhotoCount: photos.filter((p) => p.isConfirmed).length,
            primaryPhoto: photos.find((p) => p.isPrimary) ?? photos[0] ?? null,
            fingerprintCount: fingerprints.length,
            confirmedFpCount: fingerprints.filter((f) => f.isConfirmed).length,
            capturedFingers: fingerprints.map((f) => f.finger),
            todayAttendance,
        };
    },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

export const create = mutation({
    args: officerSchema,
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("officers")
            .withIndex("byBadgeNumber", (q) => q.eq("badgeNumber", args.badgeNumber))
            .unique();
        if (existing)
            throw new Error(`Badge number "${args.badgeNumber}" already exists.`);

        const id = await ctx.db.insert("officers", { isActive: true, ...args });
        return ctx.db.get(id);
    },
});

export const update = mutation({
    args: {
        id: v.id("officers"),
        patch: v.object({
            prisonId: v.optional(v.id("prisons")),
            name: v.optional(v.string()),
            rank: v.optional(v.string()),
            phone: v.optional(v.string()),
            isActive: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return ctx.db.get(id);
    },
});

export const remove = mutation({
    args: { id: v.id("officers") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});