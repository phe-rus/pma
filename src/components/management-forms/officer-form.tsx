import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { Id } from "convex/_generated/dataModel"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { TextField } from "./form-fields"
import { RelationSelect } from "./relation-select"
import { BiometricsPanel } from "./biometrics-panel"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    UserShield01Icon,
    Camera01Icon,
    CheckmarkCircle02Icon,
    ClockIcon,
    AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type AttendanceStatus = "present" | "absent" | "late" | "on_leave" | "sick_leave" | "off_duty"
type AttendanceShift = "morning" | "afternoon" | "night" | "full_day"

const STATUS_LABELS: Record<AttendanceStatus, string> = {
    present: "Present",
    absent: "Absent",
    late: "Late",
    on_leave: "On Leave",
    sick_leave: "Sick Leave",
    off_duty: "Off Duty",
}

const STATUS_STYLES: Record<AttendanceStatus, string> = {
    present: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30",
    absent: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30",
    late: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30",
    on_leave: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30",
    sick_leave: "border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/30",
    off_duty: "border-zinc-200 bg-zinc-100 text-zinc-600 dark:bg-zinc-800/30",
}

function AttendanceForm({ officerId, prisonId }: { officerId: string; prisonId: string }) {
    const clockIn = useMutation(api.officerMisc.clockIn)
    const markAbsent = useMutation(api.officerMisc.markAbsent)
    const todayStr = new Date().toISOString().split("T")[0]

    const [date, setDate] = useState(todayStr)
    const [shift, setShift] = useState<AttendanceShift>("full_day")
    const [status, setStatus] = useState<AttendanceStatus>("present")
    const [checkInTime, setCheckInTime] = useState(
        new Date().toTimeString().slice(0, 5)   // HH:MM default = now
    )
    const [notes, setNotes] = useState("")
    const [busy, setBusy] = useState(false)

    const handleSave = async () => {
        setBusy(true)
        try {
            if (status === "present" || status === "late") {
                await clockIn({
                    officerId: officerId as Id<"officers">,
                    prisonId: prisonId as Id<"prisons">,
                    date,
                    shift,
                    checkInTime: `${date}T${checkInTime}:00`,
                })
            } else {
                await markAbsent({
                    officerId: officerId as Id<"officers">,
                    prisonId: prisonId as Id<"prisons">,
                    date,
                    shift,
                    status,
                    notes: notes || undefined,
                })
            }
            toast.success("Attendance recorded")
            setNotes("")
        } catch (e: any) { toast.error(e.message) }
        setBusy(false)
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-sidebar/50 p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Quick attendance record for this officer</p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground">Date</p>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={todayStr}
                            className="h-8 w-full rounded border border-border bg-background px-2.5 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground">Shift</p>
                        <Select value={shift} onValueChange={(v) => setShift(v as AttendanceShift)}>
                            <SelectTrigger className="h-8 rounded text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full_day" className="text-xs">Full Day</SelectItem>
                                <SelectItem value="morning" className="text-xs">Morning</SelectItem>
                                <SelectItem value="afternoon" className="text-xs">Afternoon</SelectItem>
                                <SelectItem value="night" className="text-xs">Night</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Status pills */}
                <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Status</p>
                    <div className="flex flex-wrap gap-1.5">
                        {(Object.entries(STATUS_LABELS) as [AttendanceStatus, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setStatus(key)}
                                className={cn(
                                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                                    status === key
                                        ? STATUS_STYLES[key]
                                        : "border-border/60 text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Check-in time (only relevant if present or late) */}
                {(status === "present" || status === "late") && (
                    <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground">Check-in time</p>
                        <input
                            type="time"
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                            className="h-8 rounded border border-border bg-background px-2.5 text-xs"
                        />
                    </div>
                )}

                {/* Notes (always optional) */}
                <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Notes (optional)</p>
                    <input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Arrived 30 min late"
                        className="h-8 w-full rounded border border-border bg-background px-2.5 text-xs"
                    />
                </div>

                <Button
                    type="button"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={handleSave}
                    disabled={busy}
                >
                    <HugeiconsIcon icon={ClockIcon} className="size-3.5" />
                    {busy ? "Saving…" : "Record Attendance"}
                </Button>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Full attendance history and roster management is available on the Officers page. This panel records today's attendance only.
                </p>
            </div>
        </div>
    )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function OfficerForm({ onDone }: { onDone: () => void }) {
    const createOfficer = useMutation(api.officers.create)
    const createPrison = useMutation(api.prisons.create)
    const prisons = useQuery(api.prisons.getAll)

    const [prisonId, setPrisonId] = useState("")
    const [createdOfficerId, setCreatedOfficerId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("details")

    const form = useForm({
        defaultValues: {
            name: "",
            badgeNumber: "",
            rank: "",
            phone: "",
        },
        onSubmit: async ({ value }) => {
            if (!prisonId) { toast.error("Select a prison"); return }

            const officer = await createOfficer({
                name: value.name,
                badgeNumber: value.badgeNumber,
                rank: value.rank || undefined,
                phone: value.phone || undefined,
                prisonId: prisonId as Id<"prisons">,
            })

            if (officer?._id) {
                setCreatedOfficerId(officer._id)
                setActiveTab("biometrics")
                toast.success("Officer created — you can now attach photos and fingerprints")
            } else {
                toast.success("Officer created")
                onDone()
            }
        },
    })

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-5">
                <TabsTrigger value="details" className="flex-1 gap-1.5 text-xs">
                    <HugeiconsIcon icon={UserShield01Icon} className="size-3.5" />
                    Details
                </TabsTrigger>
                <TabsTrigger value="biometrics" className="flex-1 gap-1.5 text-xs" disabled={!createdOfficerId}>
                    <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
                    Biometrics
                    {createdOfficerId && (
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3 text-emerald-500 ml-0.5" />
                    )}
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex-1 gap-1.5 text-xs" disabled={!createdOfficerId}>
                    <HugeiconsIcon icon={ClockIcon} className="size-3.5" />
                    Attendance
                </TabsTrigger>
            </TabsList>

            {/* ── Details tab ──────────────────────────────────────────────── */}
            <TabsContent value="details">
                <form
                    className="space-y-5"
                    onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
                >
                    <FieldSet>
                        <FieldLegend>Officer Details</FieldLegend>
                        <FieldGroup className="space-y-3">
                            <form.Field name="name">
                                {(f) => <TextField field={f} label="Full Name" required />}
                            </form.Field>

                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="badgeNumber">
                                    {(f) => <TextField field={f} label="Badge Number" placeholder="e.g. WDN-001" required />}
                                </form.Field>
                                <form.Field name="rank">
                                    {(f) => <TextField field={f} label="Rank" placeholder="e.g. Warden" />}
                                </form.Field>
                            </div>

                            <form.Field name="phone">
                                {(f) => <TextField field={f} label="Phone" placeholder="+256 …" />}
                            </form.Field>

                            <Field className="gap-1">
                                <FieldLabel>Prison *</FieldLabel>
                                <RelationSelect
                                    label="Prison"
                                    value={prisonId}
                                    onChange={setPrisonId}
                                    items={prisons}
                                    getLabel={(p) => `${p.name} (${p.code})`}
                                    placeholder="Select a prison…"
                                    quickCreateFields={[
                                        { name: "name", placeholder: "Prison name", required: true },
                                        { name: "code", placeholder: "Code e.g. LUP", required: true },
                                    ]}
                                    onCreate={async (vals) => {
                                        const p = await createPrison({ name: vals.name, code: vals.code, type: "main" })
                                        return p!._id
                                    }}
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    <form.Subscribe>
                        {(state) => (
                            <Button type="submit" className="w-full" disabled={state.isSubmitting}>
                                {state.isSubmitting ? "Creating…" : "Create Officer"}
                            </Button>
                        )}
                    </form.Subscribe>
                </form>
            </TabsContent>

            {/* ── Biometrics tab ───────────────────────────────────────────── */}
            <TabsContent value="biometrics">
                <div className="space-y-4">
                    {createdOfficerId && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/30 dark:border-emerald-800">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-600 shrink-0" />
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 flex-1">
                                Officer saved. Photos and fingerprints are optional.
                            </p>
                            <Button size="sm" variant="outline" className="text-xs shrink-0" onClick={onDone}>
                                Done
                            </Button>
                        </div>
                    )}
                    <BiometricsPanel
                        subjectType="officer"
                        subjectId={createdOfficerId ?? undefined}
                    />
                </div>
            </TabsContent>

            <TabsContent value="attendance">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/30 dark:border-emerald-800">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-600 shrink-0" />
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 flex-1">
                            Officer saved. Record today's attendance below (optional).
                        </p>
                        <Button size="sm" variant="outline" className="text-xs shrink-0" onClick={onDone}>
                            Done
                        </Button>
                    </div>
                    {createdOfficerId && prisonId && (
                        <AttendanceForm officerId={createdOfficerId} prisonId={prisonId} />
                    )}
                </div>
            </TabsContent>
        </Tabs>
    )
}