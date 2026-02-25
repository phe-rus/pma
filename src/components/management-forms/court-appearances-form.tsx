import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { Id } from "convex/_generated/dataModel"
import { toast } from "sonner"
import { format } from "date-fns/format"
import { isToday, isFuture } from "date-fns"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { DateField } from "./form-fields"
import { RelationSelect } from "./relation-select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Calendar03Icon,
    Clock01Icon,
    JusticeScaleIcon as JusticeHammerIcon,
    UserAdd01Icon,
    AlertCircleIcon,
    CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

// ─── Types ────────────────────────────────────────────────────────────────────

type CourtOutcome = "adjourned" | "convicted" | "acquitted" | "bail_granted" | "remanded"

const outcomeConfig: Record<CourtOutcome, { label: string; dot: string; class: string }> = {
    adjourned: { label: "Adjourned", dot: "bg-amber-400", class: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
    convicted: { label: "Convicted", dot: "bg-red-500", class: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
    acquitted: { label: "Acquitted", dot: "bg-emerald-500", class: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
    bail_granted: { label: "Bail Granted", dot: "bg-sky-400", class: "border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400" },
    remanded: { label: "Remanded", dot: "bg-orange-500", class: "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400" },
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step, total }: { step: number; total: number }) {
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    className={cn(
                        "rounded-full transition-all",
                        i < step
                            ? "size-1.5 bg-primary"
                            : i === step
                                ? "h-1.5 w-4 bg-primary"
                                : "size-1.5 bg-muted-foreground/25"
                    )}
                />
            ))}
        </div>
    )
}

// ─── Inmate preview card ──────────────────────────────────────────────────────

