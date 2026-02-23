import { format } from "date-fns/format"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChevronDown } from "@hugeicons/core-free-icons"

export function DateField({
    label,
    value,
    onChange,
    required,
    fromYear = 1900,
    toYear = new Date().getFullYear(),
}: {
    label: string
    value: string
    onChange: (v: string) => void
    required?: boolean
    fromYear?: number
    toYear?: number
}) {
    const date = value ? new Date(value) : undefined

    return (
        <Field className="gap-1">
            <FieldLabel>
                {label}{required && " *"}
            </FieldLabel>
            <Popover>
                <PopoverTrigger
                    data-empty={!date}
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal rounded"
                    )}
                >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <HugeiconsIcon icon={ChevronDown} data-icon="inline-end" />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => onChange(d?.toString() ?? "")}
                        defaultMonth={date}
                        captionLayout="dropdown"
                        fromYear={fromYear}
                        toYear={toYear}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </Field>
    )
}

// ─── TextField ────────────────────────────────────────────────────────────────
// Accepts a tanstack-form field object directly

export function TextField({
    field,
    label,
    placeholder,
    required,
    type = "text",
}: {
    field: any
    label: string
    placeholder?: string
    required?: boolean
    type?: string
}) {
    const invalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <Field data-invalid={invalid} className="gap-1">
            <FieldLabel>
                {label}{required && " *"}
            </FieldLabel>
            <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder ?? label}
                type={type}
                className="rounded"
            />
            {invalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}