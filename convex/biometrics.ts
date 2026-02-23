import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
    photoBucketSchema,
    fingerPrintSchema,
    vPhotoType,
    vPhotoProvider,
    vFinger,
    vFingerprintProvider,
} from "./schema";

export const getPhotosByInmate = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) =>
        ctx.db.query("photoBucket")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect(),
});

export const getPhotosByOfficer = query({
    args: { officerId: v.id("officers") },
    handler: async (ctx, { officerId }) =>
        ctx.db.query("photoBucket")
            .withIndex("byOfficerId", (q) => q.eq("officerId", officerId))
            .collect(),
});

export const getPrimaryInmatePhoto = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) => {
        const all = await ctx.db.query("photoBucket")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect();
        return all.find((p) => p.isPrimary) ?? all[0] ?? null;
    },
});

export const getPrimaryOfficerPhoto = query({
    args: { officerId: v.id("officers") },
    handler: async (ctx, { officerId }) => {
        const all = await ctx.db.query("photoBucket")
            .withIndex("byOfficerId", (q) => q.eq("officerId", officerId))
            .collect();
        return all.find((p) => p.isPrimary) ?? all[0] ?? null;
    },
});

export const getUnconfirmedPhotos = query({
    handler: async (ctx) =>
        ctx.db.query("photoBucket")
            .filter((q) => q.eq(q.field("isConfirmed"), false))
            .collect(),
});

// ─── Add photo ────────────────────────────────────────────────────────────────

export const addPhoto = mutation({
    args: photoBucketSchema,
    handler: async (ctx, args) => {
        // Validate subject
        if (args.subjectType === "inmate" && !args.inmateId)
            throw new Error("inmateId required for inmate photo");
        if (args.subjectType === "officer" && !args.officerId)
            throw new Error("officerId required for officer photo");

        // Validate provider has required data
        if (args.provider === "internal" && !args.storageId)
            throw new Error("storageId required for internal provider");
        if (args.provider === "external_url" && !args.externalUrl)
            throw new Error("externalUrl required for external_url provider");
        if (args.provider === "upload" && !args.storageId && !args.base64Preview)
            throw new Error("storageId or base64Preview required for upload provider");

        // If marking as primary, demote existing primary for same subject
        if (args.isPrimary) {
            const existing = await (
                args.subjectType === "inmate"
                    ? ctx.db.query("photoBucket").withIndex("byInmateId", (q) => q.eq("inmateId", args.inmateId!)).collect()
                    : ctx.db.query("photoBucket").withIndex("byOfficerId", (q) => q.eq("officerId", args.officerId!)).collect()
            );
            for (const p of existing.filter((p) => p.isPrimary)) {
                await ctx.db.patch(p._id, { isPrimary: false });
            }
        }

        const id = await ctx.db.insert("photoBucket", {
            ...args,
            isConfirmed: args.isConfirmed ?? false,
            capturedAt: args.capturedAt ?? new Date().toISOString(),
        });
        return ctx.db.get(id);
    },
});

// ─── Confirm photo ────────────────────────────────────────────────────────────

export const confirmPhoto = mutation({
    args: {
        id: v.id("photoBucket"),
        confirmedById: v.id("officers"),
        confirmNotes: v.optional(v.string()),
    },
    handler: async (ctx, { id, confirmedById, confirmNotes }) => {
        await ctx.db.patch(id, {
            isConfirmed: true,
            confirmedById,
            confirmedAt: new Date().toISOString(),
            confirmNotes,
        });
        return ctx.db.get(id);
    },
});

export const rejectPhoto = mutation({
    args: {
        id: v.id("photoBucket"),
        confirmNotes: v.optional(v.string()),
    },
    handler: async (ctx, { id, confirmNotes }) => {
        await ctx.db.patch(id, {
            isConfirmed: false,
            confirmedAt: new Date().toISOString(),
            confirmNotes: confirmNotes ?? "Rejected",
        });
        return ctx.db.get(id);
    },
});

// ─── Set primary ──────────────────────────────────────────────────────────────

export const setPrimaryPhoto = mutation({
    args: { id: v.id("photoBucket") },
    handler: async (ctx, { id }) => {
        const photo = await ctx.db.get(id);
        if (!photo) throw new Error("Photo not found");

        const siblings = await (
            photo.subjectType === "inmate"
                ? ctx.db.query("photoBucket").withIndex("byInmateId", (q) => q.eq("inmateId", photo.inmateId!)).collect()
                : ctx.db.query("photoBucket").withIndex("byOfficerId", (q) => q.eq("officerId", photo.officerId!)).collect()
        );
        for (const p of siblings.filter((p) => p.isPrimary)) {
            await ctx.db.patch(p._id, { isPrimary: false });
        }
        await ctx.db.patch(id, { isPrimary: true });
        return ctx.db.get(id);
    },
});

// ─── Delete photo ─────────────────────────────────────────────────────────────

export const deletePhoto = mutation({
    args: { id: v.id("photoBucket") },
    handler: async (ctx, { id }) => {
        const photo = await ctx.db.get(id);
        if (!photo) throw new Error("Photo not found");
        if (photo.storageId) await ctx.storage.delete(photo.storageId);
        await ctx.db.delete(id);
        return { success: true };
    },
});