function InmateCard({ inmateId, inmates }: { inmateId: string; inmates: any[] | undefined }) {
    const inmate = inmates?.find((i) => i._id === inmateId)
    if (!inmate) return null

    const hasCourtDate = !!inmate.nextCourtDate
    const courtDatePast = hasCourtDate && !isFuture(new Date(inmate.nextCourtDate))

    return (
        <div className="rounded-lg border border-border/60 bg-sidebar/60 px-3 py-2.5 flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <HugeiconsIcon icon={UserAdd01Icon} className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">
                    {inmate.firstName} {inmate.lastName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {inmate.prisonNumber}
                    {inmate.caseNumber && <span className="ml-2 opacity-60">Case {inmate.caseNumber}</span>}
                </p>
                {hasCourtDate && (
                    <p className={cn(
                        "text-xs mt-1 inline-flex items-center gap-1",
                        courtDatePast ? "text-amber-600" : "text-muted-foreground"
                    )}>
                        {courtDatePast && <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" />}
                        Existing court date: {format(new Date(inmate.nextCourtDate), "MMM dd, yyyy")}
                        {courtDatePast && " (overdue)"}
                    </p>
                )}
            </div>
            <span className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                inmate.status === "remand"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : inmate.status === "at_court"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-border/60 bg-muted text-muted-foreground"
            )}>
                {inmate.status?.replace("_", " ") ?? "—"}
            </span>
        </div>
    )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function CourtAppearanceForm({ onDone }: { onDone: () => void }) {
    const createAppearance = useMutation(api.courtAppearances.create)
    const createCourt = useMutation(api.courtAppearances.createCourt)

    const inmates = useQuery(api.inmate.getAll)
    const courts = useQuery(api.courtAppearances.getAllCourts)
    const officers = useQuery(api.officers.getAll)

    // ── Field state ───────────────────────────────────────────────────────────

    const [step, setStep] = useState(0)   // 0 = inmate, 1 = hearing, 2 = escort
    const [inmateId, setInmateId] = useState("")
    const [courtId, setCourtId] = useState("")
    const [officerId, setOfficerId] = useState("")
    const [scheduledDate, setScheduledDate] = useState("")
    const [departureTime, setDepartureTime] = useState("")
    const [notes, setNotes] = useState("")
    const [recordOutcome, setRecordOutcome] = useState(false)
    const [outcome, setOutcome] = useState<CourtOutcome | "">("")
    const [returnTime, setReturnTime] = useState("")
    const [nextDate, setNextDate] = useState("")
    const [busy, setBusy] = useState(false)

    // ── Validation per step ───────────────────────────────────────────────────

    const step0Valid = !!inmateId
    const step1Valid = !!courtId && !!scheduledDate
    const step2Valid = true   // escort is optional

    const canNext = [step0Valid, step1Valid, step2Valid][step]
    const isLast = step === 2

    // ── Submission ────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!inmateId) { toast.error("Select an inmate"); return }
        if (!courtId) { toast.error("Select a court"); return }
        if (!scheduledDate) { toast.error("Scheduled date required"); return }

        setBusy(true)
        try {
            await createAppearance({
                inmateId: inmateId as Id<"inmates">,
                courtId: courtId as Id<"courts">,
                officerId: officerId ? officerId as Id<"officers"> : undefined,
                scheduledDate,
                departureTime: departureTime || undefined,
                notes: notes.trim() || undefined,
                // outcome fields (if recording immediately)
                outcome: (recordOutcome && outcome) ? outcome : undefined,
                returnTime: (recordOutcome && returnTime) ? returnTime : undefined,
                nextDate: (recordOutcome && nextDate) ? nextDate : undefined,
            })
            toast.success("Court appearance scheduled")
            // reset
            setStep(0)
            setInmateId(""); setCourtId(""); setOfficerId("")
            setScheduledDate(""); setDepartureTime(""); setNotes("")
            setRecordOutcome(false); setOutcome(""); setReturnTime(""); setNextDate("")
            onDone()
        } catch (e: any) {
            toast.error(e.message)
        }
        setBusy(false)
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">

            {/* Step progress */}
            <div className="flex items-center justify-between">
                <StepDots step={step} total={3} />
                <p className="text-xs text-muted-foreground">
                    {step === 0 && "Step 1 of 3 — Select inmate"}
                    {step === 1 && "Step 2 of 3 — Hearing details"}
                    {step === 2 && "Step 3 of 3 — Escort & notes"}
                </p>
            </div>

            {/* ── STEP 0: Inmate ── */}
            {step === 0 && (
                <FieldSet>
                    <FieldLegend>Select Inmate</FieldLegend>
                    <FieldGroup className="space-y-3">
                        <Field className="gap-1">
                            <FieldLabel>Inmate *</FieldLabel>
                            <RelationSelect
                                label="Inmate"
                                value={inmateId}
                                onChange={setInmateId}
                                items={inmates?.filter((i) =>
                                    // only show non-released inmates
                                    i.status !== "released" && i.status !== "deceased"
                                )}
                                getLabel={(i) => `${i.firstName} ${i.lastName} — ${i.prisonNumber}`}
                                placeholder="Search for an inmate…"
                            />
                        </Field>

                        {inmateId && (
                            <InmateCard inmateId={inmateId} inmates={inmates} />
                        )}
                    </FieldGroup>
                </FieldSet>
            )}

            {/* ── STEP 1: Hearing details ── */}
            {step === 1 && (
                <div className="space-y-5">
                    {/* Selected inmate summary */}
                    {inmateId && (
                        <InmateCard inmateId={inmateId} inmates={inmates} />
                    )}

                    <FieldSet>
                        <FieldLegend>Court & Date</FieldLegend>
                        <FieldGroup className="space-y-3">
                            <Field className="gap-1">
                                <FieldLabel>Court *</FieldLabel>
                                <RelationSelect
                                    label="Court"
                                    value={courtId}
                                    onChange={setCourtId}
                                    items={courts}
                                    getLabel={(c) =>
                                        c.district
                                            ? `${c.name} — ${c.district}`
                                            : c.name
                                    }
                                    placeholder="Select a court…"
                                    quickCreateFields={[
                                        { name: "name", placeholder: "Court name e.g. Kampala High Court", required: true },
                                        { name: "district", placeholder: "District e.g. Kampala" },
                                    ]}
                                    onCreate={async (vals) => {
                                        const c = await createCourt({
                                            name: vals.name,
                                            district: vals.district || undefined,
                                        })
                                        return c!._id
                                    }}
                                />
                            </Field>

                            <DateField
                                label="Scheduled Date"
                                value={scheduledDate}
                                onChange={setScheduledDate}
                                required
                                toYear={new Date().getFullYear() + 5}
                            />

                            <Field className="gap-1">
                                <FieldLabel>Departure Time</FieldLabel>
                                <div className="relative">
                                    <HugeiconsIcon
                                        icon={Clock01Icon}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                    />
                                    <input
                                        type="time"
                                        value={departureTime}
                                        onChange={(e) => setDepartureTime(e.target.value)}
                                        className="h-9 w-full rounded border border-border bg-background pl-9 pr-3 text-sm"
                                    />
                                </div>
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    {/* Convenience: if date is in the past, offer to record outcome now */}
                    {scheduledDate && !isFuture(new Date(scheduledDate)) && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 space-y-3">
                            <div className="flex items-start gap-2">
                                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 dark:text-amber-300">
                                    This date is in the past. You can record the outcome immediately below, or leave it to record later.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setRecordOutcome((v) => !v)}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded border px-3 py-2 text-xs font-medium transition-colors",
                                    recordOutcome
                                        ? "border-amber-300 bg-amber-100 text-amber-800"
                                        : "border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:bg-transparent"
                                )}
                            >
                                <HugeiconsIcon
                                    icon={recordOutcome ? CheckmarkCircle02Icon : Calendar03Icon}
                                    className="size-3.5"
                                />
                                {recordOutcome ? "Recording outcome now" : "Record outcome now (optional)"}
                            </button>

                            {recordOutcome && (
                                <div className="space-y-3 pt-1">
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Outcome *</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(Object.entries(outcomeConfig) as [CourtOutcome, any][]).map(([key, cfg]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setOutcome(key)}
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                                                        outcome === key
                                                            ? cfg.class
                                                            : "border-border/60 text-muted-foreground hover:bg-muted"
                                                    )}
                                                >
                                                    <span className={cn("size-1.5 rounded-full", cfg.dot)} />
                                                    {cfg.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Return time</p>
                                            <input
                                                type="time"
                                                value={returnTime}
                                                onChange={(e) => setReturnTime(e.target.value)}
                                                className="h-8 w-full rounded border border-border bg-background px-2.5 text-xs"
                                            />
                                        </div>

                                        {(outcome === "adjourned" || outcome === "remanded") && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Next hearing</p>
                                                <input
                                                    type="date"
                                                    value={nextDate}
                                                    onChange={(e) => setNextDate(e.target.value)}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    className="h-8 w-full rounded border border-border bg-background px-2.5 text-xs"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {outcome && (
                                        <p className={cn(
                                            "text-[11px] rounded px-2 py-1.5 border",
                                            outcome === "convicted"
                                                ? "border-red-200 bg-red-50 text-red-700"
                                                : outcome === "acquitted"
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                        )}>
                                            {outcome === "convicted" && "⚠ Inmate status will be updated to Convict."}
                                            {outcome === "acquitted" && "✓ Inmate status will be updated to Released."}
                                            {outcome === "adjourned" && "Inmate status set to Remand. Next court date updated."}
                                            {outcome === "remanded" && "Inmate remains in custody. Status set to Remand."}
                                            {outcome === "bail_granted" && "Note bail conditions in the notes field."}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── STEP 2: Escort & notes ── */}
            {step === 2 && (
                <div className="space-y-5">
                    {/* Summary card */}
                    <div className="rounded-xl border border-border/60 bg-sidebar/50 divide-y divide-border/60">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <HugeiconsIcon icon={UserAdd01Icon} className="size-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Inmate</p>
                                <p className="text-sm font-medium truncate">
                                    {(() => {
                                        const i = inmates?.find((x) => x._id === inmateId)
                                        return i ? `${i.firstName} ${i.lastName} (${i.prisonNumber})` : "—"
                                    })()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3">
                            <HugeiconsIcon icon={JusticeHammerIcon} className="size-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Court · Date</p>
                                <p className="text-sm font-medium truncate">
                                    {courts?.find((c) => c._id === courtId)?.name ?? "—"}
                                </p>
                                {scheduledDate && (
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(scheduledDate), "EEEE, MMMM dd yyyy")}
                                        {departureTime && ` · Departs ${departureTime}`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <FieldSet>
                        <FieldLegend>Escorting Officer</FieldLegend>
                        <FieldGroup>
                            <Field className="gap-1">
                                <FieldLabel>Officer <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                                <RelationSelect
                                    label="Officer"
                                    value={officerId}
                                    onChange={setOfficerId}
                                    items={officers}
                                    getLabel={(o) => `${o.name} — ${o.badgeNumber}`}
                                    placeholder="Select escorting officer…"
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    <FieldSet>
                        <FieldLegend>Notes</FieldLegend>
                        <FieldGroup>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Security requirements, special instructions, transport details…"
                                className="rounded"
                                rows={3}
                            />
                        </FieldGroup>
                    </FieldSet>
                </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex gap-2 pt-2">
                {step > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep((s) => s - 1)}
                        disabled={busy}
                    >
                        Back
                    </Button>
                )}
                {!isLast ? (
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={() => setStep((s) => s + 1)}
                        disabled={!canNext}
                    >
                        Continue
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="flex-1 gap-1.5"
                        onClick={handleSubmit}
                        disabled={busy}
                    >
                        <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
                        {busy ? "Scheduling…" : "Schedule Appearance"}
                    </Button>
                )}
            </div>
        </div>
    )
}