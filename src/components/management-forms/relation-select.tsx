import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export type QuickCreateField = {
    name: string
    placeholder: string
    required?: boolean
}

export function QuickCreate({
    label,
    fields,
    onCreated,
    onCancel,
}: {
    label: string
    fields: QuickCreateField[]
    onCreated: (values: Record<string, string>) => Promise<void>
    onCancel: () => void
}) {
    const [values, setValues] = useState<Record<string, string>>(
        Object.fromEntries(fields.map((f) => [f.name, ""]))
    )
    const [loading, setLoading] = useState(false)

    return (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
                Quick-create {label}
            </p>
            {fields.map((f) => (
                <Input
                    key={f.name}
                    placeholder={f.placeholder}
                    value={values[f.name]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className="rounded h-8 text-sm"
                />
            ))}
            <div className="flex gap-2 pt-1">
                <Button
                    type="button"
                    size="xs"
                    disabled={loading}
                    className="gap-1 rounded"
                    onClick={async () => {
                        setLoading(true)
                        try { await onCreated(values) }
                        finally { setLoading(false) }
                    }}
                >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
                    {loading ? "Creating…" : "Create"}
                </Button>
                <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={onCancel}
                    className="rounded gap-1"
                >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                    Cancel
                </Button>
            </div>
        </div>
    )
}

export function RelationSelect<T extends { _id: string;[k: string]: any }>({
    label,
    value,
    onChange,
    items,
    getLabel,
    onCreate,
    quickCreateFields,
    placeholder = "Select…",
}: {
    label: string
    value: string
    onChange: (id: string) => void
    items: T[] | undefined
    getLabel: (item: T) => string
    onCreate?: (values: Record<string, string>) => Promise<string>
    quickCreateFields?: QuickCreateField[]
    placeholder?: string
}) {
    const [showCreate, setShowCreate] = useState(false)

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Select value={value} onValueChange={(v) => onChange(v!!)}>
                    <SelectTrigger className="rounded flex-1">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {(items ?? []).map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                                {getLabel(item)}
                            </SelectItem>
                        ))}
                        {(!items || items.length === 0) && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                No {label.toLowerCase()}s found
                            </div>
                        )}
                    </SelectContent>
                </Select>
                {onCreate && quickCreateFields && (
                    <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        className="shrink-0 rounded"
                        title={`Create new ${label}`}
                        onClick={() => setShowCreate((v) => !v)}
                    >
                        <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                    </Button>
                )}
            </div>
            {showCreate && quickCreateFields && (
                <QuickCreate
                    label={label}
                    fields={quickCreateFields}
                    onCreated={async (vals) => {
                        if (!onCreate) return
                        const id = await onCreate(vals)
                        onChange(id)
                        setShowCreate(false)
                        toast.success(`${label} created`)
                    }}
                    onCancel={() => setShowCreate(false)}
                />
            )}
        </div>
    )
}