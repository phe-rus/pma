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

export function VisitorForm({ onDone }: { onDone: () => void }) {
    const scheduleVisit = useMutation(api.inmateVisits.schedule)
    const inmates = useQuery(api.inmate.getAll)
    const prisons = useQuery(api.prisons.getAll)

    const [inmateId, setInmateId] = useState("")
    const [prisonId, setPrisonId] = useState("")
    const [scheduledDate, setScheduledDate] = useState("")

    const form = useForm({
        defaultValues: {
            fullName: "",
            idNumber: "",
            idType: "" as "national_id" | "passport" | "driving_permit" | "",
            relationship: "",
            phone: "",
            address: "",
            email: "",
            reason: "",
            itemsDeclaration: "",
        },
        onSubmit: async ({ value }) => {
            if (!inmateId) { toast.error("Select an inmate"); return }
            if (!prisonId) { toast.error("Select a prison"); return }

            await scheduleVisit({
                inmateId: inmateId as Id<"inmates">,
                prisonId: prisonId as Id<"prisons">,
                fullName: value.fullName,
                idNumber: value.idNumber,
                idType: value.idType || undefined,
                relationship: value.relationship,
                phone: value.phone,
                address: value.address || undefined,
                email: value.email || undefined,
                reason: value.reason || undefined,
                scheduledDate: scheduledDate || undefined,
                itemsDeclaration: value.itemsDeclaration || undefined,
                status: "scheduled",
            })
            toast.success("Visit scheduled")
            form.reset()
            onDone()
        },
    })

    return (
        <form
            className="space-y-5"
            onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
        >
            {/* ── Inmate & Prison ── */}
            <FieldSet>
                <FieldLegend>Visit Assignment</FieldLegend>
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
                        <FieldLabel>Prison *</FieldLabel>
                        <RelationSelect
                            label="Prison"
                            value={prisonId}
                            onChange={setPrisonId}
                            items={prisons}
                            getLabel={(p) => `${p.name} (${p.code})`}
                            placeholder="Select a prison…"
                        />
                    </Field>
                    <DateField
                        label="Scheduled Date"
                        value={scheduledDate}
                        onChange={setScheduledDate}
                    />
                </FieldGroup>
            </FieldSet>

            {/* ── Visitor Info ── */}
            <FieldSet>
                <FieldLegend>Visitor Information</FieldLegend>
                <FieldGroup className="space-y-3">
                    <form.Field name="fullName">
                        {(f) => <TextField field={f} label="Full Name" required />}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="idNumber">
                            {(f) => <TextField field={f} label="ID Number" required />}
                        </form.Field>
                        <form.Field name="idType">
                            {(field) => (
                                <Field className="gap-1">
                                    <FieldLabel>ID Type</FieldLabel>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(v) => field.handleChange(v as any)}
                                    >
                                        <SelectTrigger className="rounded">
                                            <SelectValue placeholder="Select…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="national_id">National ID</SelectItem>
                                            <SelectItem value="passport">Passport</SelectItem>
                                            <SelectItem value="driving_permit">Driving Permit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        </form.Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="relationship">
                            {(f) => <TextField field={f} label="Relationship" placeholder="e.g. Spouse, Parent" required />}
                        </form.Field>
                        <form.Field name="phone">
                            {(f) => <TextField field={f} label="Phone" placeholder="+256 …" required />}
                        </form.Field>
                    </div>

                    <form.Field name="address">
                        {(f) => <TextField field={f} label="Address" placeholder="Home address (optional)" />}
                    </form.Field>

                    <form.Field name="email">
                        {(f) => <TextField field={f} label="Email" placeholder="email@example.com (optional)" />}
                    </form.Field>
                </FieldGroup>
            </FieldSet>

            {/* ── Visit Details ── */}
            <FieldSet>
                <FieldLegend>Visit Details</FieldLegend>
                <FieldGroup className="space-y-3">
                    <form.Field name="reason">
                        {(field) => (
                            <Field className="gap-1">
                                <FieldLabel>Reason for Visit</FieldLabel>
                                <Textarea
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Purpose of visit (optional)"
                                    className="rounded"
                                    rows={2}
                                />
                            </Field>
                        )}
                    </form.Field>

                    <form.Field name="itemsDeclaration">
                        {(field) => (
                            <Field className="gap-1">
                                <FieldLabel>Items to Bring</FieldLabel>
                                <Textarea
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="List items being brought in (optional)"
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
                        {state.isSubmitting ? "Scheduling…" : "Schedule Visit"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}