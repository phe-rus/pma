import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserAdd01Icon,
  Building01Icon,
  UserMultiple02Icon,
  ArrowLeftRight as ArrowMoveLeftRight02Icon,
  JusticeScale02Icon as JusticeHammerIcon,
  UserWarning01Icon as WarningDiamondIcon,
  UserShield01Icon,
  ChartBarLineIcon,
  AlertDiamondIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  BookOpen01Icon,
  Search01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'

export const Route = createFileRoute('/_management/documentations/')({
  component: RouteComponent,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = {
  id: string
  number: string
  title: string
  icon: any
  color: string
  content: React.ReactNode
}

// ─── Callout components ───────────────────────────────────────────────────────

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-800 dark:bg-blue-950/30">
      <HugeiconsIcon icon={InformationCircleIcon} className="size-4 text-blue-600 shrink-0 mt-0.5" />
      <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{children}</p>
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950/30">
      <HugeiconsIcon icon={AlertDiamondIcon} className="size-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-amber-800 dark:text-amber-300 leading-relaxed">{children}</p>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-600 shrink-0 mt-0.5" />
      <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">{children}</p>
    </div>
  )
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold mt-0.5">
            {i + 1}
          </span>
          <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  )
}

function FieldTable({ rows }: { rows: { field: string; type: string; required: boolean; description: string }[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide">Field</th>
            <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
            <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide">Required</th>
            <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.field} className="hover:bg-muted/20">
              <td className="px-3 py-2 font-mono font-medium">{row.field}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.type}</td>
              <td className="px-3 py-2">
                {row.required
                  ? <span className="text-rose-600 font-medium">Yes</span>
                  : <span className="text-muted-foreground">Optional</span>}
              </td>
              <td className="px-3 py-2 text-muted-foreground leading-relaxed">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusGrid({ items }: { items: { status: string; color: string; meaning: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.status} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-sidebar/50 px-3 py-2.5">
          <span className={cn('size-2 rounded-full shrink-0 mt-1.5', item.color)} />
          <div>
            <span className="text-xs font-semibold capitalize">{item.status.replace('_', ' ')}</span>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.meaning}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-border pb-3 mb-6">
      <span className="font-mono text-xs font-bold text-muted-foreground/60 shrink-0">{number}</span>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold tracking-tight mt-6 mb-3 text-foreground">{children}</h3>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
  )
}

