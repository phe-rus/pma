import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
    medicalRecordSchema,
    itemsInCustodySchema,
    inmateChargesSchema,
    vMedicalRecordType,
    vChargeStatus,
    vItemCondition,
} from "./schema";

export const getAllMedical = query({
    handler: async (ctx) => ctx.db.query("medicalRecords").collect(),
});

export const getMedicalById = query({
    args: { id: v.id("medicalRecords") },
    handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getMedicalByInmate = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) =>
        ctx.db
            .query("medicalRecords")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect(),
});

export const getMedicalByType = query({
    args: { recordType: vMedicalRecordType },
    handler: async (ctx, { recordType }) =>
        ctx.db
            .query("medicalRecords")
            .withIndex("byRecordType", (q) => q.eq("recordType", recordType))
            .collect(),
});

export const createMedicalRecord = mutation({
    args: medicalRecordSchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("medicalRecords", args);
        return ctx.db.get(id);
    },
});

export const updateMedicalRecord = mutation({
    args: {
        id: v.id("medicalRecords"),
        patch: v.object({
            diagnosis: v.optional(v.string()),
            treatment: v.optional(v.string()),
            attendedBy: v.optional(v.string()),
            referredToHospital: v.optional(v.string()),
            notes: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return ctx.db.get(id);
    },
});

export const deleteMedicalRecord = mutation({
    args: { id: v.id("medicalRecords") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});

// ════════════════════════════════════════════════════════════════════════════
// ITEMS IN CUSTODY
// ════════════════════════════════════════════════════════════════════════════

export const getAllItems = query({
    handler: async (ctx) => ctx.db.query("itemsInCustody").collect(),
});

export const getItemById = query({
    args: { id: v.id("itemsInCustody") },
    handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getItemsByInmate = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) =>
        ctx.db
            .query("itemsInCustody")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect(),
});

export const getUnreturnedItems = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) =>
        ctx.db
            .query("itemsInCustody")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .filter((q) => q.eq(q.field("returnedAt"), undefined))
            .collect(),
});

export const createItem = mutation({
    args: itemsInCustodySchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("itemsInCustody", args);
        return ctx.db.get(id);
    },
});

export const returnItem = mutation({
    args: {
        id: v.id("itemsInCustody"),
        returnedAt: v.string(),
        returnedToName: v.string(),
    },
    handler: async (ctx, { id, returnedAt, returnedToName }) => {
        await ctx.db.patch(id, { returnedAt, returnedToName });
        return ctx.db.get(id);
    },
});

export const updateItem = mutation({
    args: {
        id: v.id("itemsInCustody"),
        patch: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            value: v.optional(v.number()),
            condition: v.optional(vItemCondition),
            storageLocation: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return ctx.db.get(id);
    },
});

export const deleteItem = mutation({
    args: { id: v.id("itemsInCustody") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});

// ════════════════════════════════════════════════════════════════════════════
// INMATE CHARGES
// ════════════════════════════════════════════════════════════════════════════

export const getAllCharges = query({
    handler: async (ctx) => ctx.db.query("inmateCharges").collect(),
});

export const getChargeById = query({
    args: { id: v.id("inmateCharges") },
    handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getChargesByInmate = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) =>
        ctx.db
            .query("inmateCharges")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect(),
});

export const createCharge = mutation({
    args: inmateChargesSchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("inmateCharges", args);
        return ctx.db.get(id);
    },
});

export const updateChargeStatus = mutation({
    args: {
        id: v.id("inmateCharges"),
        status: vChargeStatus,
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, status, notes }) => {
        await ctx.db.patch(id, { status, ...(notes ? { notes } : {}) });
        return ctx.db.get(id);
    },
});

export const deleteCharge = mutation({
    args: { id: v.id("inmateCharges") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});