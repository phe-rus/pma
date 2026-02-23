import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
    officerAttendanceSchema,
    vAttendanceStatus,
    vAttendanceShift,
} from "./schema";

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getAllAttendance = query({
    handler: async (ctx) =>
        ctx.db.query("officerAttendance").order("desc").collect(),
});

export const getAttendanceByOfficer = query({
    args: { officerId: v.id("officers") },
    handler: async (ctx, { officerId }) =>
        ctx.db
            .query("officerAttendance")
            .withIndex("byOfficerId", (q) => q.eq("officerId", officerId))
            .order("desc")
            .collect(),
});

export const getAttendanceByDate = query({
    args: { date: v.string() },
    handler: async (ctx, { date }) =>
        ctx.db
            .query("officerAttendance")
            .withIndex("byDate", (q) => q.eq("date", date))
            .collect(),
});

export const getAttendanceByPrison = query({
    args: { prisonId: v.id("prisons"), date: v.optional(v.string()) },
    handler: async (ctx, { prisonId, date }) => {
        const q = ctx.db
            .query("officerAttendance")
            .withIndex("byPrisonId", (qi) => qi.eq("prisonId", prisonId));
        if (date) {
            return q.filter((qi) => qi.eq(qi.field("date"), date)).collect();
        }
        return q.collect();
    },
});

export const getOfficerAttendanceForDate = query({
    args: { officerId: v.id("officers"), date: v.string() },
    handler: async (ctx, { officerId, date }) =>
        ctx.db
            .query("officerAttendance")
            .withIndex("byOfficerDate", (q) =>
                q.eq("officerId", officerId).eq("date", date)
            )
            .collect(),
});

// Attendance summary: count statuses across a date range for an officer
export const getAttendanceSummary = query({
    args: {
        officerId: v.id("officers"),
        dateFrom: v.string(),
        dateTo: v.string(),
    },
    handler: async (ctx, { officerId, dateFrom, dateTo }) => {
        const records = await ctx.db
            .query("officerAttendance")
            .withIndex("byOfficerId", (q) => q.eq("officerId", officerId))
            .filter((q) =>
                q.and(
                    q.gte(q.field("date"), dateFrom),
                    q.lte(q.field("date"), dateTo)
                )
            )
            .collect();

        const summary: Record<string, number> = {
            present: 0,
            absent: 0,
            late: 0,
            on_leave: 0,
            sick_leave: 0,
            off_duty: 0,
            total: records.length,
        };
        for (const r of records) {
            summary[r.status] = (summary[r.status] ?? 0) + 1;
        }
        return summary;
    },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

export const recordAttendance = mutation({
    args: officerAttendanceSchema,
    handler: async (ctx, args) => {
        // Prevent duplicate record for same officer + date + shift
        const existing = await ctx.db
            .query("officerAttendance")
            .withIndex("byOfficerDate", (q) =>
                q.eq("officerId", args.officerId).eq("date", args.date)
            )
            .filter((q) => q.eq(q.field("shift"), args.shift))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, args);
            return ctx.db.get(existing._id);
        }

        const id = await ctx.db.insert("officerAttendance", args);
        return ctx.db.get(id);
    },
});

export const clockIn = mutation({
    args: {
        officerId: v.id("officers"),
        prisonId: v.id("prisons"),
        date: v.string(),
        shift: vAttendanceShift,
        checkInTime: v.string(),
        recordedById: v.optional(v.id("officers")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("officerAttendance")
            .withIndex("byOfficerDate", (q) =>
                q.eq("officerId", args.officerId).eq("date", args.date)
            )
            .filter((q) => q.eq(q.field("shift"), args.shift))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                checkInTime: args.checkInTime,
                status: "present",
            });
            return ctx.db.get(existing._id);
        }

        const id = await ctx.db.insert("officerAttendance", {
            officerId: args.officerId,
            prisonId: args.prisonId,
            date: args.date,
            shift: args.shift,
            status: "present",
            checkInTime: args.checkInTime,
            recordedById: args.recordedById,
        });
        return ctx.db.get(id);
    },
});

export const clockOut = mutation({
    args: {
        id: v.id("officerAttendance"),
        checkOutTime: v.string(),
        hoursWorked: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { id, checkOutTime, hoursWorked, notes }) => {
        await ctx.db.patch(id, {
            checkOutTime,
            ...(hoursWorked !== undefined ? { hoursWorked } : {}),
            ...(notes ? { notes } : {}),
        });
        return ctx.db.get(id);
    },
});

export const markAbsent = mutation({
    args: {
        officerId: v.id("officers"),
        prisonId: v.id("prisons"),
        date: v.string(),
        shift: vAttendanceShift,
        status: vAttendanceStatus,
        notes: v.optional(v.string()),
        recordedById: v.optional(v.id("officers")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("officerAttendance")
            .withIndex("byOfficerDate", (q) =>
                q.eq("officerId", args.officerId).eq("date", args.date)
            )
            .filter((q) => q.eq(q.field("shift"), args.shift))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                status: args.status,
                notes: args.notes,
            });
            return ctx.db.get(existing._id);
        }

        const id = await ctx.db.insert("officerAttendance", args);
        return ctx.db.get(id);
    },
});

export const updateAttendance = mutation({
    args: {
        id: v.id("officerAttendance"),
        patch: v.object({
            status: v.optional(vAttendanceStatus),
            shift: v.optional(vAttendanceShift),
            checkInTime: v.optional(v.string()),
            checkOutTime: v.optional(v.string()),
            hoursWorked: v.optional(v.number()),
            notes: v.optional(v.string()),
        }),
    },
    handler: async (ctx, { id, patch }) => {
        await ctx.db.patch(id, patch);
        return ctx.db.get(id);
    },
});

export const deleteAttendance = mutation({
    args: { id: v.id("officerAttendance") },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
        return { success: true };
    },
});