// ─── Generate upload URL ──────────────────────────────────────────────────────

export const generatePhotoUploadUrl = mutation({
    handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// FINGERPRINTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getFingerprintsByInmate = query({
    args: { inmateId: v.id("inmates") },
    handler: async (ctx, { inmateId }) =>
        ctx.db.query("fingerPrints")
            .withIndex("byInmateId", (q) => q.eq("inmateId", inmateId))
            .collect(),
});

export const getFingerprintsByOfficer = query({
    args: { officerId: v.id("officers") },
    handler: async (ctx, { officerId }) =>
        ctx.db.query("fingerPrints")
            .withIndex("byOfficerId", (q) => q.eq("officerId", officerId))
            .collect(),
});

export const getFingerprintByFinger = query({
    args: {
        subjectType: v.union(v.literal("inmate"), v.literal("officer")),
        inmateId: v.optional(v.id("inmates")),
        officerId: v.optional(v.id("officers")),
        finger: vFinger,
    },
    handler: async (ctx, { subjectType, inmateId, officerId, finger }) => {
        if (subjectType === "inmate" && inmateId) {
            return ctx.db.query("fingerPrints")
                .withIndex("byInmateFinger", (q) => q.eq("inmateId", inmateId).eq("finger", finger))
                .unique();
        }
        if (subjectType === "officer" && officerId) {
            return ctx.db.query("fingerPrints")
                .withIndex("byOfficerFinger", (q) => q.eq("officerId", officerId).eq("finger", finger))
                .unique();
        }
        return null;
    },
});

export const getUnconfirmedFingerprints = query({
    handler: async (ctx) =>
        ctx.db.query("fingerPrints")
            .filter((q) => q.eq(q.field("isConfirmed"), false))
            .collect(),
});

// ─── Add / upsert fingerprint ─────────────────────────────────────────────────

export const addFingerprint = mutation({
    args: fingerPrintSchema,
    handler: async (ctx, args) => {
        if (args.subjectType === "inmate" && !args.inmateId)
            throw new Error("inmateId required for inmate fingerprint");
        if (args.subjectType === "officer" && !args.officerId)
            throw new Error("officerId required for officer fingerprint");

        if (args.provider === "internal" && !args.storageId)
            throw new Error("storageId required for internal provider");
        if (args.provider === "external" && !args.templateData && !args.providerRef)
            throw new Error("templateData or providerRef required for external provider");

        // Upsert: replace existing record for same subject + finger
        const existing = args.subjectType === "inmate" && args.inmateId
            ? await ctx.db.query("fingerPrints")
                .withIndex("byInmateFinger", (q) => q.eq("inmateId", args.inmateId!).eq("finger", args.finger))
                .unique()
            : args.subjectType === "officer" && args.officerId
                ? await ctx.db.query("fingerPrints")
                    .withIndex("byOfficerFinger", (q) => q.eq("officerId", args.officerId!).eq("finger", args.finger))
                    .unique()
                : null;

        if (existing) {
            // Remove old storage file if replacing with a new one
            if (existing.storageId && args.storageId && existing.storageId !== args.storageId) {
                await ctx.storage.delete(existing.storageId);
            }
            await ctx.db.patch(existing._id, {
                ...args,
                isConfirmed: false, // reset confirmation on re-capture
                capturedAt: args.capturedAt ?? new Date().toISOString(),
            });
            return ctx.db.get(existing._id);
        }

        const id = await ctx.db.insert("fingerPrints", {
            ...args,
            isConfirmed: false,
            capturedAt: args.capturedAt ?? new Date().toISOString(),
        });
        return ctx.db.get(id);
    },
});

// ─── Confirm fingerprint ──────────────────────────────────────────────────────

export const confirmFingerprint = mutation({
    args: {
        id: v.id("fingerPrints"),
        confirmedById: v.id("officers"),
        confirmNotes: v.optional(v.string()),
    },
    handler: async (ctx, { id, confirmedById, confirmNotes }) => {
        await ctx.db.patch(id, {
            isConfirmed: true,
            confirmedById,
            confirmedAt: new Date().toISOString(),
            confirmNotes,
        });
        return ctx.db.get(id);
    },
});

export const rejectFingerprint = mutation({
    args: {
        id: v.id("fingerPrints"),
        confirmNotes: v.optional(v.string()),
    },
    handler: async (ctx, { id, confirmNotes }) => {
        await ctx.db.patch(id, {
            isConfirmed: false,
            confirmedAt: new Date().toISOString(),
            confirmNotes: confirmNotes ?? "Rejected",
        });
        return ctx.db.get(id);
    },
});

// ─── Delete fingerprint ───────────────────────────────────────────────────────

export const deleteFingerprint = mutation({
    args: { id: v.id("fingerPrints") },
    handler: async (ctx, { id }) => {
        const fp = await ctx.db.get(id);
        if (!fp) throw new Error("Fingerprint not found");
        if (fp.storageId) await ctx.storage.delete(fp.storageId);
        await ctx.db.delete(id);
        return { success: true };
    },
});

export const generateFingerprintUploadUrl = mutation({
    handler: async (ctx) => ctx.storage.generateUploadUrl(),
});