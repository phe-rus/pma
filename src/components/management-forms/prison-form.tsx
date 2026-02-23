import { useForm } from "@tanstack/react-form"
import { useMutation } from "convex/react"
import { api } from "convex/_generated/api"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { TextField } from "./form-fields"

export function PrisonForm({ onDone }: { onDone: () => void }) {
    const createPrison = useMutation(api.prisons.create)

    const form = useForm({
        defaultValues: {
            name: "",
            code: "",
            type: "main" as "main" | "remand" | "open" | "farm" | "branch",
            region: "",
            district: "",
            address: "",
            capacity: "",
            contactPhone: "",
        },
        onSubmit: async ({ value }) => {
            await createPrison({
                name: value.name,
                code: value.code,
                type: value.type,
                region: value.region || undefined,
                district: value.district || undefined,
                address: value.address || undefined,
                capacity: value.capacity ? Number(value.capacity) : undefined,
                contactPhone: value.contactPhone || undefined,
            })
            toast.success("Prison created")
            form.reset()
            onDone()
        },
    })

    return (
        <form
            className="space-y-5"
            onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
        >
            <FieldSet>
                <FieldLegend>Facility Details</FieldLegend>
                <FieldGroup className="space-y-3">
                    <form.Field name="name">
                        {(f) => <TextField field={f} label="Prison Name" placeholder="e.g. Luzira Upper Prison" required />}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="code">
                            {(f) => <TextField field={f} label="Code" placeholder="e.g. LUP" required />}
                        </form.Field>
                        <form.Field name="type">
                            {(field) => (
                                <Field className="gap-1">
                                    <FieldLabel>Type *</FieldLabel>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(v) => field.handleChange(v as any)}
                                    >
                                        <SelectTrigger className="rounded"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {(["main", "remand", "open", "farm", "branch"] as const).map((t) => (
                                                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        </form.Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="region">
                            {(f) => <TextField field={f} label="Region" placeholder="e.g. Central" />}
                        </form.Field>
                        <form.Field name="district">
                            {(f) => <TextField field={f} label="District" />}
                        </form.Field>
                    </div>

                    <form.Field name="address">
                        {(f) => <TextField field={f} label="Address" />}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="capacity">
                            {(f) => <TextField field={f} label="Capacity" placeholder="Max inmates" type="number" />}
                        </form.Field>
                        <form.Field name="contactPhone">
                            {(f) => <TextField field={f} label="Contact Phone" placeholder="+256 …" />}
                        </form.Field>
                    </div>
                </FieldGroup>
            </FieldSet>

            <form.Subscribe>
                {(state) => (
                    <Button type="submit" className="w-full" disabled={state.isSubmitting}>
                        {state.isSubmitting ? "Creating…" : "Create Prison"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}