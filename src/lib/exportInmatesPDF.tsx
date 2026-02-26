import { Id } from 'convex/_generated/dataModel'
import { format } from 'date-fns/format'
import { toast } from 'sonner'
import { cn } from './utils'

type InmateStatus = 'remand' | 'convict' | 'at_court' | 'released' | 'transferred' | 'escaped' | 'deceased'
type InmateType = 'remand' | 'convict' | 'civil'
type RiskLevel = 'low' | 'medium' | 'high' | 'maximum'

type Inmate = {
    _id: Id<'inmates'>; _creationTime: number
    firstName: string; lastName: string; otherNames?: string
    prisonNumber: string; nationalId?: string
    dob: string; gender: 'male' | 'female'
    inmateType: InmateType; status: InmateStatus; riskLevel?: RiskLevel
    prisonId: Id<'prisons'>; offenseId: Id<'offenses'>
    caseNumber: string; admissionDate: string
    cellBlock?: string; cellNumber?: string; notes?: string
}

export const riskConfig: Record<RiskLevel, { label: string; class: string; dot: string }> = {
    low: { label: 'Low', dot: 'bg-emerald-500', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    medium: { label: 'Medium', dot: 'bg-amber-500', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    high: { label: 'High', dot: 'bg-orange-500', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    maximum: { label: 'Maximum', dot: 'bg-red-600', class: 'bg-red-50 text-red-700 border-red-200' },
}

export function getInitials(f: string, l: string) { return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase() }

export function avatarColor(id: string) {
    const colors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700', 'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700', 'bg-indigo-100 text-indigo-700']
    return colors[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length]
}

export function StatusBadge({ status }: { status?: InmateStatus }) {
    const cfg = status ? statusConfig[status] : null
    if (!cfg) return null
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.class)}>
            <span className={cn('size-1.5 rounded-full', cfg.dot)} />{cfg.label}
        </span>
    )
}

export function RiskBadge({ level }: { level?: RiskLevel }) {
    if (!level) return null
    const cfg = riskConfig[level]
    return (
        <span className={cn('inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium', cfg.class)}>
            <span className={cn('size-1.5 rounded-full', cfg.dot)} />{cfg.label}
        </span>
    )
}

// Add these type exports at the top
export type { Inmate, InmateStatus, InmateType, RiskLevel }

// Improved table configuration with better spacing
export const statusConfig: Record<InmateStatus, { label: string; class: string; dot: string }> = {
    remand: {
        label: 'Remand',
        dot: 'bg-amber-500',
        class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
    },
    convict: {
        label: 'Convict',
        dot: 'bg-red-500',
        class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
    },
    at_court: {
        label: 'At Court',
        dot: 'bg-blue-500',
        class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
    },
    released: {
        label: 'Released',
        dot: 'bg-emerald-500',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
    },
    transferred: {
        label: 'Transferred',
        dot: 'bg-violet-500',
        class: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800'
    },
    escaped: {
        label: 'Escaped',
        dot: 'bg-orange-500',
        class: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800'
    },
    deceased: {
        label: 'Deceased',
        dot: 'bg-zinc-400',
        class: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700'
    },
}

