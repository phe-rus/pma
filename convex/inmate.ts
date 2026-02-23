import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { inmateSchema, vInmateStatus, vRiskLevel, vInmateType } from "./schema";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("inmates").collect();
    },
});

export const getById = query({
    args: { id: v.id("inmates") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    },
});

export const getByPrisonNumber = query({
    args: { prisonNumber: v.string() },
    handler: async (ctx, { prisonNumber }) => {
        return await ctx.db
            .query("inmates")
            .withIndex("byPrisonNumber", (q) => q.eq("prisonNumber", prisonNumber))
            .unique();
    },
});

export const getByPrison = query({
    args: { prisonId: v.id("prisons") },
    handler: async (ctx, { prisonId }) => {
        return await ctx.db
            .query("inmates")
            .withIndex("byPrisonId", (q) => q.eq("prisonId", prisonId))
            .collect();
    },
});

export const getByStatus = query({
    args: { status: vInmateStatus },
    handler: async (ctx, { status }) => {
        return await ctx.db
            .query("inmates")
            .withIndex("byStatus", (q) => q.eq("status", status))
            .collect();
    },
});

export const getByType = query({
    args: { inmateType: vInmateType },
    handler: async (ctx, { inmateType }) => {
        return await ctx.db
            .query("inmates")
            .withIndex("byInmateType", (q) => q.eq("inmateType", inmateType))
            .collect();
    },
});

export const getByNationalId = query({
    args: { nationalId: v.string() },
    handler: async (ctx, { nationalId }) => {
        return await ctx.db
            .query("inmates")
            .withIndex("byNationalId", (q) => q.eq("nationalId", nationalId))
            .first();
    },
});

export const search = query({
    args: {
        prisonId: v.optional(v.id("prisons")),
        status: v.optional(vInmateStatus),
        inmateType: v.optional(vInmateType),
        riskLevel: v.optional(vRiskLevel),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("inmates");

        if (args.prisonId) {
            return await q
                .withIndex("byPrisonId", (qi) => qi.eq("prisonId", args.prisonId!))
                .filter((qi) => {
                    let f = qi.eq(qi.field("_id"), qi.field("_id")); // always true base
                    if (args.status) f = qi.and(f, qi.eq(qi.field("status"), args.status));
                    if (args.inmateType) f = qi.and(f, qi.eq(qi.field("inmateType"), args.inmateType));
                    if (args.riskLevel) f = qi.and(f, qi.eq(qi.field("riskLevel"), args.riskLevel));
                    return f;
                })
                .collect();
        }

        if (args.status) {
            return await q
                .withIndex("byStatus", (qi) => qi.eq("status", args.status!))
                .collect();
        }

        return await q.collect();
    },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

export const create = mutation({
    args: inmateSchema,
    handler: async (ctx, args) => {
        // Ensure prisonNumber is unique
        const existing = await ctx.db
            .query("inmates")
            .withIndex("byPrisonNumber", (q) => q.eq("prisonNumber", args.prisonNumber))
            .unique();
        if (existing) throw new Error(`Prison number "${args.prisonNumber}" already exists.`);

        const id = await ctx.db.insert("inmates", args);
        return await ctx.db.get(id);
    },
});

export const update = mutation({
    args: {
        id: v.id("inmates"),
        patch: v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
            otherNames: v.optional(v.string()),
            nationalId: v.optional(v.string()),
            dob: v.optional(v.string()),
            tribe: v.optional(v.string()),
            religion: v.optional(v.string()),
            educationLevel: v.optional(v.string()),
            maritalStatus: v.optional(v.string()),
            occupation: v.optional(v.string()),
            nextOfKinName: v.optional(v.string()),
            nextOfKinPhone: v.optional(v.string()),
            nextOfKinRelationship: v.optional(v.string()),
            status: v.optional(vInmateStatus),
            riskLevel: v.optional(vRiskLevel),
            prisonId: v.optional(v.id("prisons")),
            cellBlock: v.optional(v.string()),
            cellNumber: v.optional(v.string()),
            remandExpiry: v.optional(v.string()),
            nextCourtDate: v.optional(v.string()),
            convictionDate: v.optional(v.string()),
            sentenceStart: v.optional(v.string()),
            sentenceEnd: v.optional(v.string()),
            sentenceDuration: v.optional(v.string()),
            isLifeSentence: v.optional(v.boolean()),
            fineAmount: v.optional(v.number()),
            finePaid: v.optional(v.boolean()),
            actualReleaseDate: v.optional(v.string()),
            releaseReason: v.optional(v.union(
                v.literal("served"), v.literal("bail"), v.literal("acquitted"),
                v.literal("pardon"), v.literal("fine_paid")
            )),
            notes: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("inmates"),
        status: vInmateStatus,
    },
    handler: async (ctx, { id, status }) => {
        await ctx.db.patch(id, { status });
        return await ctx.db.get(id);
    },
});

export const release = mutation({
    args: {
        id: v.id("inmates"),
        actualReleaseDate: v.string(),
        releaseReason: v.union(
            v.literal("served"), v.literal("bail"), v.literal("acquitted"),
            v.literal("pardon"), v.literal("fine_paid")
        ),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, actualReleaseDate, releaseReason, notes }) => {
        await ctx.db.patch(id, {
            status: "released",
            actualReleaseDate,
            releaseReason,
            ...(notes ? { notes } : {}),
        });
        return await ctx.db.get(id);
    },
});

export const remove = mutation({
    args: { id: v.id("inmates") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});