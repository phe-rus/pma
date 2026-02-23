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
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { TextField, DateField } from "./form-fields"
import { RelationSelect } from "./relation-select"

const MOVEMENT_TYPES = [
    { value: "transfer", label: "Transfer" },
    { value: "hospital", label: "Hospital" },
    { value: "court", label: "Court" },
    { value: "work_party", label: "Work Party" },
    { value: "release", label: "Release" },
] as const

type MovementType = typeof MOVEMENT_TYPES[number]["value"]

export function MovementForm({ onDone }: { onDone: () => void }) {
    const createMovement = useMutation(api.recordMovements.create)
    const createPrison = useMutation(api.prisons.create)

    const inmates = useQuery(api.inmate.getAll)
    const officers = useQuery(api.officers.getAll)
    const prisons = useQuery(api.prisons.getAll)

    const [inmateId, setInmateId] = useState("")
    const [fromPrisonId, setFromPrisonId] = useState("")
    const [toPrisonId, setToPrisonId] = useState("")
    const [officerId, setOfficerId] = useState("")
    const [departureDate, setDepartureDate] = useState("")
    const [movementType, setMovementType] = useState<MovementType>("transfer")

    const isTransfer = movementType === "transfer"

    const form = useForm({
        defaultValues: {
            destination: "",
            reason: "",
            notes: "",
        },
        onSubmit: async ({ value }) => {
            if (!inmateId) { toast.error("Select an inmate"); return }
            if (!departureDate) { toast.error("Departure date required"); return }
            if (!value.reason) { toast.error("Reason is required"); return }

            await createMovement({
                inmateId: inmateId as Id<"inmates">,
                movementType,
                departureDate,
                reason: value.reason,
                fromPrisonId: fromPrisonId ? fromPrisonId as Id<"prisons"> : undefined,
                toPrisonId: toPrisonId ? toPrisonId as Id<"prisons"> : undefined,
                officerId: officerId ? officerId as Id<"officers"> : undefined,
                destination: value.destination || undefined,
                notes: value.notes || undefined,
            })
            toast.success("Movement recorded")
            form.reset()
            onDone()
        },
    })

    return (
        <form
            className="space-y-5"
            onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
        >
            {/* ── Core ── */}
            <FieldSet>
                <FieldLegend>Movement Details</FieldLegend>
                <FieldGroup className="space-y-3">
                    <Field className="gap-1">
                        <FieldLabel>Inmate *</FieldLabel>
                        <RelationSelect
                            label="Inmate"
                            value={inmateId}
                            onChange={setInmateId}
                            items={inmates}
                            getLabel={(i) => `${i.firstName} ${i.lastName} — ${i.prisonNumber}`}
                            placeholder="Select an inmate…"
                        />
                    </Field>

                    <Field className="gap-1">
                        <FieldLabel>Movement Type *</FieldLabel>
                        <Select
                            value={movementType}
                            onValueChange={(v) => setMovementType(v as MovementType)}
                        >
                            <SelectTrigger className="rounded">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MOVEMENT_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <DateField
                        label="Departure Date"
                        value={departureDate}
                        onChange={setDepartureDate}
                        required
                    />
                </FieldGroup>
            </FieldSet>

            {/* ── Prisons (always shown, required for transfer) ── */}
            <FieldSet>
                <FieldLegend>Locations</FieldLegend>
                <FieldGroup className="space-y-3">
                    <Field className="gap-1">
                        <FieldLabel>From Prison{isTransfer && " *"}</FieldLabel>
                        <RelationSelect
                            label="Prison"
                            value={fromPrisonId}
                            onChange={setFromPrisonId}
                            items={prisons}
                            getLabel={(p) => `${p.name} (${p.code})`}
                            placeholder="Select origin prison…"
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

                    {isTransfer ? (
                        <Field className="gap-1">
                            <FieldLabel>To Prison *</FieldLabel>
                            <RelationSelect
                                label="Prison"
                                value={toPrisonId}
                                onChange={setToPrisonId}
                                items={prisons}
                                getLabel={(p) => `${p.name} (${p.code})`}
                                placeholder="Select destination prison…"
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
                    ) : (
                        <form.Field name="destination">
                            {(f) => (
                                <TextField
                                    field={f}
                                    label="Destination"
                                    placeholder="e.g. Mulago Hospital, Kampala Magistrates Court"
                                />
                            )}
                        </form.Field>
                    )}
                </FieldGroup>
            </FieldSet>

            {/* ── Officer ── */}
            <FieldSet>
                <FieldLegend>Escorting Officer</FieldLegend>
                <FieldGroup>
                    <Field className="gap-1">
                        <FieldLabel>Officer</FieldLabel>
                        <RelationSelect
                            label="Officer"
                            value={officerId}
                            onChange={setOfficerId}
                            items={officers}
                            getLabel={(o) => `${o.name} — ${o.badgeNumber}`}
                            placeholder="Select officer (optional)…"
                        />
                    </Field>
                </FieldGroup>
            </FieldSet>

            {/* ── Reason / Notes ── */}
            <FieldSet>
                <FieldLegend>Reason & Notes</FieldLegend>
                <FieldGroup className="space-y-3">
                    <form.Field name="reason">
                        {(field) => (
                            <Field className="gap-1">
                                <FieldLabel>Reason *</FieldLabel>
                                <Textarea
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Reason for movement"
                                    className="rounded"
                                    rows={2}
                                />
                            </Field>
                        )}
                    </form.Field>
                    <form.Field name="notes">
                        {(field) => (
                            <Field className="gap-1">
                                <FieldLabel>Notes</FieldLabel>
                                <Textarea
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Additional notes (optional)"
                                    className="rounded"
                                    rows={2}
                                />
                            </Field>
                        )}
                    </form.Field>
                </FieldGroup>
            </FieldSet>

            <form.Subscribe>
                {(state) => (
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!state.canSubmit || state.isSubmitting}
                    >
                        {state.isSubmitting ? "Recording…" : "Record Movement"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}