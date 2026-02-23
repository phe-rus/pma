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
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { TextField } from "./form-fields"

export function OffenseForm({ onDone }: { onDone: () => void }) {
    const createOffense = useMutation(api.offenses.create)

    const form = useForm({
        defaultValues: {
            name: "",
            act: "",
            section: "",
            chapter: "",
            category: "" as "felony" | "misdemeanor" | "capital" | "traffic" | "",
            description: "",
            maxSentenceYears: "",
        },
        onSubmit: async ({ value }) => {
            await createOffense({
                name: value.name,
                act: value.act || undefined,
                section: value.section || undefined,
                chapter: value.chapter || undefined,
                category: value.category || undefined,
                description: value.description || undefined,
                maxSentenceYears: value.maxSentenceYears ? Number(value.maxSentenceYears) : undefined,
            })
            toast.success("Offense created")
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
                <FieldLegend>Offense Details</FieldLegend>
                <FieldGroup className="space-y-3">
                    <form.Field name="name">
                        {(f) => (
                            <TextField
                                field={f}
                                label="Offense Name"
                                placeholder="e.g. Aggravated Robbery"
                                required
                            />
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="act">
                            {(f) => <TextField field={f} label="Act" placeholder="e.g. Penal Code Act" />}
                        </form.Field>
                        <form.Field name="section">
                            {(f) => <TextField field={f} label="Section" placeholder="e.g. 285" />}
                        </form.Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <form.Field name="chapter">
                            {(f) => <TextField field={f} label="Chapter" placeholder="e.g. Cap 120" />}
                        </form.Field>
                        <form.Field name="category">
                            {(field) => (
                                <Field className="gap-1">
                                    <FieldLabel>Category</FieldLabel>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(v) => field.handleChange(v as any)}
                                    >
                                        <SelectTrigger className="rounded">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="felony">Felony</SelectItem>
                                            <SelectItem value="misdemeanor">Misdemeanor</SelectItem>
                                            <SelectItem value="capital">Capital</SelectItem>
                                            <SelectItem value="traffic">Traffic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="maxSentenceYears">
                        {(f) => (
                            <TextField
                                field={f}
                                label="Max Sentence (years)"
                                placeholder="0"
                                type="number"
                            />
                        )}
                    </form.Field>

                    <form.Field name="description">
                        {(field) => (
                            <Field className="gap-1">
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Description (optional)"
                                    className="rounded"
                                />
                            </Field>
                        )}
                    </form.Field>
                </FieldGroup>
            </FieldSet>

            <form.Subscribe>
                {(state) => (
                    <Button type="submit" className="w-full" disabled={state.isSubmitting}>
                        {state.isSubmitting ? "Creating…" : "Create Offense"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    )
}