// ─── Section content ──────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: 'overview',
    number: '01',
    title: 'System Overview',
    icon: BookOpen01Icon,
    color: 'text-foreground',
    content: (
      <div className="space-y-5">
        <SectionHeading number="01" title="System Overview" />
        <Prose>
          The Prison Management Application (PMA) is a centralised platform for managing Uganda's correctional facilities. It provides real-time tracking of inmates, movements, visits, officers, courts, and offenses across all registered facilities.
        </Prose>

        <SubHeading>Core Modules</SubHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'Inmates', desc: 'Inmate registration, classification, and case management' },
            { label: 'Visits', desc: 'Visitor registration, scheduling, check-in and check-out' },
            { label: 'Movements', desc: 'Transfers, hospital escorts, court escorts, and releases' },
            { label: 'Officers', desc: 'Warden and officer assignment per facility' },
            { label: 'Prisons', desc: 'Facility registry, capacity, and occupancy tracking' },
            { label: 'Courts', desc: 'Court and appearance scheduling with outcome recording' },
            { label: 'Offenses', desc: 'Chargeable offense registry with legal references' },
            { label: 'Dashboard', desc: 'Live stats, charts, alerts, and operational overview' },
          ].map((m) => (
            <div key={m.label} className="flex items-start gap-2 rounded-lg border border-border/60 bg-sidebar/50 px-3 py-2.5">
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-muted-foreground shrink-0 mt-1" />
              <div>
                <span className="text-xs font-semibold">{m.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <SubHeading>Getting Started</SubHeading>
        <Steps items={[
          'Open the Dashboard to get a live operational overview of all facilities.',
          'Register at least one Prison facility before adding inmates or officers.',
          'Add Offenses to the offense registry — these are required when registering inmates.',
          'Register inmates using the Add Inmate form accessible from the sidebar or the sheet panel.',
          'Schedule visits and record movements as day-to-day operations occur.',
        ]} />

        <Note>
          All data is stored in real-time using Convex. Changes made by one user are immediately visible to all other logged-in users without refreshing.
        </Note>
      </div>
    ),
  },
  {
    id: 'inmates',
    number: '02',
    title: 'Inmate Management',
    icon: UserAdd01Icon,
    color: 'text-rose-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="02" title="Inmate Management" />
        <Prose>
          The Inmates module is the core of the system. Every person in custody must be registered here with their personal details, classification, placement, and case information before any other records (visits, movements, court appearances) can be created for them.
        </Prose>

        <SubHeading>Registering an Inmate</SubHeading>
        <Steps items={[
          'Navigate to Inmates in the sidebar, or click "Add Inmate" from the Dashboard quick actions.',
          'The sheet panel opens. Fill in Personal Information: first name, last name, date of birth, gender, nationality, and national ID.',
          'Enter the Prison Number — this must be unique across the system (e.g. LUZ/2024/001).',
          'Set Classification: Inmate Type (Remand, Convict, or Civil), Status, and Risk Level.',
          'Select the Prison from the dropdown. If the prison does not exist yet, click the + button to quick-create it inline.',
          'Enter the Case Number, Admission Date, and select the Offense. If the offense is not listed, quick-create it inline.',
          'Optionally set Sentence Duration and Next Court Date.',
          'Fill in Next of Kin details if available.',
          'Click "Create Inmate" to save.',
        ]} />

        <SubHeading>Inmate Types</SubHeading>
        <StatusGrid items={[
          { status: 'Remand', color: 'bg-amber-500', meaning: 'Held awaiting trial. No conviction yet. Will typically have frequent court appearances.' },
          { status: 'Convict', color: 'bg-red-500', meaning: 'Sentenced following conviction. Has a defined sentence duration.' },
          { status: 'Civil', color: 'bg-blue-500', meaning: 'Held for civil contempt, debt enforcement, or other non-criminal orders.' },
        ]} />

        <SubHeading>Inmate Status Values</SubHeading>
        <StatusGrid items={[
          { status: 'Remand', color: 'bg-amber-500', meaning: 'Active — awaiting trial, currently housed in the facility.' },
          { status: 'Convict', color: 'bg-red-500', meaning: 'Active — serving a sentence in the facility.' },
          { status: 'At Court', color: 'bg-blue-500', meaning: 'Temporarily out — escorted to court for a hearing.' },
          { status: 'Released', color: 'bg-emerald-500', meaning: 'No longer in custody — completed sentence or bail granted.' },
          { status: 'Transferred', color: 'bg-violet-500', meaning: 'Moved to another facility — no longer at current prison.' },
          { status: 'Escaped', color: 'bg-orange-500', meaning: 'Escaped from custody. Triggers a dashboard alert. Requires immediate action.' },
          { status: 'Deceased', color: 'bg-zinc-400', meaning: 'Deceased while in custody. Record is preserved for audit.' },
        ]} />

        <SubHeading>Risk Levels</SubHeading>
        <Prose>
          Risk level is used to determine housing allocation and escort requirements. It does not automatically affect status but should be updated as behaviour assessments are conducted.
        </Prose>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { level: 'Low', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', note: 'Standard supervision' },
            { level: 'Medium', bg: 'bg-amber-50 border-amber-200 text-amber-700', note: 'Moderate supervision' },
            { level: 'High', bg: 'bg-orange-50 border-orange-200 text-orange-700', note: 'Enhanced supervision' },
            { level: 'Maximum', bg: 'bg-red-50 border-red-200 text-red-700', note: 'Strict isolation protocols' },
          ].map((r) => (
            <div key={r.level} className={cn('rounded-lg border px-3 py-2.5', r.bg)}>
              <p className="font-semibold">{r.level}</p>
              <p className="text-xs opacity-80 mt-0.5">{r.note}</p>
            </div>
          ))}
        </div>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'prisonNumber', type: 'string', required: true, description: 'Unique facility-assigned ID (e.g. LUZ/2024/001)' },
          { field: 'firstName', type: 'string', required: true, description: 'Legal first name' },
          { field: 'lastName', type: 'string', required: true, description: 'Legal surname' },
          { field: 'otherNames', type: 'string', required: false, description: 'Middle or additional names' },
          { field: 'nationalId', type: 'string', required: false, description: 'Uganda National ID number' },
          { field: 'dob', type: 'date', required: true, description: 'Date of birth' },
          { field: 'gender', type: 'enum', required: true, description: 'male | female' },
          { field: 'inmateType', type: 'enum', required: true, description: 'remand | convict | civil' },
          { field: 'status', type: 'enum', required: true, description: 'Current custody status' },
          { field: 'riskLevel', type: 'enum', required: false, description: 'low | medium | high | maximum' },
          { field: 'prisonId', type: 'ref', required: true, description: 'The facility this inmate is assigned to' },
          { field: 'offenseId', type: 'ref', required: true, description: 'The primary offense they are charged with' },
          { field: 'caseNumber', type: 'string', required: true, description: 'Court case reference number' },
          { field: 'admissionDate', type: 'date', required: true, description: 'Date entered custody' },
          { field: 'sentenceDuration', type: 'string', required: false, description: 'Human-readable sentence e.g. "3 years"' },
          { field: 'nextCourtDate', type: 'date', required: false, description: 'Next scheduled court appearance' },
          { field: 'cellBlock', type: 'string', required: false, description: 'Housing block (e.g. Block A)' },
          { field: 'cellNumber', type: 'string', required: false, description: 'Cell identifier (e.g. 12B)' },
        ]} />

        <Warning>
          Setting an inmate's status to "Escaped" will display a prominent alert banner on the Dashboard for all users. Ensure this is only set after proper incident reporting procedures have been followed.
        </Warning>
      </div>
    ),
  },
  {
    id: 'visits',
    number: '03',
    title: 'Visit Management',
    icon: UserMultiple02Icon,
    color: 'text-sky-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="03" title="Visit Management" />
        <Prose>
          The Visits module tracks all civilian visitors entering the facility to visit inmates. Each visit must be scheduled in advance and passes through a status lifecycle from scheduled → checked in → completed.
        </Prose>

        <SubHeading>Visit Lifecycle</SubHeading>
        <div className="flex items-center gap-1 flex-wrap text-xs">
          {['Scheduled', '→', 'Checked In', '→', 'Completed'].map((step, i) => (
            <span key={i} className={cn(
              i % 2 === 0
                ? 'rounded border px-2.5 py-1 font-medium bg-sidebar border-border'
                : 'text-muted-foreground font-bold'
            )}>{step}</span>
          ))}
          <span className="text-muted-foreground ml-2">or</span>
          <span className="rounded border px-2.5 py-1 font-medium bg-red-50 border-red-200 text-red-700 ml-1">Denied</span>
          <span className="rounded border px-2.5 py-1 font-medium bg-orange-50 border-orange-200 text-orange-700 ml-1">Cancelled</span>
        </div>

        <SubHeading>Scheduling a Visit</SubHeading>
        <Steps items={[
          'Click "Schedule Visit" from the Dashboard or navigate to the Visits page and click "Schedule Visit".',
          'Select the Inmate being visited from the dropdown.',
          'Select the Prison where the visit will take place.',
          'Optionally set the Scheduled Date.',
          'Enter the visitor\'s full name, ID number, ID type, and relationship to the inmate.',
          'Enter the visitor\'s phone number (required for contact tracing).',
          'Declare any items the visitor intends to bring in.',
          'Click "Schedule Visit" to save.',
        ]} />

        <SubHeading>Check-In & Check-Out</SubHeading>
        <Prose>
          On the Visits page, each scheduled visit has inline action buttons. Use these to manage the visit on the day:
        </Prose>
        <Steps items={[
          'When the visitor arrives, click "Check In" on their row. The system records the check-in time automatically.',
          'The visit status changes to "Inside" and the visitor appears in the "Visitors Inside Now" panel on the Dashboard.',
          'When the visit ends, click "Check Out" to record the departure time and complete the visit.',
        ]} />

        <SubHeading>Visit Status Reference</SubHeading>
        <StatusGrid items={[
          { status: 'Scheduled', color: 'bg-sky-500', meaning: 'Approved and waiting for the visitor to arrive on the day.' },
          { status: 'Checked In', color: 'bg-emerald-500', meaning: 'Visitor has entered the facility. Visit is active.' },
          { status: 'Completed', color: 'bg-zinc-400', meaning: 'Visit concluded normally. Visitor has left.' },
          { status: 'Denied', color: 'bg-red-500', meaning: 'Entry was refused — security concern or rule violation.' },
          { status: 'Cancelled', color: 'bg-orange-500', meaning: 'Visit was cancelled before it took place.' },
        ]} />

        <Tip>
          Use the Status filter on the Visits page to quickly see all visitors currently inside the facility (filter by "Inside").
        </Tip>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'inmateId', type: 'ref', required: true, description: 'The inmate being visited' },
          { field: 'prisonId', type: 'ref', required: true, description: 'Facility where the visit occurs' },
          { field: 'fullName', type: 'string', required: true, description: 'Visitor\'s full legal name' },
          { field: 'idNumber', type: 'string', required: true, description: 'Visitor\'s ID document number' },
          { field: 'idType', type: 'enum', required: false, description: 'national_id | passport | driving_permit' },
          { field: 'relationship', type: 'string', required: true, description: 'Relationship to the inmate (e.g. Spouse)' },
          { field: 'phone', type: 'string', required: true, description: 'Visitor\'s contact phone number' },
          { field: 'scheduledDate', type: 'date', required: false, description: 'Date visit is scheduled to occur' },
          { field: 'reason', type: 'string', required: false, description: 'Purpose of the visit' },
          { field: 'itemsDeclaration', type: 'string', required: false, description: 'Items the visitor declares bringing in' },
        ]} />
      </div>
    ),
  },
  {
    id: 'movements',
    number: '04',
    title: 'Movement Records',
    icon: ArrowMoveLeftRight02Icon,
    color: 'text-indigo-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="04" title="Movement Records" />
        <Prose>
          A Movement is recorded any time an inmate leaves or is moved between facilities. Movements create a full audit trail. For transfers, the system automatically updates the inmate's assigned prison. For court or hospital movements, the inmate's status is updated and reverted when they return.
        </Prose>

        <SubHeading>Movement Types</SubHeading>
        <StatusGrid items={[
          { status: 'Transfer', color: 'bg-violet-500', meaning: 'Permanent move to another facility. The inmate\'s prison assignment is updated automatically.' },
          { status: 'Hospital', color: 'bg-red-500', meaning: 'Medical escort outside the facility. Inmate returns after treatment.' },
          { status: 'Court', color: 'bg-blue-500', meaning: 'Escorted to a court hearing. Inmate status becomes "At Court" until return is recorded.' },
          { status: 'Work Party', color: 'bg-amber-500', meaning: 'External work assignment. Inmate leaves and returns the same or next day.' },
          { status: 'Release', color: 'bg-emerald-500', meaning: 'Formal discharge from custody. Inmate status is set to "Released". No return date expected.' },
        ]} />

        <SubHeading>Recording a Movement</SubHeading>
        <Steps items={[
          'Click "Record Movement" from the Dashboard or the Movements page.',
          'Select the Inmate.',
          'Select the Movement Type — this determines what additional fields appear.',
          'Set the Departure Date.',
          'For Transfers: select both the origin prison and the destination prison.',
          'For Hospital, Court, or Work Party: enter the destination as a text description.',
          'Optionally assign an Escorting Officer.',
          'Enter a Reason (required) and any additional Notes.',
          'Click "Record Movement" to save.',
        ]} />

        <SubHeading>Recording a Return</SubHeading>
        <Prose>
          Open movements (where the inmate has not yet returned) show a "Record Return" button on the Movements page. Click it to set today's date as the return date and update the inmate's status back to active.
        </Prose>

        <Warning>
          Release movements do not have a return date. Once an inmate is released via a Release movement, their status is permanently set to "Released". To reverse this you must manually update the inmate record.
        </Warning>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'inmateId', type: 'ref', required: true, description: 'The inmate being moved' },
          { field: 'movementType', type: 'enum', required: true, description: 'transfer | hospital | court | work_party | release' },
          { field: 'departureDate', type: 'date', required: true, description: 'Date the inmate left the facility' },
          { field: 'fromPrisonId', type: 'ref', required: false, description: 'Origin facility (required for transfers)' },
          { field: 'toPrisonId', type: 'ref', required: false, description: 'Destination facility (required for transfers)' },
          { field: 'destination', type: 'string', required: false, description: 'Free-text destination for non-transfer movements' },
          { field: 'officerId', type: 'ref', required: false, description: 'Escorting officer' },
          { field: 'reason', type: 'string', required: true, description: 'Reason for the movement' },
          { field: 'returnDate', type: 'date', required: false, description: 'Date the inmate returned to the facility' },
        ]} />
      </div>
    ),
  },
  {
    id: 'officers',
    number: '05',
    title: 'Officers',
    icon: UserShield01Icon,
    color: 'text-teal-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="05" title="Officers" />
        <Prose>
          Officers are prison wardens and staff registered in the system. They can be assigned as escorting officers on Movements, as approving officers on Visits, and as photographers or fingerprint capturers on biometric records.
        </Prose>

        <SubHeading>Registering an Officer</SubHeading>
        <Steps items={[
          'Navigate to Officers in the sidebar or click "Add Officer" from the Dashboard.',
          'Enter the officer\'s full name and badge number. The badge number must be unique across the system.',
          'Set their rank (e.g. Warden, Senior Warden, Superintendent).',
          'Enter their phone number.',
          'Assign them to a Prison facility.',
          'Click "Create Officer" to save.',
        ]} />

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'name', type: 'string', required: true, description: 'Officer\'s full name' },
          { field: 'badgeNumber', type: 'string', required: true, description: 'Unique badge or service number (e.g. WDN-001)' },
          { field: 'rank', type: 'string', required: false, description: 'Official rank or title' },
          { field: 'phone', type: 'string', required: false, description: 'Contact phone number' },
          { field: 'prisonId', type: 'ref', required: true, description: 'The facility this officer is assigned to' },
        ]} />

        <Tip>
          Use the Prison filter on the Officers page to quickly view all officers assigned to a specific facility.
        </Tip>
      </div>
    ),
  },
  {
    id: 'prisons',
    number: '06',
    title: 'Prisons & Facilities',
    icon: Building01Icon,
    color: 'text-violet-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="06" title="Prisons & Facilities" />
        <Prose>
          The Prisons module maintains the registry of all correctional facilities. At least one prison must exist before any inmate or officer can be registered. The system tracks live occupancy against each facility's stated capacity.
        </Prose>

        <SubHeading>Registering a Prison</SubHeading>
        <Steps items={[
          'Navigate to Prisons in the sidebar or click "Add Prison" from the Dashboard.',
          'Enter the prison\'s official name and a short unique code (e.g. LUP for Luzira Upper Prison).',
          'Select the facility type.',
          'Enter the Region, District, and Address.',
          'Set the Capacity — the maximum number of inmates the facility can hold. This is used for occupancy tracking on the Dashboard.',
          'Enter a contact phone number.',
          'Click "Create Prison" to save.',
        ]} />

        <SubHeading>Facility Types</SubHeading>
        <StatusGrid items={[
          { status: 'Main', color: 'bg-violet-500', meaning: 'Primary prison facility — holds sentenced offenders long-term.' },
          { status: 'Remand', color: 'bg-amber-500', meaning: 'Holds suspects awaiting trial. Typically higher throughput.' },
          { status: 'Open', color: 'bg-emerald-500', meaning: 'Minimum security, typically for low-risk, near-release inmates.' },
          { status: 'Farm', color: 'bg-teal-500', meaning: 'Agricultural facility — inmates work in supervised farming.' },
          { status: 'Branch', color: 'bg-blue-500', meaning: 'Satellite facility attached to a main prison.' },
        ]} />

        <SubHeading>Occupancy Tracking</SubHeading>
        <Prose>
          The Dashboard shows a live capacity bar for each prison that has a capacity set. The bar changes colour as occupancy increases:
        </Prose>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-500" /><span>Under 70% — Normal</span></div>
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-amber-500" /><span>70–90% — High</span></div>
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-red-500" /><span>Over 90% — Critical</span></div>
        </div>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'name', type: 'string', required: true, description: 'Official facility name' },
          { field: 'code', type: 'string', required: true, description: 'Short unique code (e.g. LUP). Used throughout the system.' },
          { field: 'type', type: 'enum', required: true, description: 'main | remand | open | farm | branch' },
          { field: 'region', type: 'string', required: false, description: 'Administrative region (e.g. Central)' },
          { field: 'district', type: 'string', required: false, description: 'District name' },
          { field: 'address', type: 'string', required: false, description: 'Physical address' },
          { field: 'capacity', type: 'number', required: false, description: 'Maximum inmate capacity for occupancy tracking' },
          { field: 'contactPhone', type: 'string', required: false, description: 'Facility contact number' },
        ]} />
      </div>
    ),
  },
  {
    id: 'courts',
    number: '07',
    title: 'Courts & Appearances',
    icon: JusticeHammerIcon,
    color: 'text-blue-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="07" title="Courts & Appearances" />
        <Prose>
          The Courts module maintains a registry of courts and tracks scheduled appearances for inmates. When an appearance is created, the inmate's Next Court Date field is updated automatically. When an outcome is recorded, the inmate's status may be updated based on the court's decision.
        </Prose>

        <SubHeading>Registering a Court</SubHeading>
        <Steps items={[
          'Open the sheet panel and select "Court" from the category switcher at the top.',
          'Enter the court\'s official name.',
          'Select the court type.',
          'Enter the district and address.',
          'Click "Create Court" to save.',
        ]} />

        <SubHeading>Court Types</SubHeading>
        <StatusGrid items={[
          { status: 'Magistrate', color: 'bg-blue-400', meaning: 'Handles minor criminal and civil cases.' },
          { status: 'Chief Magistrate', color: 'bg-blue-500', meaning: 'Higher magistrate jurisdiction for more serious cases.' },
          { status: 'High Court', color: 'bg-blue-700', meaning: 'Handles serious criminal cases including capital offenses.' },
          { status: 'Industrial Court', color: 'bg-indigo-500', meaning: 'Handles employment and labour disputes.' },
        ]} />

        <SubHeading>Scheduling an Appearance</SubHeading>
        <Steps items={[
          'Navigate to Court Appearances in the sidebar.',
          'Click "Schedule Appearance" and fill in the inmate, court, date, and escorting officer.',
          'The inmate\'s Next Court Date is updated automatically.',
          'On the appearance date, escort the inmate using a Court movement record.',
          'After the hearing, return to the appearance record and click "Record Outcome".',
        ]} />

        <Note>
          Upcoming appearances (from today onwards with no outcome) are shown in the Dashboard panel and sorted by date.
        </Note>
      </div>
    ),
  },
  {
    id: 'offenses',
    number: '08',
    title: 'Offenses',
    icon: WarningDiamondIcon,
    color: 'text-amber-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="08" title="Offenses" />
        <Prose>
          The Offenses module maintains a registry of chargeable offenses under Ugandan law. Each offense links to the relevant act, section, and chapter. When registering an inmate, an offense must be selected (or created inline) as their primary charge.
        </Prose>

        <SubHeading>Adding an Offense</SubHeading>
        <Steps items={[
          'Open the sheet panel and select "Offense" from the category switcher.',
          'Enter the offense name (e.g. Aggravated Robbery).',
          'Enter the Act (e.g. Penal Code Act), Section, and Chapter for legal reference.',
          'Select the offense category.',
          'Optionally enter the maximum sentence in years.',
          'Add a description if needed.',
          'Click "Create Offense" to save.',
        ]} />

        <SubHeading>Offense Categories</SubHeading>
        <StatusGrid items={[
          { status: 'Capital', color: 'bg-red-600', meaning: 'Carries the death penalty or life imprisonment.' },
          { status: 'Felony', color: 'bg-orange-500', meaning: 'Serious offense — imprisonment over one year.' },
          { status: 'Misdemeanor', color: 'bg-amber-500', meaning: 'Less serious offense — typically under one year.' },
          { status: 'Traffic', color: 'bg-blue-400', meaning: 'Road traffic violations that result in imprisonment.' },
        ]} />

        <Tip>
          You can create an offense inline while registering an inmate — click the + button next to the Offense dropdown in the inmate form. This is useful when processing urgent admissions.
        </Tip>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'name', type: 'string', required: true, description: 'Official name of the offense' },
          { field: 'act', type: 'string', required: false, description: 'Relevant legislation (e.g. Penal Code Act)' },
          { field: 'section', type: 'string', required: false, description: 'Section of the act' },
          { field: 'chapter', type: 'string', required: false, description: 'Chapter reference' },
          { field: 'category', type: 'enum', required: false, description: 'capital | felony | misdemeanor | traffic' },
          { field: 'maxSentenceYears', type: 'number', required: false, description: 'Maximum penalty in years' },
          { field: 'description', type: 'string', required: false, description: 'Additional description or notes' },
        ]} />
      </div>
    ),
  },
  {
    id: 'dashboard',
    number: '09',
    title: 'Dashboard',
    icon: ChartBarLineIcon,
    color: 'text-foreground',
    content: (
      <div className="space-y-5">
        <SectionHeading number="09" title="Dashboard" />
        <Prose>
          The Dashboard is the operational overview page. It provides live statistics, charts, alerts, and quick access to common actions. All data is sourced directly from the live database — no refresh is needed.
        </Prose>

        <SubHeading>Stat Cards</SubHeading>
        <Prose>
          The four stat cards at the top show: total inmates (with remand/convicted breakdown), visitors currently inside (with scheduled count), open movements (with at-court count), and active facilities (with officer count). These update in real time.
        </Prose>

        <SubHeading>Charts</SubHeading>
        <div className="space-y-2">
          {[
            { title: 'Admissions', desc: 'Area chart showing new inmate registrations per month over the last 6 months.' },
            { title: 'Status Split', desc: 'Donut chart showing the distribution of inmates across all status values.' },
            { title: 'Prison Occupancy', desc: 'Capacity bars per facility — colour changes from green → amber → red as capacity fills.' },
            { title: 'Movement Breakdown', desc: 'Bar chart showing the count of each movement type across all records.' },
            { title: 'Inmate Types', desc: 'Donut chart splitting inmates by type: Remand, Convict, Civil.' },
            { title: 'Visit Activity', desc: 'Area chart showing the number of visits scheduled per month over the last 6 months.' },
          ].map((c) => (
            <div key={c.title} className="flex items-start gap-2 text-sm">
              <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5 mt-0.5 shrink-0">{c.title}</span>
              <span className="text-muted-foreground">{c.desc}</span>
            </div>
          ))}
        </div>

        <SubHeading>Alerts</SubHeading>
        <Prose>
          If any inmate has a status of "Escaped", an orange alert banner appears at the top of the dashboard. This is visible to all users and links directly to the Inmates page for immediate review.
        </Prose>

        <SubHeading>Quick Actions</SubHeading>
        <Prose>
          The Quick Actions panel provides one-click access to the sheet panel pre-opened on the relevant form. Available: Add Inmate, Schedule Visit, Record Movement, Add Officer, Add Prison, Add Offense.
        </Prose>

        <SubHeading>Live Panels</SubHeading>
        <Prose>
          Three live panels below the charts show: upcoming court appearances (sorted by date), visitors currently inside the facility, and the most recent inmate admissions. All are linked to their full list pages.
        </Prose>
      </div>
    ),
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function RouteComponent() {
  const [activeId, setActiveId] = useState('overview')
  const [search, setSearch] = useState('')

  const activeSection = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0]

  const filtered = search.trim()
    ? SECTIONS.filter((s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.number.includes(search)
    )
    : SECTIONS

  return (
    <article className="flex flex-col gap-0 py-5 md:max-w-5xl w-full">

      {/* ── Page header ── */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <HugeiconsIcon icon={BookOpen01Icon} className="size-5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Documentation</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">System Reference</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prison Management Application — operational and technical reference for all modules.
        </p>
      </header>

      <div className="flex gap-6 items-start">

        {/* ── Sidebar nav ── */}
        <nav className="w-52 shrink-0 sticky top-10 hidden md:flex flex-col gap-1">
          {/* Search */}
          <div className="relative mb-2">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sections…"
              className="w-full rounded-lg border border-border bg-sidebar pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {filtered.map((s) => {
            const isActive = s.id === activeId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { setActiveId(s.id); setSearch('') }}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors w-full',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className="font-mono text-[10px] shrink-0 w-5 opacity-50">{s.number}</span>
                <HugeiconsIcon icon={s.icon} className={cn('size-3.5 shrink-0', isActive ? s.color : '')} />
                {s.title}
              </button>
            )
          })}

          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-2">No sections match.</p>
          )}
        </nav>

        {/* ── Mobile section picker ── */}
        <div className="md:hidden w-full mb-4">
          <select
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
            className="w-full rounded-lg border border-border bg-sidebar px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.number} — {s.title}</option>
            ))}
          </select>
        </div>

        {/* ── Content area ── */}
        <main className="flex-1 min-w-0 rounded-xl border border-border/60 bg-sidebar p-6 md:p-8">
          {activeSection.content}

          {/* Section navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/60">
            {(() => {
              const idx = SECTIONS.findIndex((s) => s.id === activeId)
              const prev = SECTIONS[idx - 1]
              const next = SECTIONS[idx + 1]
              return (
                <>
                  {prev ? (
                    <button
                      type="button"
                      onClick={() => setActiveId(prev.id)}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 rotate-180" />
                      <span><span className="font-mono opacity-60">{prev.number}</span> {prev.title}</span>
                    </button>
                  ) : <span />}
                  {next ? (
                    <button
                      type="button"
                      onClick={() => setActiveId(next.id)}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                    >
                      <span><span className="font-mono opacity-60">{next.number}</span> {next.title}</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                    </button>
                  ) : <span />}
                </>
              )
            })()}
          </div>
        </main>
      </div>
    </article>
  )
}