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

export function CourtForm({ onDone }: { onDone: () => void }) {
    const createCourt = useMutation(api.courtAppearances.createCourt)

    const form = useForm({
        defaultValues: {
            name: "",
            type: "" as "magistrate" | "high" | "chief_magistrate" | "industrial_court" | "",
            district: "",
            address: "",
        },
        onSubmit: async ({ value }) => {
            await createCourt({
                name: value.name,
                type: value.type || undefined,
                district: value.district || undefined,
                address: value.address || undefined,
            })
            toast.success("Court created")
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
                <FieldLegend>Court Details</FieldLegend>
                <FieldGroup className="space-y-3">
                    <form.Field name="name">
                        {(f) => (
                            <TextField
                                field={f}
                                label="Court Name"
                                placeholder="e.g. Kampala Chief Magistrates Court"
                                required
                            />
                        )}
                    </form.Field>

                    <form.Field name="type">
                        {(field) => (
                            <Field className="gap-1">
                                <FieldLabel>Court Type</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(v) => field.handleChange(v as any)}
                                >
                                    <SelectTrigger className="rounded w-56">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="magistrate">Magistrate</SelectItem>
                                        <SelectItem value="high">High Court</SelectItem>
                                        <SelectItem value="chief_magistrate">Chief Magistrate</SelectItem>
                                        <SelectItem value="industrial_court">Industrial Court</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="district">
                            {(f) => <TextField field={f} label="District" />}
                        </form.Field>
                        <form.Field name="address">
                            {(f) => <TextField field={f} label="Address" />}
                        </form.Field>
                    </div>
                </FieldGroup>
            </FieldSet>

            <form.Subscribe>
                {(state) => (
                    <Button type="submit" className="w-full" disabled={state.isSubmitting}>
                        {state.isSubmitting ? "Creating…" : "Create Court"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}