// Improved PDF export with better table spacing and layout
export async function exportInmatesPDF(inmates: Inmate[], label: string) {
    const tid = toast.loading(`Preparing register — ${inmates.length} inmates…`, { duration: Infinity })
    try {
        const [{ jsPDF }, { default: autoTable }] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable'),
        ])

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const PW = doc.internal.pageSize.getWidth()
        const PH = doc.internal.pageSize.getHeight()
        const now = new Date()
        const generated = format(now, "dd MMMM yyyy, HH:mm 'hrs'")

        // Color palette
        const NAVY = [10, 36, 99] as [number, number, number]
        const GOLD = [180, 140, 40] as [number, number, number]
        const LIGHT = [235, 240, 252] as [number, number, number]
        const MUTED = [100, 110, 130] as [number, number, number]
        const WHITE = [255, 255, 255] as [number, number, number]
        const BLACK = [20, 20, 30] as [number, number, number]
        const RED = [185, 28, 28] as [number, number, number]
        const AMBER = [146, 100, 10] as [number, number, number]
        const GREEN = [21, 100, 60] as [number, number, number]

        const statusFill: Record<string, [number, number, number]> = {
            remand: [255, 251, 235],
            convict: [254, 242, 242],
            at_court: [239, 246, 255],
            released: [240, 253, 244],
            transferred: [245, 243, 255],
            escaped: [255, 237, 213],
            deceased: [244, 244, 245],
        }

        // ════════════════════════════════════════════════════════════════════
        // PAGE 1 — COVER / STATISTICS DASHBOARD
        // ════════════════════════════════════════════════════════════════════

        // Header band with better proportions
        doc.setFillColor(...NAVY)
        doc.rect(0, 0, PW, 50, 'F')
        doc.setFillColor(...GOLD)
        doc.rect(0, 0, PW, 3, 'F')

        // Crest with better positioning
        doc.setFillColor(...GOLD)
        doc.circle(PW / 2, 18, 12, 'F')
        doc.setFillColor(...NAVY)
        doc.circle(PW / 2, 18, 9, 'F')
        doc.setFillColor(...GOLD)
        doc.circle(PW / 2, 18, 5, 'F')

        // Organization text with better spacing
        doc.setTextColor(...WHITE)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('REPUBLIC OF UGANDA', PW / 2, 35, { align: 'center' })
        doc.setFontSize(16)
        doc.text('UGANDA PRISONS SERVICE', PW / 2, 44, { align: 'center' })
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text('Ministry of Internal Affairs', PW / 2, 52, { align: 'center' })

        // Document title bar
        doc.setFillColor(...GOLD)
        doc.rect(0, 58, PW, 16, 'F')
        doc.setTextColor(...NAVY)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('INMATE REGISTER — OFFICIAL DOCUMENT', PW / 2, 69, { align: 'center' })

        // Confidential watermark
        doc.setGState(new (doc as any).GState({ opacity: 0.04 }))
        doc.setTextColor(...NAVY)
        doc.setFontSize(72)
        doc.setFont('helvetica', 'bold')
        doc.text('CONFIDENTIAL', PW / 2, 170, { align: 'center', angle: 45 })
        doc.setGState(new (doc as any).GState({ opacity: 1 }))

        // Meta info box with improved spacing
        doc.setFillColor(...LIGHT)
        doc.setDrawColor(...NAVY)
        doc.setLineWidth(0.4)
        doc.roundedRect(115, 78, 85, 48, 3, 3, 'FD')

        doc.setTextColor(...MUTED)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text('DOCUMENT REFERENCE', 120, 88)
        doc.setTextColor(...BLACK)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`UPS-REG-${format(now, 'yyyyMMdd-HHmm')}`, 120, 96)

        doc.setTextColor(...MUTED)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.text('GENERATED', 120, 108)
        doc.setTextColor(...BLACK)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text(generated, 120, 116)

        doc.setTextColor(...MUTED)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.text('FILTERS APPLIED', 120, 128)
        doc.setTextColor(...BLACK)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.text(label || 'None — Full register', 120, 136, { maxWidth: 75 })

        // ── STATISTICS SECTION ────────────────────────────────────────────────

        // Compute stats
        const total = inmates.length
        const male = inmates.filter(i => i.gender === 'male').length
        const female = total - male
        const remand = inmates.filter(i => i.status === 'remand').length
        const convict = inmates.filter(i => i.status === 'convict').length
        const atCourt = inmates.filter(i => i.status === 'at_court').length
        const released = inmates.filter(i => i.status === 'released').length
        const transferred = inmates.filter(i => i.status === 'transferred').length
        const escaped = inmates.filter(i => i.status === 'escaped').length
        const deceased = inmates.filter(i => i.status === 'deceased').length
        const maxRisk = inmates.filter(i => i.riskLevel === 'maximum').length
        const highRisk = inmates.filter(i => i.riskLevel === 'high').length
        const civil = inmates.filter(i => i.inmateType === 'civil').length

        const ages = inmates
            .filter(i => i.dob)
            .map(i => Math.floor((Date.now() - new Date(i.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)))
        const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0

        const admDays = inmates
            .filter(i => i.admissionDate)
            .map(i => Math.floor((Date.now() - new Date(i.admissionDate).getTime()) / (1000 * 60 * 60 * 24)))
        const avgDays = admDays.length ? Math.round(admDays.reduce((a, b) => a + b, 0) / admDays.length) : 0

        // Section header with better spacing
        doc.setFillColor(...NAVY)
        doc.rect(10, 78, 100, 10, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('POPULATION STATISTICS', 14, 85)

        // Big stat cards with improved spacing
        const bigCards = [
            { label: 'TOTAL INMATES', value: String(total), color: NAVY },
            { label: 'MALE', value: String(male), color: [37, 99, 235] as [number, number, number] },
            { label: 'FEMALE', value: String(female), color: [157, 23, 77] as [number, number, number] },
            { label: 'AVG AGE', value: String(avgAge), color: MUTED },
        ]

        bigCards.forEach((card, idx) => {
            const x = 10 + idx * 26
            doc.setFillColor(...card.color)
            doc.roundedRect(x, 92, 24, 28, 2, 2, 'F')
            doc.setTextColor(...WHITE)
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text(card.value, x + 12, 108, { align: 'center' })
            doc.setFontSize(6)
            doc.setFont('helvetica', 'normal')
            doc.text(card.label, x + 12, 116, { align: 'center' })
        })

        // Status breakdown table with improved spacing
        doc.setFillColor(...NAVY)
        doc.rect(10, 125, 100, 10, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('STATUS BREAKDOWN', 14, 132)

        const statusRows = [
            ['Remand', String(remand), `${total ? Math.round(remand / total * 100) : 0}%`],
            ['Convict', String(convict), `${total ? Math.round(convict / total * 100) : 0}%`],
            ['At Court', String(atCourt), `${total ? Math.round(atCourt / total * 100) : 0}%`],
            ['Released', String(released), `${total ? Math.round(released / total * 100) : 0}%`],
            ['Transferred', String(transferred), `${total ? Math.round(transferred / total * 100) : 0}%`],
            ['Escaped', String(escaped), `${total ? Math.round(escaped / total * 100) : 0}%`],
            ['Deceased', String(deceased), `${total ? Math.round(deceased / total * 100) : 0}%`],
        ]

        autoTable(doc, {
            startY: 138,
            margin: { left: 10, right: 115 },
            head: [['Status', 'Count', '%']],
            body: statusRows,
            theme: 'plain',
            headStyles: {
                fillColor: [220, 226, 242],
                textColor: [10, 36, 99],
                fontStyle: 'bold',
                fontSize: 8,
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 3
            },
            alternateRowStyles: {
                fillColor: [245, 247, 252]
            },
            columnStyles: {
                1: { halign: 'center' },
                2: { halign: 'center', textColor: MUTED }
            },
            tableWidth: 100,
        })

        // Risk & classification with better spacing
        doc.setFillColor(...NAVY)
        doc.rect(115, 130, 85, 10, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('RISK & CLASSIFICATION', 120, 137)

        autoTable(doc, {
            startY: 143,
            margin: { left: 115 },
            head: [['Category', 'Count']],
            body: [
                ['Maximum Risk', String(maxRisk)],
                ['High Risk', String(highRisk)],
                ['Civil Cases', String(civil)],
                ['Avg. Days Held', avgDays > 365 ? `${Math.round(avgDays / 365)}y ${Math.round((avgDays % 365) / 30)}m` : `${avgDays}d`],
            ],
            theme: 'plain',
            headStyles: {
                fillColor: [220, 226, 242],
                textColor: [10, 36, 99],
                fontStyle: 'bold',
                fontSize: 8,
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 3
            },
            alternateRowStyles: {
                fillColor: [245, 247, 252]
            },
            columnStyles: {
                1: { halign: 'center' }
            },
            tableWidth: 85,
        })

        // Visual bar chart with improved spacing
        const chartY = (doc as any).lastAutoTable.finalY + 15
        doc.setFillColor(...NAVY)
        doc.rect(10, chartY - 8, 190, 10, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('DISTRIBUTION BY STATUS', 14, chartY - 1)

        const bars = [
            { label: 'Remand', count: remand, fill: [245, 158, 11] as [number, number, number] },
            { label: 'Convict', count: convict, fill: [220, 38, 38] as [number, number, number] },
            { label: 'At Court', count: atCourt, fill: [59, 130, 246] as [number, number, number] },
            { label: 'Released', count: released, fill: [34, 197, 94] as [number, number, number] },
            { label: 'Transferred', count: transferred, fill: [139, 92, 246] as [number, number, number] },
            { label: 'Escaped', count: escaped, fill: [249, 115, 22] as [number, number, number] },
            { label: 'Deceased', count: deceased, fill: [161, 161, 170] as [number, number, number] },
        ]

        const maxBar = Math.max(...bars.map(b => b.count), 1)
        const barAreaW = 190
        const barW = barAreaW / bars.length - 6
        const barMaxH = 45
        const barBaseY = chartY + 55

        bars.forEach((bar, idx) => {
            const x = 10 + idx * (barAreaW / bars.length) + 3
            const h = (bar.count / maxBar) * barMaxH

            // Bar fill
            doc.setFillColor(...bar.fill)
            doc.rect(x, barBaseY - h, barW, h, 'F')

            // Count label above bar
            doc.setTextColor(...BLACK)
            doc.setFontSize(8)
            doc.setFont('helvetica', 'bold')
            if (bar.count > 0) {
                doc.text(String(bar.count), x + barW / 2, barBaseY - h - 3, { align: 'center' })
            }

            // X-axis label
            doc.setFontSize(6)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(...MUTED)
            doc.text(bar.label, x + barW / 2, barBaseY + 7, { align: 'center' })
        })

        // X-axis line
        doc.setDrawColor(...NAVY)
        doc.setLineWidth(0.5)
        doc.line(10, barBaseY, 200, barBaseY)

        // Authorization block with better spacing
        const authY = barBaseY + 20
        doc.setDrawColor(...MUTED)
        doc.setLineWidth(0.3)

        const sigBoxes = ['Prepared by', 'Reviewed by', 'Authorised by']
        sigBoxes.forEach((label, idx) => {
            const x = 14 + idx * 65
            doc.line(x, authY + 15, x + 58, authY + 15)
            doc.setTextColor(...MUTED)
            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            doc.text(label, x, authY + 22)
            doc.text('Name: ______________________', x, authY + 30)
            doc.text('Date: _______________________', x, authY + 38)
        })

        // Page 1 footer
        doc.setFontSize(7)
        doc.setTextColor(...MUTED)
        doc.text('OFFICIAL / CONFIDENTIAL — Uganda Prisons Service — For Authorised Use Only', PW / 2, PH - 10, { align: 'center' })
        doc.setDrawColor(...GOLD)
        doc.setLineWidth(1.2)
        doc.line(10, PH - 14, PW - 10, PH - 14)

        // ════════════════════════════════════════════════════════════════════
        // PAGE 2+ — INMATE REGISTER TABLE (landscape A4)
        // ════════════════════════════════════════════════════════════════════

        doc.addPage('a4', 'landscape')
        const LW = doc.internal.pageSize.getWidth()
        const LH = doc.internal.pageSize.getHeight()

        // Landscape header with better spacing
        doc.setFillColor(...NAVY)
        doc.rect(0, 0, LW, 22, 'F')
        doc.setFillColor(...GOLD)
        doc.rect(0, 0, LW, 3, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('UGANDA PRISONS SERVICE  —  INMATE REGISTER', LW / 2, 12, { align: 'center' })
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Generated: ${generated}   |   Total: ${total} inmates${label ? '   |   Filters: ' + label : ''}`, LW / 2, 19, { align: 'center' })

        // Improved table with better column widths and spacing
        autoTable(doc, {
            startY: 28,
            margin: { top: 28, bottom: 18, left: 5, right: 5 },
            head: [[
                '#',
                'Prison No.',
                'Full Name',
                'Sex',
                'D.O.B',
                'Age',
                'Type',
                'Status',
                'Risk',
                'Case No.',
                'Offense',
                'Admitted',
                'Duration',
                'Location',
            ]],
            body: inmates.map((i, n) => {
                const age = i.dob
                    ? Math.floor((Date.now() - new Date(i.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                    : '—'
                const admDate = i.admissionDate ? new Date(i.admissionDate) : null
                const daysIn = admDate ? Math.floor((Date.now() - admDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
                const timeServedStr = admDate
                    ? daysIn > 365
                        ? `${Math.floor(daysIn / 365)}y ${Math.floor((daysIn % 365) / 30)}m`
                        : daysIn > 30
                            ? `${Math.floor(daysIn / 30)}m ${daysIn % 30}d`
                            : `${daysIn}d`
                    : '—'

                return [
                    String(n + 1),
                    i.prisonNumber,
                    `${i.firstName}${i.otherNames ? ' ' + i.otherNames : ''} ${i.lastName}`.trim(),
                    i.gender === 'male' ? 'M' : 'F',
                    i.dob ? format(new Date(i.dob), 'dd/MM/yy') : '—',
                    String(age),
                    i.inmateType.charAt(0).toUpperCase() + i.inmateType.slice(1),
                    statusConfig[i.status]?.label ?? i.status,
                    i.riskLevel ? riskConfig[i.riskLevel].label : '—',
                    i.caseNumber,
                    (i as any).offenseName ?? '—',
                    i.admissionDate ? format(new Date(i.admissionDate), 'dd/MM/yy') : '—',
                    timeServedStr,
                    [i.cellBlock, i.cellNumber].filter(Boolean).join(' / ') || '—',
                ]
            }),
            theme: 'grid',
            headStyles: {
                fillColor: NAVY,
                textColor: WHITE,
                fontStyle: 'bold',
                fontSize: 7,
                cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
                halign: 'center',
                valign: 'middle',
            },
            bodyStyles: {
                fontSize: 7,
                cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
                valign: 'middle',
            },
            alternateRowStyles: {},
            willDrawCell: (data: any) => {
                if (data.section === 'body') {
                    const inmate = inmates[data.row.index]
                    if (!inmate) return
                    const fill = statusFill[inmate.status] ?? [255, 255, 255]
                    doc.setFillColor(...fill)
                }
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 8 },
                1: { cellWidth: 22, fontStyle: 'bold' },
                2: { cellWidth: 35 },
                3: { halign: 'center', cellWidth: 8 },
                4: { halign: 'center', cellWidth: 18 },
                5: { halign: 'center', cellWidth: 10 },
                6: { cellWidth: 14 },
                7: { cellWidth: 16 },
                8: { cellWidth: 14 },
                9: { cellWidth: 22 },
                10: { cellWidth: 28 },
                11: { halign: 'center', cellWidth: 18 },
                12: { halign: 'center', cellWidth: 16 },
                13: { cellWidth: 20 },
            },
            didParseCell: (data: any) => {
                if (data.section === 'body' && data.column.index === 7) {
                    const inmate = inmates[data.row.index]
                    if (!inmate) return
                    const textColMap: Record<string, [number, number, number]> = {
                        remand: AMBER,
                        convict: RED,
                        at_court: [37, 99, 235],
                        released: GREEN,
                        transferred: [109, 40, 217],
                        escaped: [194, 65, 12],
                        deceased: MUTED,
                    }
                    data.cell.styles.textColor = textColMap[inmate.status] ?? BLACK
                    data.cell.styles.fontStyle = 'bold'
                }
                if (data.section === 'body' && data.column.index === 8 && data.cell.raw === 'Maximum') {
                    data.cell.styles.textColor = RED
                    data.cell.styles.fontStyle = 'bold'
                }
            },
            didDrawPage: (data: any) => {
                if (data.pageNumber > 1) {
                    doc.setFillColor(...NAVY)
                    doc.rect(0, 0, LW, 22, 'F')
                    doc.setFillColor(...GOLD)
                    doc.rect(0, 0, LW, 3, 'F')
                    doc.setTextColor(...WHITE)
                    doc.setFontSize(12)
                    doc.setFont('helvetica', 'bold')
                    doc.text('UGANDA PRISONS SERVICE  —  INMATE REGISTER (CONT.)', LW / 2, 12, { align: 'center' })
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(`Generated: ${generated}   |   Page ${data.pageNumber}`, LW / 2, 19, { align: 'center' })
                }

                // Footer on every landscape page
                doc.setFontSize(7)
                doc.setTextColor(...MUTED)
                doc.text(
                    `Page ${data.pageNumber}  —  CONFIDENTIAL — Uganda Prisons Service — Official Use Only`,
                    LW / 2, LH - 8, { align: 'center' }
                )
                doc.setDrawColor(...GOLD)
                doc.setLineWidth(1)
                doc.line(5, LH - 12, LW - 5, LH - 12)
            },
        })

        // Status legend with better spacing
        const legendY = (doc as any).lastAutoTable.finalY + 6
        if (legendY < LH - 30) {
            doc.setFontSize(7)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(...MUTED)
            doc.text('ROW COLOUR KEY:', 5, legendY + 5)

            const legend = [
                { label: 'Remand', fill: statusFill.remand },
                { label: 'Convict', fill: statusFill.convict },
                { label: 'At Court', fill: statusFill.at_court },
                { label: 'Released', fill: statusFill.released },
                { label: 'Transferred', fill: statusFill.transferred },
                { label: 'Escaped', fill: statusFill.escaped },
                { label: 'Deceased', fill: statusFill.deceased },
            ]

            let lx = 45
            legend.forEach(l => {
                doc.setFillColor(...l.fill as [number, number, number])
                doc.setDrawColor(...MUTED)
                doc.setLineWidth(0.3)
                doc.rect(lx, legendY + 1, 8, 5, 'FD')
                doc.setTextColor(...BLACK)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(7)
                doc.text(l.label, lx + 10, legendY + 5)
                lx += 35
            })
        }

        // Final page numbering
        const totalPages = doc.getNumberOfPages()
        doc.setPage(1)
        doc.setFontSize(7)
        doc.setTextColor(...MUTED)
        doc.text(`Page 1 of ${totalPages}  —  OFFICIAL / CONFIDENTIAL — Uganda Prisons Service`, PW / 2, PH - 10, { align: 'center' })

        // Save
        const filename = `UPS-InmateRegister-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`
        const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__

        if (isTauri) {
            const { save } = await import('@tauri-apps/plugin-dialog')
            const { writeFile } = await import('@tauri-apps/plugin-fs')
            const savePath = await save({
                defaultPath: filename,
                filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
            })
            if (savePath) {
                await writeFile(savePath, new Uint8Array(doc.output('arraybuffer')))
                toast.success('Register saved to disk', { id: tid, description: `${totalPages} pages · ${total} inmates` })
            } else {
                toast.dismiss(tid)
            }
        } else {
            doc.save(filename)
            toast.success(`Register exported — ${total} inmates, ${totalPages} pages`, { id: tid })
        }
    } catch (e: any) {
        console.error(e)
        toast.error(`Export failed: ${e.message}`, { id: tid })
    }
}