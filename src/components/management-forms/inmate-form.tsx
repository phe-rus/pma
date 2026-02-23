import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { Id } from "convex/_generated/dataModel"
import { toast } from "sonner"
import z from "zod"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { TextField, DateField } from "./form-fields"
import { RelationSelect } from "./relation-select"
import { BiometricsPanel } from "./biometrics-panel"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    UserAdd01Icon,
    Camera01Icon,
    CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

const schema = z.object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    otherNames: z.string(),
    prisonNumber: z.string().min(1, "Required"),
    nationalId: z.string(),
    gender: z.enum(["male", "female"]),
    nationality: z.string(),
    inmateType: z.enum(["remand", "convict", "civil"]),
    status: z.enum(["remand", "convict", "at_court", "released", "transferred", "escaped", "deceased"]),
    riskLevel: z.enum(["low", "medium", "high", "maximum"]),
    caseNumber: z.string().min(1, "Required"),
    cellBlock: z.string(),
    cellNumber: z.string(),
    nextOfKinName: z.string(),
    nextOfKinPhone: z.string(),
    nextOfKinRelationship: z.string(),
    sentenceDuration: z.string(),
    notes: z.string(),
})

export function InmateForm({ onDone }: { onDone: () => void }) {
    const createInmate = useMutation(api.inmate.create)
    const createPrison = useMutation(api.prisons.create)
    const createOffense = useMutation(api.offenses.create)

    const prisons = useQuery(api.prisons.getAll)
    const offenses = useQuery(api.offenses.getAll)

    const [prisonId, setPrisonId] = useState("")
    const [offenseId, setOffenseId] = useState("")
    const [dob, setDob] = useState("")
    const [admissionDate, setAdmissionDate] = useState("")
    const [nextCourtDate, setNextCourtDate] = useState("")

    // After creation, we hold the new inmate's Id so biometrics can attach to it
    const [createdInmateId, setCreatedInmateId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("details")

    const form = useForm({
        defaultValues: {
            firstName: "", lastName: "", otherNames: "",
            prisonNumber: "", nationalId: "",
            gender: "male" as "male" | "female",
            nationality: "Ugandan",
            inmateType: "remand" as "remand" | "convict" | "civil",
            status: "remand" as "remand" | "convict" | "at_court" | "released" | "transferred" | "escaped" | "deceased",
            riskLevel: "medium" as "low" | "medium" | "high" | "maximum",
            caseNumber: "",
            cellBlock: "", cellNumber: "",
            nextOfKinName: "", nextOfKinPhone: "", nextOfKinRelationship: "",
            sentenceDuration: "",
            notes: "",
        },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            if (!prisonId) { toast.error("Select a prison"); return }
            if (!offenseId) { toast.error("Select an offense"); return }
            if (!dob) { toast.error("Date of birth is required"); return }
            if (!admissionDate) { toast.error("Admission date is required"); return }

            const inmate = await createInmate({
                ...value,
                dob,
                admissionDate,
                prisonId: prisonId as Id<"prisons">,
                offenseId: offenseId as Id<"offenses">,
                otherNames: value.otherNames || undefined,
                nationalId: value.nationalId || undefined,
                cellBlock: value.cellBlock || undefined,
                cellNumber: value.cellNumber || undefined,
                nextOfKinName: value.nextOfKinName || undefined,
                nextOfKinPhone: value.nextOfKinPhone || undefined,
                nextOfKinRelationship: value.nextOfKinRelationship || undefined,
                sentenceDuration: value.sentenceDuration || undefined,
                nextCourtDate: nextCourtDate || undefined,
                notes: value.notes || undefined,
            })

            if (inmate?._id) {
                setCreatedInmateId(inmate._id)
                setActiveTab("biometrics")
                toast.success("Inmate created — you can now attach photos and fingerprints")
            } else {
                toast.success("Inmate created")
                onDone()
            }
        },
    })

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-5">
                <TabsTrigger value="details" className="flex-1 gap-1.5 text-xs">
                    <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5" />
                    Details
                </TabsTrigger>
                <TabsTrigger value="biometrics" className="flex-1 gap-1.5 text-xs" disabled={!createdInmateId}>
                    <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
                    Biometrics
                    {createdInmateId && (
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3 text-emerald-500 ml-0.5" />
                    )}
                </TabsTrigger>
            </TabsList>

            {/* ── Details tab ─────────────────────────────────────────────── */}
            <TabsContent value="details">
                <form
                    className="space-y-5"
                    onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
                >
                    {/* ── Personal ── */}
                    <FieldSet>
                        <FieldLegend>Personal Information</FieldLegend>
                        <FieldGroup className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="firstName">
                                    {(f) => <TextField field={f} label="First Name" required />}
                                </form.Field>
                                <form.Field name="lastName">
                                    {(f) => <TextField field={f} label="Last Name" required />}
                                </form.Field>
                            </div>

                            <form.Field name="otherNames">
                                {(f) => <TextField field={f} label="Other Names" placeholder="Optional" />}
                            </form.Field>

                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="prisonNumber">
                                    {(f) => <TextField field={f} label="Prison Number" placeholder="LUZ/2024/001" required />}
                                </form.Field>
                                <form.Field name="nationalId">
                                    {(f) => <TextField field={f} label="National ID" />}
                                </form.Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <DateField
                                    label="Date of Birth"
                                    value={dob}
                                    onChange={setDob}
                                    required
                                    toYear={new Date().getFullYear()}
                                />
                                <form.Field name="gender">
                                    {(field) => {
                                        const invalid = field.state.meta.isTouched && !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={invalid} className="gap-1">
                                                <FieldLabel>Gender *</FieldLabel>
                                                <Select
                                                    value={field.state.value}
                                                    onValueChange={(v) => field.handleChange(v as any)}
                                                >
                                                    <SelectTrigger className="rounded"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {invalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>
                            </div>

                            <form.Field name="nationality">
                                {(f) => <TextField field={f} label="Nationality" />}
                            </form.Field>
                        </FieldGroup>
                    </FieldSet>

                    {/* ── Classification ── */}
                    <FieldSet>
                        <FieldLegend>Classification</FieldLegend>
                        <FieldGroup className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="inmateType">
                                    {(field) => (
                                        <Field className="gap-1">
                                            <FieldLabel>Inmate Type *</FieldLabel>
                                            <Select value={field.state.value} onValueChange={(v) => field.handleChange(v as any)}>
                                                <SelectTrigger className="rounded"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="remand">Remand</SelectItem>
                                                    <SelectItem value="convict">Convict</SelectItem>
                                                    <SelectItem value="civil">Civil</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    )}
                                </form.Field>
                                <form.Field name="status">
                                    {(field) => (
                                        <Field className="gap-1">
                                            <FieldLabel>Status *</FieldLabel>
                                            <Select value={field.state.value} onValueChange={(v) => field.handleChange(v as any)}>
                                                <SelectTrigger className="rounded"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {(["remand", "convict", "at_court", "released", "transferred", "escaped", "deceased"] as const).map((s) => (
                                                        <SelectItem key={s} value={s} className="capitalize">
                                                            {s.replace("_", " ")}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    )}
                                </form.Field>
                            </div>

                            <form.Field name="riskLevel">
                                {(field) => (
                                    <Field className="gap-1">
                                        <FieldLabel>Risk Level</FieldLabel>
                                        <Select value={field.state.value} onValueChange={(v) => field.handleChange(v as any)}>
                                            <SelectTrigger className="rounded w-40"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {(["low", "medium", "high", "maximum"] as const).map((r) => (
                                                    <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>
                    </FieldSet>

                    {/* ── Prison Placement ── */}
                    <FieldSet>
                        <FieldLegend>Prison Placement</FieldLegend>
                        <FieldGroup className="space-y-3">
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
                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="cellBlock">
                                    {(f) => <TextField field={f} label="Cell Block" placeholder="e.g. Block A" />}
                                </form.Field>
                                <form.Field name="cellNumber">
                                    {(f) => <TextField field={f} label="Cell Number" placeholder="e.g. 12B" />}
                                </form.Field>
                            </div>
                        </FieldGroup>
                    </FieldSet>

                    {/* ── Case Information ── */}
                    <FieldSet>
                        <FieldLegend>Case Information</FieldLegend>
                        <FieldGroup className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="caseNumber">
                                    {(f) => <TextField field={f} label="Case Number" required />}
                                </form.Field>
                                <DateField
                                    label="Admission Date"
                                    value={admissionDate}
                                    onChange={setAdmissionDate}
                                    required
                                />
                            </div>

                            <Field className="gap-1">
                                <FieldLabel>Offense *</FieldLabel>
                                <RelationSelect
                                    label="Offense"
                                    value={offenseId}
                                    onChange={setOffenseId}
                                    items={offenses}
                                    getLabel={(o) => o.name}
                                    placeholder="Select an offense…"
                                    quickCreateFields={[
                                        { name: "name", placeholder: "Offense name", required: true },
                                        { name: "act", placeholder: "Act (e.g. Penal Code Act)" },
                                        { name: "section", placeholder: "Section" },
                                    ]}
                                    onCreate={async (vals) => {
                                        const o = await createOffense({
                                            name: vals.name,
                                            act: vals.act || undefined,
                                            section: vals.section || undefined,
                                        })
                                        return o!._id
                                    }}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="sentenceDuration">
                                    {(f) => <TextField field={f} label="Sentence Duration" placeholder='e.g. "3 years"' />}
                                </form.Field>
                                <DateField
                                    label="Next Court Date"
                                    value={nextCourtDate}
                                    onChange={setNextCourtDate}
                                />
                            </div>
                        </FieldGroup>
                    </FieldSet>

                    {/* ── Next of Kin ── */}
                    <FieldSet>
                        <FieldLegend>Next of Kin</FieldLegend>
                        <FieldGroup className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="nextOfKinName">
                                    {(f) => <TextField field={f} label="Name" placeholder="Full name" />}
                                </form.Field>
                                <form.Field name="nextOfKinPhone">
                                    {(f) => <TextField field={f} label="Phone" placeholder="+256 …" />}
                                </form.Field>
                            </div>
                            <form.Field name="nextOfKinRelationship">
                                {(f) => <TextField field={f} label="Relationship" placeholder="e.g. Spouse, Parent" />}
                            </form.Field>
                        </FieldGroup>
                    </FieldSet>

                    {/* ── Notes ── */}
                    <FieldSet>
                        <FieldLegend>Notes</FieldLegend>
                        <form.Field name="notes">
                            {(field) => (
                                <Textarea
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Additional notes (optional)"
                                    className="rounded"
                                />
                            )}
                        </form.Field>
                    </FieldSet>

                    <form.Subscribe>
                        {(state) => (
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!state.canSubmit || state.isSubmitting}
                            >
                                {state.isSubmitting ? "Creating…" : "Create Inmate"}
                            </Button>
                        )}
                    </form.Subscribe>
                </form>
            </TabsContent>

            {/* ── Biometrics tab ───────────────────────────────────────────── */}
            <TabsContent value="biometrics">
                <div className="space-y-4">
                    {createdInmateId && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/30 dark:border-emerald-800">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-600 shrink-0" />
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 flex-1">
                                Inmate saved. Photos and fingerprints below are optional.
                            </p>
                            <Button size="sm" variant="outline" className="text-xs shrink-0" onClick={onDone}>
                                Done
                            </Button>
                        </div>
                    )}
                    <BiometricsPanel
                        subjectType="inmate"
                        subjectId={createdInmateId ?? undefined}
                    />
                </div>
            </TabsContent>
        </Tabs>
    )
}