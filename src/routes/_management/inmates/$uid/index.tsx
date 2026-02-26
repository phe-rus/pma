import { useState, useRef } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, differenceInDays, differenceInMonths, differenceInYears, isFuture, isPast } from 'date-fns'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    ArrowLeft02Icon, Download01Icon, PrinterIcon, Edit01Icon,
    Building04Icon, Calendar03Icon, UserMultiple02Icon,
    File01Icon, MedicineIcon,
    JusticeScale01Icon as JusticeHammerIcon,
    ArrowRight02Icon as ArrowMoveLeftRight02Icon,
    FingerPrintAddIcon as Fingerprint02Icon, CheckmarkCircle02Icon, AlertCircleIcon,
    Location01Icon, PhoneCall as PhoneCallIcon, InformationCircleIcon, BoxingBagIcon,
    ShieldUserIcon, CellsIcon, FloppyDiskIcon, Cancel01Icon,
} from '@hugeicons/core-free-icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SheetApplication } from '@/components/management-forms'
import { statusConfig, riskConfig, getInitials, avatarColor, StatusBadge, RiskBadge } from '../index'

export const Route = createFileRoute('/_management/inmates/$uid/')({
    component: RouteComponent,
})

function calcAge(dob: string) {
    return differenceInYears(new Date(), new Date(dob))
}

function timeServed(from: string) {
    const days = differenceInDays(new Date(), new Date(from))
    const months = differenceInMonths(new Date(), new Date(from))
    const years = differenceInYears(new Date(), new Date(from))
    if (years >= 1) return `${years} yr${years > 1 ? 's' : ''} ${months - years * 12} mo`
    if (months >= 1) return `${months} mo ${days - months * 30} d`
    return `${days} days`
}

// ─── Inline editable field ────────────────────────────────────────────────────

function EditField({
    label, value, fieldKey, inmateId, editing,
    multiline = false, type = 'text',
}: {
    label: string; value?: string | number | null; fieldKey: string
    inmateId: Id<'inmates'>; editing: boolean; multiline?: boolean; type?: string
}) {
    const updateInmate = useMutation(api.inmate.update)
    const [draft, setDraft] = useState(String(value ?? ''))
    const [busy, setBusy] = useState(false)

    const display = value != null && String(value).trim() ? String(value) : null

    if (!editing) {
        return (
            <div className="space-y-0.5">
                <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">{label}</p>
                <p className={cn('text-sm', !display && 'text-muted-foreground italic')}>{display ?? 'Not recorded'}</p>
            </div>
        )
    }

    const save = async () => {
        setBusy(true)
        try {
            await updateInmate({ id: inmateId, patch: { [fieldKey]: draft.trim() || undefined } })
            toast.success(`${label} updated`)
        } catch (e: any) { toast.error(e.message) }
        setBusy(false)
    }

    return (
        <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">{label}</p>
            <div className="flex gap-1.5">
                {multiline ? (
                    <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        rows={2}
                        className="flex-1 rounded border border-border bg-background px-2.5 py-1.5 text-sm resize-none"
                    />
                ) : (
                    <input
                        type={type}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        className="flex-1 h-8 rounded border border-border bg-background px-2.5 text-sm"
                    />
                )}
                <button onClick={save} disabled={busy} title="Save" className="inline-flex size-8 shrink-0 items-center justify-center rounded border border-border hover:bg-primary/5 text-primary disabled:opacity-40">
                    <HugeiconsIcon icon={FloppyDiskIcon} className="size-3.5" />
                </button>
            </div>
        </div>
    )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ icon, title, sub, color = 'bg-primary/10 text-primary', children, defaultOpen = false }: {
    icon: any; title: string; sub?: string; color?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors"
            >
                <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-xl', color)}>
                    <HugeiconsIcon icon={icon} className="size-4.5" />
                </span>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold">{title}</p>
                    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                </div>
                <span className={cn('size-5 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}>
                    ▾
                </span>
            </button>
            {open && (
                <div className="border-t border-border/60 px-5 py-5">
                    {children}
                </div>
            )}
        </div>
    )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ value, label, sub, highlight }: { value: string | number; label: string; sub?: string; highlight?: boolean }) {
    return (
        <div className={cn('rounded-xl border px-4 py-3 text-center', highlight ? 'border-primary/20 bg-primary/5' : 'border-border/60 bg-sidebar/50')}>
            <p className={cn('text-2xl font-bold tabular-nums', highlight && 'text-primary')}>{value}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
        </div>
    )
}

