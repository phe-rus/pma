import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─── Shared Validators ────────────────────────────────────────────────────────

export const vGender = v.union(v.literal("male"), v.literal("female"));

export const vInmateStatus = v.union(
  v.literal("remand"),
  v.literal("convict"),
  v.literal("at_court"),
  v.literal("released"),
  v.literal("transferred"),
  v.literal("escaped"),
  v.literal("deceased")
);

export const vInmateType = v.union(
  v.literal("remand"),
  v.literal("convict"),
  v.literal("civil")
);

export const vRiskLevel = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("maximum")
);

export const vPrisonType = v.union(
  v.literal("main"),
  v.literal("remand"),
  v.literal("open"),
  v.literal("farm"),
  v.literal("branch")
);

export const vCourtType = v.union(
  v.literal("magistrate"),
  v.literal("high"),
  v.literal("chief_magistrate"),
  v.literal("industrial_court")
);

export const vOffenseCategory = v.union(
  v.literal("felony"),
  v.literal("misdemeanor"),
  v.literal("capital"),
  v.literal("traffic")
);

export const vMovementType = v.union(
  v.literal("transfer"),
  v.literal("hospital"),
  v.literal("court"),
  v.literal("work_party"),
  v.literal("release")
);

export const vVisitStatus = v.union(
  v.literal("scheduled"),
  v.literal("checked_in"),
  v.literal("completed"),
  v.literal("denied"),
  v.literal("cancelled")
);

export const vChargeStatus = v.union(
  v.literal("pending"),
  v.literal("convicted"),
  v.literal("acquitted"),
  v.literal("withdrawn")
);

export const vCourtOutcome = v.union(
  v.literal("adjourned"),
  v.literal("convicted"),
  v.literal("acquitted"),
  v.literal("bail_granted"),
  v.literal("remanded")
);

export const vReleaseReason = v.union(
  v.literal("served"),
  v.literal("bail"),
  v.literal("acquitted"),
  v.literal("pardon"),
  v.literal("fine_paid")
);

export const vPhotoType = v.union(
  v.literal("mugshot_front"),
  v.literal("mugshot_side"),
  v.literal("mugshot_3quarter"),
  v.literal("document"),
  v.literal("profile")      // used for officers
);

export const vPhotoProvider = v.union(
  v.literal("internal"),    // captured via the app's built-in camera
  v.literal("external_url"),// photo hosted at an external URL
  v.literal("upload")       // file uploaded directly (base64 or storage)
);

export const vFinger = v.union(
  v.literal("right_thumb"),
  v.literal("right_index"),
  v.literal("right_middle"),
  v.literal("right_ring"),
  v.literal("right_little"),
  v.literal("left_thumb"),
  v.literal("left_index"),
  v.literal("left_middle"),
  v.literal("left_ring"),
  v.literal("left_little")
);

export const vFingerprintProvider = v.union(
  v.literal("internal"),     // captured via the app's built-in scanner
  v.literal("external"),     // captured by a 3rd-party scanner, data provided as template
  v.literal("upload")        // template file uploaded
);

export const vItemCondition = v.union(
  v.literal("good"),
  v.literal("fair"),
  v.literal("poor")
);

export const vMedicalRecordType = v.union(
  v.literal("admission_checkup"),
  v.literal("illness"),
  v.literal("injury"),
  v.literal("referral")
);

export const vAttendanceStatus = v.union(
  v.literal("present"),
  v.literal("absent"),
  v.literal("late"),
  v.literal("on_leave"),
  v.literal("sick_leave"),
  v.literal("off_duty")
);

export const vAttendanceShift = v.union(
  v.literal("morning"),
  v.literal("afternoon"),
  v.literal("night"),
  v.literal("full_day")
);

// ─── Table Schemas ────────────────────────────────────────────────────────────

export const prisonSchema = {
  name: v.string(),
  code: v.string(),
  type: vPrisonType,
  region: v.optional(v.string()),
  district: v.optional(v.string()),
  address: v.optional(v.string()),
  capacity: v.optional(v.number()),
  contactPhone: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
};

export const courtSchema = {
  name: v.string(),
  type: v.optional(vCourtType),
  district: v.optional(v.string()),
  address: v.optional(v.string()),
};

export const officerSchema = {
  prisonId: v.id("prisons"),
  name: v.string(),
  badgeNumber: v.string(),
  rank: v.optional(v.string()),
  phone: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
};

export const offenseSchema = {
  name: v.string(),
  act: v.optional(v.string()),
  section: v.optional(v.string()),
  chapter: v.optional(v.string()),
  category: v.optional(vOffenseCategory),
  amendedBy: v.optional(v.string()),
  description: v.optional(v.string()),
  maxSentenceYears: v.optional(v.number()),
};

