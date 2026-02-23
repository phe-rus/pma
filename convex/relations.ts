import { query } from "./_generated/server";
import { v } from "convex/values";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getOpt<T>(
    ctx: any,
    _table: string,
    id: string | undefined | null
): Promise<T | null> {
    if (!id) return null;
    return (await ctx.db.get(id)) ?? null;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. INMATE
// ════════════════════════════════════════════════════════════════════════════

export const getInmateWithRelations = query({
    args: { id: v.id("inmates") },
    handler: async (ctx, { id }) => {
        const inmate = await ctx.db.get(id);
        if (!inmate) return null;

        const [
            prison,
            offense,
            charges,
            visits,
            courtAppearances,
            movements,
            itemsInCustody,
            medicalRecords,
            photos,
            fingerprints,
        ] = await Promise.all([
            ctx.db.get(inmate.prisonId),
            ctx.db.get(inmate.offenseId),

            ctx.db.query("inmateCharges")
                .withIndex("byInmateId", (q: any) => q.eq("inmateId", id))
                .collect(),

            ctx.db.query("inmateVisits")
                .withIndex("byInmateId", (q: any) => q.eq("inmateId", id))
                .collect(),

            ctx.db.query("courtAppearances")
                .withIndex("byInmateId", (q: any) => q.eq("inmateId", id))
                .collect(),

            ctx.db.query("recordMovements")
                .withIndex("byInmateId", (q: any) => q.eq("inmateId", id))
                .collect(),

            ctx.db.query("itemsInCustody")
                .withIndex("byInmateId", (q: any) => q.eq("inmateId", id))
                .collect(),

            ctx.db.query("medicalRecords")
                .withIndex("byInmateId", (q: any) => q.eq("inmateId", id))
                .collect(),

            // Unified photo table — filter by subjectType + inmateId
            ctx.db.query("photoBucket")
                .withIndex("byInmateId", (q: any) => q.eq("inmateId", id))
                .collect(),

            // Unified fingerprint table — filter by subjectType + inmateId
            ctx.db.query("fingerPrints")
                .withIndex("byInmateId", (q: any) => q.eq("inmateId", id))
                .collect(),
        ]);

        // Hydrate charge offenses
        const chargesHydrated = await Promise.all(
            charges.map(async (c: any) => ({
                ...c,
                offense: await ctx.db.get(c.offenseId),
            }))
        );

        return {
            ...inmate,
            prison,
            offense,
            charges: chargesHydrated,
            visits,
            courtAppearances,
            movements,
            itemsInCustody,
            medicalRecords,
            photos,
            confirmedPhotos: photos.filter((p: any) => p.isConfirmed),
            primaryPhoto: photos.find((p: any) => p.isPrimary) ?? photos[0] ?? null,
            fingerprints,
            confirmedFingerprints: fingerprints.filter((f: any) => f.isConfirmed),
            capturedFingers: fingerprints.map((f: any) => f.finger),
        };
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 2. OFFICER
// ════════════════════════════════════════════════════════════════════════════

export const getOfficerWithRelations = query({
    args: { id: v.id("officers") },
    handler: async (ctx, { id }) => {
        const officer = await ctx.db.get(id);
        if (!officer) return null;

        const today = new Date().toISOString().split("T")[0];

        const [
            prison,
            photos,
            fingerprints,
            todayAttendance,
            recentAttendance,
        ] = await Promise.all([
            ctx.db.get(officer.prisonId),

            ctx.db.query("photoBucket")
                .withIndex("byOfficerId", (q: any) => q.eq("officerId", id))
                .collect(),

            ctx.db.query("fingerPrints")
                .withIndex("byOfficerId", (q: any) => q.eq("officerId", id))
                .collect(),

            ctx.db.query("officerAttendance")
                .withIndex("byOfficerDate", (q: any) => q.eq("officerId", id).eq("date", today))
                .collect(),

            ctx.db.query("officerAttendance")
                .withIndex("byOfficerId", (q: any) => q.eq("officerId", id))
                .order("desc")
                .take(30),
        ]);

        return {
            ...officer,
            prison,
            photos,
            confirmedPhotos: photos.filter((p: any) => p.isConfirmed),
            primaryPhoto: photos.find((p: any) => p.isPrimary) ?? photos[0] ?? null,
            photoCount: photos.length,
            fingerprints,
            confirmedFingerprints: fingerprints.filter((f: any) => f.isConfirmed),
            capturedFingers: fingerprints.map((f: any) => f.finger),
            fingerprintCount: fingerprints.length,
            todayAttendance,
            recentAttendance,
        };
    },
});

// All officers for a prison with shallow biometric counts
export const getOfficersByPrisonWithSummary = query({
    args: { prisonId: v.id("prisons") },
    handler: async (ctx, { prisonId }) => {
        const officers = await ctx.db
            .query("officers")
            .withIndex("byPrisonId", (q: any) => q.eq("prisonId", prisonId))
            .collect();

        const today = new Date().toISOString().split("T")[0];

        return Promise.all(
            officers.map(async (officer: any) => {
                const [photos, fingerprints, todayAtt] = await Promise.all([
                    ctx.db.query("photoBucket")
                        .withIndex("byOfficerId", (q: any) => q.eq("officerId", officer._id))
                        .collect(),
                    ctx.db.query("fingerPrints")
                        .withIndex("byOfficerId", (q: any) => q.eq("officerId", officer._id))
                        .collect(),
                    ctx.db.query("officerAttendance")
                        .withIndex("byOfficerDate", (q: any) =>
                            q.eq("officerId", officer._id).eq("date", today)
                        )
                        .collect(),
                ]);

                return {
                    ...officer,
                    photoCount: photos.length,
                    fingerprintCount: fingerprints.length,
                    primaryPhoto: photos.find((p: any) => p.isPrimary) ?? photos[0] ?? null,
                    todayAttendance: todayAtt[0] ?? null,
                };
            })
        );
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 3. COURT APPEARANCE
// ════════════════════════════════════════════════════════════════════════════

export const getCourtAppearanceWithRelations = query({
    args: { id: v.id("courtAppearances") },
    handler: async (ctx, { id }) => {
        const appearance = await ctx.db.get(id);
        if (!appearance) return null;

        const [inmate, court, escortOfficer] = await Promise.all([
            ctx.db.get(appearance.inmateId),
            ctx.db.get(appearance.courtId),
            getOpt(ctx, "officers", appearance.officerId),
        ]);

        return { ...appearance, inmate, court, escortOfficer };
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 4. VISIT
// ════════════════════════════════════════════════════════════════════════════

export const getVisitWithRelations = query({
    args: { id: v.id("inmateVisits") },
    handler: async (ctx, { id }) => {
        const visit = await ctx.db.get(id);
        if (!visit) return null;

        const [inmate, prison, approvedBy] = await Promise.all([
            ctx.db.get(visit.inmateId),
            ctx.db.get(visit.prisonId),
            getOpt(ctx, "officers", visit.approvedById),
        ]);

        return { ...visit, inmate, prison, approvedBy };
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 5. MOVEMENT
// ════════════════════════════════════════════════════════════════════════════

export const getMovementWithRelations = query({
    args: { id: v.id("recordMovements") },
    handler: async (ctx, { id }) => {
        const movement = await ctx.db.get(id);
        if (!movement) return null;

        const [inmate, fromPrison, toPrison, officer] = await Promise.all([
            ctx.db.get(movement.inmateId),
            getOpt(ctx, "prisons", movement.fromPrisonId),
            getOpt(ctx, "prisons", movement.toPrisonId),
            getOpt(ctx, "officers", movement.officerId),
        ]);

        return { ...movement, inmate, fromPrison, toPrison, officer };
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 6. INMATE CHARGE
// ════════════════════════════════════════════════════════════════════════════

export const getChargeWithRelations = query({
    args: { id: v.id("inmateCharges") },
    handler: async (ctx, { id }) => {
        const charge = await ctx.db.get(id);
        if (!charge) return null;

        const [inmate, offense] = await Promise.all([
            ctx.db.get(charge.inmateId),
            ctx.db.get(charge.offenseId),
        ]);

        return { ...charge, inmate, offense };
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 7. PHOTO  (unified — inmate or officer)
// ════════════════════════════════════════════════════════════════════════════

export const getPhotoWithRelations = query({
    args: { id: v.id("photoBucket") },
    handler: async (ctx, { id }) => {
        const photo = await ctx.db.get(id);
        if (!photo) return null;

        const [subject, capturedBy, confirmedBy] = await Promise.all([
            photo.subjectType === "inmate"
                ? getOpt(ctx, "inmates", photo.inmateId)
                : getOpt(ctx, "officers", photo.officerId),
            getOpt(ctx, "officers", photo.capturedById),
            getOpt(ctx, "officers", photo.confirmedById),
        ]);

        return { ...photo, subject, capturedBy, confirmedBy };
    },
});

// All unconfirmed photos with their subjects hydrated
export const getUnconfirmedPhotosWithSubjects = query({
    handler: async (ctx) => {
        const photos = await ctx.db
            .query("photoBucket")
            .filter((q: any) => q.eq(q.field("isConfirmed"), false))
            .collect();

        return Promise.all(
            photos.map(async (photo: any) => ({
                ...photo,
                subject: photo.subjectType === "inmate"
                    ? await getOpt(ctx, "inmates", photo.inmateId)
                    : await getOpt(ctx, "officers", photo.officerId),
                capturedBy: await getOpt(ctx, "officers", photo.capturedById),
            }))
        );
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 8. FINGERPRINT  (unified — inmate or officer)
// ════════════════════════════════════════════════════════════════════════════

export const getFingerprintWithRelations = query({
    args: { id: v.id("fingerPrints") },
    handler: async (ctx, { id }) => {
        const fp = await ctx.db.get(id);
        if (!fp) return null;

        const [subject, capturedBy, confirmedBy] = await Promise.all([
            fp.subjectType === "inmate"
                ? getOpt(ctx, "inmates", fp.inmateId)
                : getOpt(ctx, "officers", fp.officerId),
            getOpt(ctx, "officers", fp.capturedById),
            getOpt(ctx, "officers", fp.confirmedById),
        ]);

        return { ...fp, subject, capturedBy, confirmedBy };
    },
});

// All unconfirmed fingerprints with their subjects hydrated
export const getUnconfirmedFingerprintsWithSubjects = query({
    handler: async (ctx) => {
        const fps = await ctx.db
            .query("fingerPrints")
            .filter((q: any) => q.eq(q.field("isConfirmed"), false))
            .collect();

        return Promise.all(
            fps.map(async (fp: any) => ({
                ...fp,
                subject: fp.subjectType === "inmate"
                    ? await getOpt(ctx, "inmates", fp.inmateId)
                    : await getOpt(ctx, "officers", fp.officerId),
                capturedBy: await getOpt(ctx, "officers", fp.capturedById),
            }))
        );
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 9. OFFICER ATTENDANCE
// ════════════════════════════════════════════════════════════════════════════

export const getAttendanceWithRelations = query({
    args: { id: v.id("officerAttendance") },
    handler: async (ctx, { id }) => {
        const record = await ctx.db.get(id);
        if (!record) return null;

        const [officer, prison, recordedBy] = await Promise.all([
            ctx.db.get(record.officerId),
            ctx.db.get(record.prisonId),
            getOpt(ctx, "officers", record.recordedById),
        ]);

        return { ...record, officer, prison, recordedBy };
    },
});

// Attendance roster for a date — all officers for a prison with status
export const getDailyRosterWithOfficers = query({
    args: { prisonId: v.id("prisons"), date: v.string() },
    handler: async (ctx, { prisonId, date }) => {
        const officers = await ctx.db
            .query("officers")
            .withIndex("byPrisonId", (q: any) => q.eq("prisonId", prisonId))
            .collect();

        const attendanceRecords = await ctx.db
            .query("officerAttendance")
            .withIndex("byDate", (q: any) => q.eq("date", date))
            .filter((q: any) => q.eq(q.field("prisonId"), prisonId))
            .collect();

        const attendanceMap = new Map(
            attendanceRecords.map((r: any) => [r.officerId, r])
        );

        return officers.map((officer: any) => ({
            ...officer,
            attendance: attendanceMap.get(officer._id) ?? null,
        }));
    },
});

// ════════════════════════════════════════════════════════════════════════════
// 10. LIST HELPERS
// ════════════════════════════════════════════════════════════════════════════

/** All inmates for a prison, each with their primary offense hydrated */
export const getInmatesByPrisonWithOffense = query({
    args: { prisonId: v.id("prisons") },
    handler: async (ctx, { prisonId }) => {
        const inmates = await ctx.db
            .query("inmates")
            .withIndex("byPrisonId", (q: any) => q.eq("prisonId", prisonId))
            .collect();

        return Promise.all(
            inmates.map(async (inmate: any) => ({
                ...inmate,
                offense: await ctx.db.get(inmate.offenseId),
            }))
        );
    },
});

/** Upcoming court appearances with inmate + court + escort officer */
export const getUpcomingAppearancesWithDetails = query({
    args: { fromDate: v.string() },
    handler: async (ctx, { fromDate }) => {
        const appearances = await ctx.db
            .query("courtAppearances")
            .withIndex("byScheduledDate", (q: any) => q.gte("scheduledDate", fromDate))
            .collect();

        return Promise.all(
            appearances.map(async (a: any) => ({
                ...a,
                inmate: await ctx.db.get(a.inmateId),
                court: await ctx.db.get(a.courtId),
                escortOfficer: await getOpt(ctx, "officers", a.officerId),
            }))
        );
    },
});

/** All visitors currently inside with inmate details */
export const getVisitorsInsideWithDetails = query({
    handler: async (ctx) => {
        const visits = await ctx.db
            .query("inmateVisits")
            .withIndex("byStatus", (q: any) => q.eq("status", "checked_in"))
            .collect();

        return Promise.all(
            visits.map(async (v: any) => ({
                ...v,
                inmate: await ctx.db.get(v.inmateId),
                approvedBy: await getOpt(ctx, "officers", v.approvedById),
            }))
        );
    },
});

/** All open movements (not yet returned) with inmate + prison details */
export const getOpenMovementsWithDetails = query({
    handler: async (ctx) => {
        const movements = await ctx.db
            .query("recordMovements")
            .filter((q: any) => q.eq(q.field("returnDate"), undefined))
            .collect();

        return Promise.all(
            movements.map(async (m: any) => ({
                ...m,
                inmate: await ctx.db.get(m.inmateId),
                fromPrison: await getOpt(ctx, "prisons", m.fromPrisonId),
                toPrison: await getOpt(ctx, "prisons", m.toPrisonId),
                officer: await getOpt(ctx, "officers", m.officerId),
            }))
        );
    },
});