// ─── PDF generator ────────────────────────────────────────────────────────────

async function downloadProfilePDF(data: any) {
    const tid = toast.loading('Generating inmate file…', { duration: Infinity })
    try {
        const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
        const doc = new jsPDF()
        const W = doc.internal.pageSize.getWidth()
        const inmate = data
        const prison = data.prison
        const offense = data.offense

        // ── Cover header ──
        doc.setFillColor(15, 23, 42); doc.rect(0, 0, W, 38, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(15); doc.setFont('helvetica', 'bold')
        doc.text('UGANDA PRISONS SERVICE', W / 2, 12, { align: 'center' })
        doc.setFontSize(10); doc.setFont('helvetica', 'normal')
        doc.text('INMATE FILE RECORD  —  OFFICIAL / CONFIDENTIAL', W / 2, 21, { align: 'center' })
        doc.setFontSize(8)
        doc.text(`Generated: ${new Date().toLocaleString('en-UG')}   Prison No: ${inmate.prisonNumber}`, W / 2, 30, { align: 'center' })

        // ── Status + risk chips ──
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0)
        doc.text(`STATUS: ${inmate.status?.toUpperCase()}   RISK: ${inmate.riskLevel?.toUpperCase() ?? 'N/A'}   TYPE: ${inmate.inmateType?.toUpperCase()}`, 14, 46)
        doc.setFont('helvetica', 'normal')

        let y = 54

        const section = (title: string) => {
            if (y > 250) { doc.addPage(); y = 18 }
            doc.setFillColor(30, 41, 59); doc.rect(0, y - 4, W, 8, 'F')
            doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
            doc.text(title, 14, y + 1)
            doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5)
            y += 10
        }

        const rows2col = (pairs: [string, string][]) => {
            autoTable(doc, {
                startY: y, body: pairs, theme: 'plain',
                styles: { fontSize: 8.5, cellPadding: 2 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 }, 1: { cellWidth: 70 } },
            })
            y = (doc as any).lastAutoTable.finalY + 4
        }

        // Personal
        section('PERSONAL INFORMATION')
        rows2col([
            ['Prison Number:', inmate.prisonNumber],
            ['Full Name:', `${inmate.firstName}${inmate.otherNames ? ' ' + inmate.otherNames : ''} ${inmate.lastName}`],
            ['National ID:', inmate.nationalId ?? 'N/A'],
            ['Date of Birth:', inmate.dob ? format(new Date(inmate.dob), 'dd MMMM yyyy') : 'N/A'],
            ['Age:', inmate.dob ? String(calcAge(inmate.dob)) + ' years' : 'N/A'],
            ['Gender:', inmate.gender],
            ['Nationality:', inmate.nationality ?? 'N/A'],
            ['Tribe:', inmate.tribe ?? 'N/A'],
            ['Religion:', inmate.religion ?? 'N/A'],
            ['Marital Status:', inmate.maritalStatus ?? 'N/A'],
            ['Education:', inmate.educationLevel ?? 'N/A'],
            ['Occupation:', inmate.occupation ?? 'N/A'],
        ])

        section('NEXT OF KIN')
        rows2col([
            ['Name:', inmate.nextOfKinName ?? 'N/A'],
            ['Phone:', inmate.nextOfKinPhone ?? 'N/A'],
            ['Relationship:', inmate.nextOfKinRelationship ?? 'N/A'],
        ])

        section('LOCATION & CUSTODY')
        rows2col([
            ['Current Prison:', prison?.name ?? 'N/A'],
            ['Cell Block:', inmate.cellBlock ?? 'N/A'],
            ['Cell Number:', inmate.cellNumber ?? 'N/A'],
            ['Admission Date:', inmate.admissionDate ? format(new Date(inmate.admissionDate), 'dd MMMM yyyy') : 'N/A'],
            ['Time Served:', inmate.admissionDate ? timeServed(inmate.admissionDate) : 'N/A'],
        ])

        section('CASE INFORMATION')
        rows2col([
            ['Case Number:', inmate.caseNumber],
            ['Offense:', offense?.name ?? 'N/A'],
            ['Offense Category:', offense?.category ?? 'N/A'],
            ['Arresting Station:', inmate.arrestingStation ?? 'N/A'],
            ['Conviction Date:', inmate.convictionDate ?? 'Not convicted'],
            ['Sentence Start:', inmate.sentenceStart ?? 'N/A'],
            ['Sentence End:', inmate.sentenceEnd ?? 'N/A'],
            ['Life Sentence:', inmate.isLifeSentence ? 'YES' : 'No'],
            ['Fine Amount:', inmate.fineAmount ? `UGX ${inmate.fineAmount.toLocaleString()}` : 'None'],
            ['Fine Paid:', inmate.finePaid ? 'YES' : 'NO'],
        ])

        if (data.medicalRecords?.length) {
            doc.addPage(); y = 18
            section('MEDICAL RECORDS')
            autoTable(doc, {
                startY: y,
                head: [['Date', 'Type', 'Diagnosis', 'Treatment', 'Attended By']],
                body: data.medicalRecords.map((r: any) => [r.recordDate, r.recordType, r.diagnosis ?? '—', r.treatment ?? '—', r.attendedBy ?? '—']),
                theme: 'striped',
                headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 7.5 },
            })
            y = (doc as any).lastAutoTable.finalY + 6
        }

        if (data.courtAppearances?.length) {
            section('COURT APPEARANCES')
            autoTable(doc, {
                startY: y,
                head: [['Date', 'Court', 'Outcome', 'Next Date', 'Notes']],
                body: data.courtAppearances.map((a: any) => [a.scheduledDate, a.court?.name ?? '—', a.outcome ?? 'Pending', a.nextDate ?? '—', a.notes ?? '—']),
                theme: 'striped',
                headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 7.5 },
            })
            y = (doc as any).lastAutoTable.finalY + 6
        }

        if (data.itemsInCustody?.length) {
            section('ITEMS IN CUSTODY')
            autoTable(doc, {
                startY: y,
                head: [['Item', 'Description', 'Condition', 'Value', 'Status']],
                body: data.itemsInCustody.map((i: any) => [i.name, i.description ?? '—', i.condition ?? '—', i.value ? `UGX ${i.value.toLocaleString()}` : '—', i.returnedAt ? 'Returned' : 'In Storage']),
                theme: 'striped',
                headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 7.5 },
            })
        }

        // Footer
        const pages = doc.getNumberOfPages()
        for (let p = 1; p <= pages; p++) {
            doc.setPage(p); doc.setFontSize(7); doc.setTextColor(140, 140, 140)
            doc.text(`Page ${p} of ${pages}  —  Uganda Prisons Service — Official Use Only`, W / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' })
        }

        const filename = `inmate-${inmate.prisonNumber}-${inmate.lastName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__

        if (isTauri) {
            const { save } = await import('@tauri-apps/plugin-dialog')
            const { writeFile } = await import('@tauri-apps/plugin-fs')
            const savePath = await save({ defaultPath: filename, filters: [{ name: 'PDF', extensions: ['pdf'] }] })
            if (savePath) {
                await writeFile(savePath, new Uint8Array(doc.output('arraybuffer')))
                toast.success('Inmate file saved to disk', { id: tid })
            } else {
                toast.dismiss(tid)
            }
        } else {
            doc.save(filename)
            toast.success('Inmate file downloaded', { id: tid })
        }
    } catch (e: any) {
        toast.error(`PDF failed: ${e.message}`, { id: tid })
    }
}

// ─── Route component ──────────────────────────────────────────────────────────

function RouteComponent() {
    const { uid } = Route.useParams()
    const [editing, setEditing] = useState(false)

    const data = useQuery(api.relations.getInmateWithRelations, { id: uid as Id<'inmates'> })

    if (data === undefined) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading inmate file…</p>
            </div>
        )
    }

    if (data === null) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-lg font-bold">Inmate not found</p>
                <Link to="/inmates" className={buttonVariants({ variant: 'outline', size: 'sm' })}>← Back to list</Link>
            </div>
        )
    }

    const id = uid as Id<'inmates'>

    const age = data.dob ? calcAge(data.dob) : null
    const daysInside = data.admissionDate ? differenceInDays(new Date(), new Date(data.admissionDate)) : 0
    const photoCount = data.photos?.length ?? 0
    const fpCount = data.fingerprints?.length ?? 0
    const primaryPhoto = data.primaryPhoto

    const upcomingCourt = data.courtAppearances
        ?.filter((a: any) => !a.outcome && isFuture(new Date(a.scheduledDate)))
        .sort((a: any, b: any) => a.scheduledDate.localeCompare(b.scheduledDate))[0]

    const overdueCourt = data.courtAppearances
        ?.filter((a: any) => !a.outcome && isPast(new Date(a.scheduledDate)))

    const fingers = ['right_thumb', 'right_index', 'right_middle', 'right_ring', 'right_little', 'left_thumb', 'left_index', 'left_middle', 'left_ring', 'left_little']

    const outcomeColors: Record<string, string> = {
        adjourned: 'bg-amber-50 text-amber-700 border-amber-200',
        convicted: 'bg-red-50 text-red-700 border-red-200',
        acquitted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bail_granted: 'bg-sky-50 text-sky-700 border-sky-200',
        remanded: 'bg-orange-50 text-orange-700 border-orange-200',
    }

    return (
        <article className="flex flex-col gap-4 py-5 md:max-w-3xl w-full mx-auto">

            {/* ── Top nav ── */}
            <div className="flex items-center gap-2">
                <Link to="/inmates" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 -ml-1')}>
                    <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
                    Inmates
                </Link>
                <div className="ml-auto flex items-center gap-1.5">
                    <Button
                        variant={editing ? 'default' : 'outline'} size="sm"
                        className="gap-1.5"
                        onClick={() => { setEditing(e => !e); if (editing) toast.success('Edit mode off') }}
                    >
                        <HugeiconsIcon icon={editing ? Cancel01Icon : Edit01Icon} className="size-4" />
                        {editing ? 'Done editing' : 'Edit'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadProfilePDF(data)}>
                        <HugeiconsIcon icon={Download01Icon} className="size-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* ── Hero card ── */}
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                {/* Background band */}
                <div className="h-24 bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 relative">
                    {/* Status + risk in corner */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <StatusBadge status={data.status} />
                        {data.riskLevel && <RiskBadge level={data.riskLevel} />}
                    </div>
                    {/* Escaped/overdue alert */}
                    {data.status === 'escaped' && (
                        <div className="absolute bottom-0 inset-x-0 bg-orange-500/90 text-white text-xs font-semibold px-4 py-1 flex items-center gap-2">
                            <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 shrink-0" />
                            ESCAPED — Report sighting to authorities immediately
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 -mt-12">
                    <div className="flex items-end gap-4 mb-4">
                        {/* Avatar or photo */}
                        <div className="relative shrink-0">
                            {primaryPhoto?.externalUrl || primaryPhoto?.base64Preview ? (
                                <img
                                    src={primaryPhoto.externalUrl ?? `data:image/jpeg;base64,${primaryPhoto.base64Preview}`}
                                    alt="Mugshot"
                                    className="size-20 rounded-xl object-cover border-4 border-background shadow-lg"
                                />
                            ) : (
                                <div className={cn('size-20 rounded-xl border-4 border-background shadow-lg inline-flex items-center justify-center text-2xl font-bold', avatarColor(uid))}>
                                    {getInitials(data.firstName, data.lastName)}
                                </div>
                            )}
                            {photoCount > 1 && (
                                <span className="absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border border-background">
                                    {photoCount}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 pt-12">
                            <h1 className="text-xl font-bold leading-tight">
                                {data.firstName}{data.otherNames ? ` ${data.otherNames}` : ''} {data.lastName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="secondary" className="font-mono text-xs">{data.prisonNumber}</Badge>
                                <span className={cn('text-xs font-medium px-2 py-0.5 rounded capitalize', data.gender === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700')}>
                                    {data.gender}
                                </span>
                                <span className="text-xs text-muted-foreground">Case {data.caseNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* Offense banner */}
                    {data.offense && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 flex items-start gap-3 mb-4 dark:bg-rose-950/20 dark:border-rose-900">
                            <HugeiconsIcon icon={JusticeHammerIcon} className="size-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-rose-900 dark:text-rose-300">{data.offense.name}</p>
                                <p className="text-xs text-rose-600 dark:text-rose-400 capitalize mt-0.5">
                                    {data.offense.category && `${data.offense.category} offense`}
                                    {data.offense.act && ` · ${data.offense.act}`}
                                    {data.offense.section && ` §${data.offense.section}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <StatCard value={age ?? '—'} label="Age" sub={data.dob ? format(new Date(data.dob), 'dd MMM yyyy') : undefined} />
                        <StatCard value={daysInside.toLocaleString()} label="Days inside" sub={data.admissionDate ? timeServed(data.admissionDate) : undefined} highlight />
                        <StatCard value={`${fpCount}/10`} label="Fingerprints" sub={`${photoCount} photo${photoCount !== 1 ? 's' : ''}`} />
                        <StatCard
                            value={data.courtAppearances?.length ?? 0}
                            label="Court appearances"
                            sub={upcomingCourt ? `Next: ${format(new Date(upcomingCourt.scheduledDate), 'MMM d')}` : 'None upcoming'}
                        />
                    </div>
                </div>
            </div>

            {/* Overdue court alert */}
            {overdueCourt && overdueCourt.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                        <span className="font-semibold">{overdueCourt.length} court appearance{overdueCourt.length > 1 ? 's' : ''}</span>{' '}
                        overdue with no outcome recorded. Record outcomes on the{' '}
                        <Link to="/courts" className="underline underline-offset-2">Courts page</Link>.
                    </p>
                </div>
            )}

            {/* ── Current location banner ── */}
            <div className="rounded-xl border border-border/60 bg-sidebar/50 px-5 py-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <HugeiconsIcon icon={Building04Icon} className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Current Prison</p>
                        <p className="text-sm font-semibold truncate">{data.prison?.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{data.prison?.code}{data.prison?.type && ` · ${data.prison.type}`}</p>
                    </div>
                </div>
                <Separator orientation="vertical" className="h-10 hidden sm:block" />
                <div className="flex items-center gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <HugeiconsIcon icon={CellsIcon} className="size-4" />
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Cell</p>
                        <p className="text-sm font-semibold">
                            Block {data.cellBlock ?? '—'} · Cell {data.cellNumber ?? '—'}
                        </p>
                    </div>
                </div>
                <div className="ml-auto">
                    <Sheet>
                        <SheetTrigger className={cn(buttonVariants({ size: 'xs', variant: 'outline' }), 'gap-1.5')}>
                            <HugeiconsIcon icon={JusticeHammerIcon} className="size-3.5" />
                            Schedule court
                        </SheetTrigger>
                        <SheetApplication defaultCategory="court-appearance" />
                    </Sheet>
                </div>
            </div>

            {/* ── Sections ── */}
            <div className="flex flex-col gap-3">

                {/* Personal */}
                <Section icon={ShieldUserIcon} title="Personal Details" sub="Identity, demographics, background" color="bg-blue-100 text-blue-700" defaultOpen>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                        <EditField label="National ID" value={data.nationalId} fieldKey="nationalId" inmateId={id} editing={editing} />
                        <EditField label="Date of Birth" value={data.dob} fieldKey="dob" inmateId={id} editing={editing} type="date" />
                        <EditField label="Nationality" value={data.nationality} fieldKey="nationality" inmateId={id} editing={editing} />
                        <EditField label="Tribe / Ethnicity" value={data.tribe} fieldKey="tribe" inmateId={id} editing={editing} />
                        <EditField label="Religion" value={data.religion} fieldKey="religion" inmateId={id} editing={editing} />
                        <EditField label="Marital Status" value={data.maritalStatus} fieldKey="maritalStatus" inmateId={id} editing={editing} />
                        <EditField label="Education Level" value={data.educationLevel} fieldKey="educationLevel" inmateId={id} editing={editing} />
                        <EditField label="Occupation" value={data.occupation} fieldKey="occupation" inmateId={id} editing={editing} />
                    </div>
                    {data.notes && (
                        <>
                            <Separator className="my-4" />
                            <EditField label="Notes" value={data.notes} fieldKey="notes" inmateId={id} editing={editing} multiline />
                        </>
                    )}
                </Section>

                {/* Next of kin */}
                <Section icon={PhoneCallIcon} title="Next of Kin" sub="Emergency contact" color="bg-teal-100 text-teal-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                        <EditField label="Full Name" value={data.nextOfKinName} fieldKey="nextOfKinName" inmateId={id} editing={editing} />
                        <EditField label="Phone" value={data.nextOfKinPhone} fieldKey="nextOfKinPhone" inmateId={id} editing={editing} />
                        <EditField label="Relationship" value={data.nextOfKinRelationship} fieldKey="nextOfKinRelationship" inmateId={id} editing={editing} />
                    </div>
                </Section>

                {/* Case */}
                <Section icon={File01Icon} title="Case Information" sub={`Case ${data.caseNumber} · ${data.offense?.name ?? 'No offense linked'}`} color="bg-rose-100 text-rose-700" defaultOpen>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                        <EditField label="Arresting Station" value={data.arrestingStation} fieldKey="arrestingStation" inmateId={id} editing={editing} />
                        <EditField label="Conviction Date" value={data.convictionDate} fieldKey="convictionDate" inmateId={id} editing={editing} type="date" />
                        <EditField label="Sentence Start" value={data.sentenceStart} fieldKey="sentenceStart" inmateId={id} editing={editing} type="date" />
                        <EditField label="Sentence End" value={data.sentenceEnd} fieldKey="sentenceEnd" inmateId={id} editing={editing} type="date" />
                        <EditField label="Sentence Duration" value={data.sentenceDuration} fieldKey="sentenceDuration" inmateId={id} editing={editing} />
                        <div className="space-y-0.5">
                            <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Life Sentence</p>
                            <p className="text-sm">{data.isLifeSentence ? <span className="text-red-600 font-semibold">Yes</span> : 'No'}</p>
                        </div>
                    </div>
                    {(data.fineAmount != null) && (
                        <>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-0.5">
                                    <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Fine Amount</p>
                                    <p className="text-sm font-semibold">UGX {data.fineAmount.toLocaleString()}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Payment Status</p>
                                    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', data.finePaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200')}>
                                        <span className={cn('size-1.5 rounded-full', data.finePaid ? 'bg-emerald-500' : 'bg-red-500')} />
                                        {data.finePaid ? 'Paid' : 'Unpaid'}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                    {/* Remand expiry */}
                    {data.remandExpiry && (
                        <>
                            <Separator className="my-4" />
                            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5">
                                <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-amber-600 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Remand Expiry</p>
                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                        {format(new Date(data.remandExpiry), 'dd MMMM yyyy')}
                                        <span className="ml-2 text-xs font-normal text-amber-600">
                                            ({isFuture(new Date(data.remandExpiry)) ? `in ${formatDistanceToNow(new Date(data.remandExpiry))}` : 'expired'})
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                    {/* Next court date */}
                    {data.nextCourtDate && (
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 px-3 py-2.5 mt-3">
                            <HugeiconsIcon icon={JusticeHammerIcon} className="size-4 text-blue-600 shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Next Court Date</p>
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                    {format(new Date(data.nextCourtDate), 'dd MMMM yyyy')}
                                    <span className="ml-2 text-xs font-normal text-blue-600">
                                        ({isFuture(new Date(data.nextCourtDate)) ? `in ${formatDistanceToNow(new Date(data.nextCourtDate))}` : 'passed'})
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </Section>

                {/* Court appearances */}
                <Section icon={JusticeHammerIcon} title="Court Appearances" sub={`${data.courtAppearances?.length ?? 0} recorded`} color="bg-violet-100 text-violet-700">
                    {!data.courtAppearances?.length ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No court appearances recorded.</p>
                    ) : (
                        <div className="space-y-2">
                            {[...data.courtAppearances]
                                .sort((a: any, b: any) => b.scheduledDate.localeCompare(a.scheduledDate))
                                .map((a: any) => (
                                    <div key={a._id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-sidebar/40 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">{a.court?.name ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{a.court?.type ?? ''}</p>
                                            {a.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{a.notes}</p>}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs font-medium tabular-nums">{format(new Date(a.scheduledDate), 'MMM dd, yyyy')}</p>
                                            {a.outcome ? (
                                                <span className={cn('mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize', outcomeColors[a.outcome] ?? 'bg-muted')}>
                                                    {a.outcome.replace('_', ' ')}
                                                </span>
                                            ) : (
                                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <HugeiconsIcon icon={AlertCircleIcon} className="size-3" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </Section>

                {/* Movements */}
                <Section icon={ArrowMoveLeftRight02Icon} title="Movements" sub={`${data.movements?.length ?? 0} recorded`} color="bg-indigo-100 text-indigo-700">
                    {!data.movements?.length ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No movements recorded.</p>
                    ) : (
                        <div className="space-y-2">
                            {[...data.movements]
                                .sort((a: any, b: any) => b.departureDate.localeCompare(a.departureDate))
                                .map((m: any) => (
                                    <div key={m._id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-sidebar/40 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium capitalize">{m.movementType.replace('_', ' ')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {m.movementType === 'transfer'
                                                    ? `${m.fromPrison?.name ?? '—'} → ${m.toPrison?.name ?? '—'}`
                                                    : m.destination ?? m.reason}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs tabular-nums">{format(new Date(m.departureDate), 'MMM dd, yyyy')}</p>
                                            {m.returnDate
                                                ? <p className="text-[11px] text-emerald-600">Returned {format(new Date(m.returnDate), 'MMM dd')}</p>
                                                : m.movementType !== 'release' && <p className="text-[11px] text-muted-foreground italic">Still out</p>
                                            }
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </Section>

                {/* Medical */}
                <Section icon={MedicineIcon} title="Medical Records" sub={`${data.medicalRecords?.length ?? 0} on file`} color="bg-red-100 text-red-700">
                    {!data.medicalRecords?.length ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No medical records on file.</p>
                    ) : (
                        <div className="space-y-2">
                            {[...data.medicalRecords]
                                .sort((a: any, b: any) => b.recordDate.localeCompare(a.recordDate))
                                .map((r: any) => (
                                    <div key={r._id} className="rounded-lg border border-border/60 bg-sidebar/40 px-4 py-3">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <Badge variant="secondary" className="text-xs capitalize">{r.recordType.replace('_', ' ')}</Badge>
                                            <span className="text-xs text-muted-foreground tabular-nums">{format(new Date(r.recordDate), 'MMM dd, yyyy')}</span>
                                        </div>
                                        {r.diagnosis && <p className="text-sm font-medium">{r.diagnosis}</p>}
                                        {r.treatment && <p className="text-xs text-muted-foreground mt-0.5">{r.treatment}</p>}
                                        {r.attendedBy && <p className="text-xs text-muted-foreground mt-0.5">Attended by: {r.attendedBy}</p>}
                                        {r.referredToHospital && <p className="text-xs text-amber-600 mt-0.5">Referred to: {r.referredToHospital}</p>}
                                    </div>
                                ))}
                        </div>
                    )}
                </Section>

                {/* Items in custody */}
                <Section icon={BoxingBagIcon} title="Items in Custody" sub={`${data.itemsInCustody?.length ?? 0} items`} color="bg-amber-100 text-amber-700">
                    {!data.itemsInCustody?.length ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No items recorded.</p>
                    ) : (
                        <div className="space-y-2">
                            {data.itemsInCustody.map((item: any) => (
                                <div key={item._id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-sidebar/40 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">{item.name}</p>
                                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                                        {item.storageLocation && <p className="text-xs text-muted-foreground">Stored: {item.storageLocation}</p>}
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <Badge variant={item.returnedAt ? 'secondary' : 'outline'} className="text-xs">
                                            {item.returnedAt ? 'Returned' : 'In Storage'}
                                        </Badge>
                                        {item.value && <p className="text-xs text-muted-foreground mt-1">UGX {item.value.toLocaleString()}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Visits */}
                {data.visits?.length > 0 && (
                    <Section icon={UserMultiple02Icon} title="Visits" sub={`${data.visits.length} visits recorded`} color="bg-sky-100 text-sky-700">
                        <div className="space-y-2">
                            {[...data.visits]
                                .sort((a: any, b: any) => (b.scheduledDate ?? '').localeCompare(a.scheduledDate ?? ''))
                                .slice(0, 8)
                                .map((v: any) => (
                                    <div key={v._id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-sidebar/40 px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium">{v.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{v.relationship} · {v.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            {v.scheduledDate && <p className="text-xs tabular-nums">{format(new Date(v.scheduledDate), 'MMM dd, yyyy')}</p>}
                                            <Badge variant="outline" className="text-[11px] capitalize">{v.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </Section>
                )}

                {/* Biometrics */}
                <Section icon={Fingerprint02Icon} title="Biometrics" sub={`${photoCount} photos · ${fpCount}/10 fingerprints`} color="bg-slate-100 text-slate-700">
                    {/* Photos */}
                    <div className="mb-5">
                        <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-2">Photos ({photoCount})</p>
                        {photoCount === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No photos on file.</p>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {data.photos.map((p: any) => (
                                    <div key={p._id} className={cn('aspect-square rounded-lg border overflow-hidden flex items-center justify-center bg-muted', p.isPrimary && 'ring-2 ring-primary ring-offset-1')}>
                                        {p.externalUrl || p.base64Preview ? (
                                            <img src={p.externalUrl ?? `data:image/jpeg;base64,${p.base64Preview}`} alt={p.photoType} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-1">
                                                <p className="text-[9px] text-muted-foreground capitalize leading-tight">{p.photoType.replace('_', '\n')}</p>
                                                {p.isConfirmed && <span className="text-[8px] text-emerald-600 font-semibold block mt-0.5">✓</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator className="my-3" />

                    {/* Fingerprints */}
                    <div>
                        <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-3">Fingerprints ({fpCount}/10)</p>
                        <div className="grid grid-cols-5 gap-1.5 max-w-xs">
                            {fingers.map(finger => {
                                const fp = data.fingerprints?.find((f: any) => f.finger === finger)
                                return (
                                    <div
                                        key={finger}
                                        title={finger.replace('_', ' ')}
                                        className={cn(
                                            'flex flex-col items-center gap-0.5 rounded-lg border px-1.5 py-2 cursor-default transition-colors',
                                            fp ? 'border-emerald-200 bg-emerald-50' : 'border-dashed border-border/60 bg-muted/20'
                                        )}
                                    >
                                        <HugeiconsIcon icon={Fingerprint02Icon} className={cn('size-4', fp ? 'text-emerald-600' : 'text-muted-foreground/30')} />
                                        <p className="text-[9px] text-center leading-tight text-muted-foreground capitalize">
                                            {finger.replace('right_', 'R ').replace('left_', 'L ').replace('_', ' ')}
                                        </p>
                                        {fp?.isConfirmed && <span className="text-[8px] text-emerald-600 font-bold">✓</span>}
                                    </div>
                                )
                            })}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(fpCount / 10) * 100}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">{fpCount}/10</span>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Bottom spacer */}
            <div className="h-8" />
        </article>
    )
}