export const inmateSchema = {
  firstName: v.string(),
  lastName: v.string(),
  otherNames: v.optional(v.string()),
  prisonNumber: v.string(),
  nationalId: v.optional(v.string()),
  dob: v.string(),
  gender: vGender,
  nationality: v.optional(v.string()),
  tribe: v.optional(v.string()),
  religion: v.optional(v.string()),
  educationLevel: v.optional(v.string()),
  maritalStatus: v.optional(v.string()),
  occupation: v.optional(v.string()),
  nextOfKinName: v.optional(v.string()),
  nextOfKinPhone: v.optional(v.string()),
  nextOfKinRelationship: v.optional(v.string()),
  inmateType: vInmateType,
  status: vInmateStatus,
  riskLevel: v.optional(vRiskLevel),
  prisonId: v.id("prisons"),
  cellBlock: v.optional(v.string()),
  cellNumber: v.optional(v.string()),
  caseNumber: v.string(),
  offenseId: v.id("offenses"),
  arrestingStation: v.optional(v.string()),
  admissionDate: v.string(),
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
  releaseReason: v.optional(vReleaseReason),
  notes: v.optional(v.string()),
};

export const inmateChargesSchema = {
  inmateId: v.id("inmates"),
  offenseId: v.id("offenses"),
  isPrimary: v.optional(v.boolean()),
  status: v.optional(vChargeStatus),
  notes: v.optional(v.string()),
};

export const courtAppearanceSchema = {
  inmateId: v.id("inmates"),
  courtId: v.id("courts"),
  officerId: v.optional(v.id("officers")),
  scheduledDate: v.string(),
  departureTime: v.optional(v.string()),
  returnTime: v.optional(v.string()),
  outcome: v.optional(vCourtOutcome),
  nextDate: v.optional(v.string()),
  notes: v.optional(v.string()),
};

export const recordMovementSchema = {
  inmateId: v.id("inmates"),
  fromPrisonId: v.optional(v.id("prisons")),
  toPrisonId: v.optional(v.id("prisons")),
  officerId: v.optional(v.id("officers")),
  movementType: vMovementType,
  destination: v.optional(v.string()),
  departureDate: v.string(),
  returnDate: v.optional(v.string()),
  reason: v.string(),
  notes: v.optional(v.string()),
};

export const inmateVisitsSchema = {
  inmateId: v.id("inmates"),
  prisonId: v.id("prisons"),
  fullName: v.string(),
  idNumber: v.string(),
  idType: v.optional(v.union(
    v.literal("national_id"),
    v.literal("passport"),
    v.literal("driving_permit")
  )),
  relationship: v.string(),
  phone: v.string(),
  address: v.optional(v.string()),
  email: v.optional(v.string()),
  reason: v.optional(v.string()),
  scheduledDate: v.optional(v.string()),
  checkInTime: v.optional(v.string()),
  checkOutTime: v.optional(v.string()),
  status: vVisitStatus,
  denialReason: v.optional(v.string()),
  itemsDeclaration: v.optional(v.string()),
  flagged: v.optional(v.boolean()),
  flagReason: v.optional(v.string()),
  approvedById: v.optional(v.id("officers")),
};

export const itemsInCustodySchema = {
  inmateId: v.id("inmates"),
  name: v.string(),
  description: v.optional(v.string()),
  value: v.optional(v.number()),
  condition: v.optional(vItemCondition),
  storageLocation: v.optional(v.string()),
  returnedAt: v.optional(v.string()),
  returnedToName: v.optional(v.string()),
};

export const medicalRecordSchema = {
  inmateId: v.id("inmates"),
  recordType: vMedicalRecordType,
  diagnosis: v.optional(v.string()),
  treatment: v.optional(v.string()),
  attendedBy: v.optional(v.string()),
  referredToHospital: v.optional(v.string()),
  recordDate: v.string(),
  notes: v.optional(v.string()),
};

// ─── Unified photo bucket — supports both inmates and officers ─────────────────
// subjectType distinguishes the owner. One of inmateId or officerId will be set.

export const photoBucketSchema = {
  // Subject
  subjectType: v.union(v.literal("inmate"), v.literal("officer")),
  inmateId: v.optional(v.id("inmates")),
  officerId: v.optional(v.id("officers")),

  photoType: vPhotoType,
  provider: vPhotoProvider,

  // Internal capture (Convex file storage)
  storageId: v.optional(v.id("_storage")),

  // External provider URL
  externalUrl: v.optional(v.string()),

  // Upload / base64 fallback (small preview only — full file should use storageId)
  base64Preview: v.optional(v.string()),

  // Metadata
  fileSize: v.optional(v.number()),
  mimeType: v.optional(v.string()),
  capturedAt: v.optional(v.string()),
  capturedById: v.optional(v.id("officers")),
  isPrimary: v.optional(v.boolean()),

  // Confirmation workflow
  isConfirmed: v.optional(v.boolean()),
  confirmedById: v.optional(v.id("officers")),
  confirmedAt: v.optional(v.string()),
  confirmNotes: v.optional(v.string()),
};

// ─── Unified fingerprint table — supports both inmates and officers ────────────

export const fingerPrintSchema = {
  // Subject
  subjectType: v.union(v.literal("inmate"), v.literal("officer")),
  inmateId: v.optional(v.id("inmates")),
  officerId: v.optional(v.id("officers")),

  finger: vFinger,
  provider: vFingerprintProvider,

  // Convex storage (raw scan image or template file)
  storageId: v.optional(v.id("_storage")),

  // External / template data (base64 minutiae or WSQ)
  templateData: v.optional(v.string()),

  // Provider metadata
  providerName: v.optional(v.string()),  // e.g. "Suprema", "Digital Persona"
  providerRef: v.optional(v.string()),  // external record ID

  quality: v.optional(v.number()),      // 0–100
  capturedAt: v.optional(v.string()),
  capturedById: v.optional(v.id("officers")),

  // Confirmation workflow
  isConfirmed: v.optional(v.boolean()),
  confirmedById: v.optional(v.id("officers")),
  confirmedAt: v.optional(v.string()),
  confirmNotes: v.optional(v.string()),
};

// ─── Officer attendance ───────────────────────────────────────────────────────

export const officerAttendanceSchema = {
  officerId: v.id("officers"),
  prisonId: v.id("prisons"),
  date: v.string(),          // ISO date YYYY-MM-DD
  shift: vAttendanceShift,
  status: vAttendanceStatus,
  checkInTime: v.optional(v.string()),
  checkOutTime: v.optional(v.string()),
  hoursWorked: v.optional(v.number()),
  notes: v.optional(v.string()),
  recordedById: v.optional(v.id("officers")),
};

// ─── Schema Definition ────────────────────────────────────────────────────────

export default defineSchema({
  prisons: defineTable(prisonSchema)
    .index("byCode", ["code"])
    .index("byType", ["type"])
    .index("byRegion", ["region"]),

  courts: defineTable(courtSchema)
    .index("byType", ["type"])
    .index("byDistrict", ["district"]),

  officers: defineTable(officerSchema)
    .index("byBadgeNumber", ["badgeNumber"])
    .index("byPrisonId", ["prisonId"]),

  offenses: defineTable(offenseSchema)
    .index("byCategory", ["category"]),

  inmates: defineTable(inmateSchema)
    .index("byPrisonNumber", ["prisonNumber"])
    .index("byPrisonId", ["prisonId"])
    .index("byStatus", ["status"])
    .index("byInmateType", ["inmateType"])
    .index("byNationalId", ["nationalId"])
    .index("byCaseNumber", ["caseNumber"]),

  inmateCharges: defineTable(inmateChargesSchema)
    .index("byInmateId", ["inmateId"])
    .index("byOffenseId", ["offenseId"]),

  courtAppearances: defineTable(courtAppearanceSchema)
    .index("byInmateId", ["inmateId"])
    .index("byCourtId", ["courtId"])
    .index("byScheduledDate", ["scheduledDate"]),

  recordMovements: defineTable(recordMovementSchema)
    .index("byInmateId", ["inmateId"])
    .index("byMovementType", ["movementType"])
    .index("byFromPrison", ["fromPrisonId"])
    .index("byToPrison", ["toPrisonId"]),

  inmateVisits: defineTable(inmateVisitsSchema)
    .index("byInmateId", ["inmateId"])
    .index("byStatus", ["status"])
    .index("byPrisonId", ["prisonId"])
    .index("byCheckOutTime", ["checkOutTime"]),

  itemsInCustody: defineTable(itemsInCustodySchema)
    .index("byInmateId", ["inmateId"]),

  medicalRecords: defineTable(medicalRecordSchema)
    .index("byInmateId", ["inmateId"])
    .index("byRecordType", ["recordType"])
    .index("byRecordDate", ["recordDate"]),

  // Unified photos for both inmates and officers
  photoBucket: defineTable(photoBucketSchema)
    .index("byInmateId", ["inmateId"])
    .index("byOfficerId", ["officerId"])
    .index("bySubject", ["subjectType"])
    .index("byConfirmed", ["subjectType", "isConfirmed"]),

  // Unified fingerprints for both inmates and officers
  fingerPrints: defineTable(fingerPrintSchema)
    .index("byInmateId", ["inmateId"])
    .index("byOfficerId", ["officerId"])
    .index("bySubject", ["subjectType"])
    .index("byInmateFinger", ["inmateId", "finger"])
    .index("byOfficerFinger", ["officerId", "finger"]),

  // Officer attendance
  officerAttendance: defineTable(officerAttendanceSchema)
    .index("byOfficerId", ["officerId"])
    .index("byDate", ["date"])
    .index("byPrisonId", ["prisonId"])
    .index("byOfficerDate", ["officerId", "date"]),
});