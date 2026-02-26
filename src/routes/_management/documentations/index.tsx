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
  FingerPrintIcon as Fingerprint02Icon,
  Download01Icon,
  FileEditIcon,
} from '@hugeicons/core-free-icons'

export const Route = createFileRoute('/_management/documentations/')({
  component: RouteComponent,
})

type Section = {
  id: string
  number: string
  title: string
  icon: any
  color: string
  content: React.ReactNode
}

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
            <span className="text-xs font-semibold capitalize">{item.status.replace(/_/g, ' ')}</span>
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
  return <h3 className="text-sm font-semibold tracking-tight mt-6 mb-3 text-foreground">{children}</h3>
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
}

function FeatureList({ items }: { items: { label: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-2 rounded-lg border border-border/60 bg-sidebar/50 px-3 py-2.5">
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-muted-foreground shrink-0 mt-1" />
          <div>
            <span className="text-xs font-semibold">{item.label}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Code inline ─────────────────────────────────────────────────────────────
function C({ children }: { children: React.ReactNode }) {
  return <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{children}</code>
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  // 01 ─ Overview
  {
    id: 'overview', number: '01', title: 'System Overview',
    icon: BookOpen01Icon, color: 'text-foreground',
    content: (
      <div className="space-y-5">
        <SectionHeading number="01" title="System Overview" />
        <Prose>
          The Prison Management Application (PMA) is a centralised, real-time platform for managing Uganda's correctional facilities.
          It tracks inmates, movements, visits, officers, courts, offenses, and biometric records across all registered facilities.
          All data is synced live — changes by one user are immediately visible to all others without refreshing.
        </Prose>

        <SubHeading>Core Modules</SubHeading>
        <FeatureList items={[
          { label: 'Inmates', desc: 'Registration, classification, case management, individual profiles, and official PDF export' },
          { label: 'Visits', desc: 'Visitor scheduling, check-in / check-out with live presence tracking' },
          { label: 'Movements', desc: 'Transfers, hospital escorts, court escorts, work parties, and releases' },
          { label: 'Officers', desc: 'Officer registration, assignment, biometrics, and shift attendance' },
          { label: 'Prisons', desc: 'Facility registry, capacity configuration, and live occupancy tracking' },
          { label: 'Courts', desc: 'Court registry (Tab 1) and full appearances log (Tab 2) with outcome recording' },
          { label: 'Court Appearances', desc: '3-step scheduling wizard with inline outcome capture for past dates' },
          { label: 'Offenses', desc: 'Chargeable offense registry linked to Uganda\'s Penal Code with usage tracking' },
          { label: 'Biometrics', desc: 'Mugshot capture (webcam / URL / upload), fingerprints, and supervisor confirmation workflow' },
          { label: 'Dashboard', desc: 'Live stat cards, charts, escape alerts, quick actions, and operational panels' },
        ]} />

        <SubHeading>Getting Started</SubHeading>
        <Steps items={[
          'Open the Dashboard to see a live operational overview.',
          'Register at least one Prison before adding inmates or officers.',
          'Add Offenses to the registry — a primary offense is required when registering an inmate.',
          'Register Inmates using the "Add Inmate" sheet accessible from the sidebar or the Dashboard quick actions.',
          'Schedule Visits and record Movements as day-to-day operations require.',
          'Use the Courts module to register courts, schedule appearances, and record outcomes.',
          'Use the Biometrics panel (inside the Inmate or Officer form) to capture mugshots and fingerprints after saving the record.',
        ]} />

        <SubHeading>The Sheet Panel</SubHeading>
        <Prose>
          The unified sheet panel can be opened from any page and contains 8 creation forms accessible via a pill switcher at the top:
          Inmate, Visitor, Movement, Officer, Prison, Court, Appearance, and Offense.
          Switching category resets the form. Most forms support inline quick-create for related records
          (e.g. creating a new offense or prison while filling in the inmate form).
        </Prose>

        <Note>All data is stored in Convex, a real-time serverless database. There is no save/publish step — records are live immediately after creation.</Note>
      </div>
    ),
  },

  // 02 ─ Inmates
  {
    id: 'inmates', number: '02', title: 'Inmate Management',
    icon: UserAdd01Icon, color: 'text-rose-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="02" title="Inmate Management" />
        <Prose>
          The Inmates module is the core of the system. Every person in custody must be registered here before any other records
          (visits, movements, court appearances) can be created for them.
        </Prose>

        <SubHeading>Registering an Inmate</SubHeading>
        <Steps items={[
          'Click "Add Inmate" from the Dashboard or the sidebar.',
          'Fill in Personal Information: first name, last name, date of birth, gender, national ID, nationality, tribe, religion, marital status, education, and occupation.',
          'Enter a unique Prison Number (e.g. LUZ/2024/001) — the system rejects duplicates.',
          'Set Classification: Inmate Type, Status, and Risk Level.',
          'Select the Prison. If not listed, click the + icon to quick-create it inline.',
          'Enter the Case Number, Admission Date, and select the primary Offense. If not listed, quick-create it inline.',
          'Optionally set Sentence Start, Sentence End, Sentence Duration, Remand Expiry, Next Court Date, and Cell Block/Number.',
          'Fill in Next of Kin details and any notes.',
          'Click "Create Inmate" to save.',
        ]} />

        <SubHeading>Inmate Register — List Page Features</SubHeading>
        <FeatureList items={[
          { label: 'Default Sort', desc: 'Newest first — a toggle button switches to oldest first' },
          { label: 'Status Stat Strip', desc: '7 clickable cards showing live counts per status — click any to filter the table' },
          { label: 'Search', desc: 'Filters by name with a live filtered / total count indicator' },
          { label: 'Gender / Type / Risk Filters', desc: 'Dropdown filters that stack — a "Clear" link resets all at once' },
          { label: 'Row Highlighting', desc: 'Escaped inmates get an orange tint; Maximum risk inmates get a red tint' },
          { label: 'Row Selection', desc: 'Checkbox column — selecting rows shows a floating toolbar with an "Export selected" button' },
          { label: 'Export PDF', desc: 'Exports filtered set as a 2-section official register PDF (see §11 PDF Export)' },
          { label: 'Page Size Control', desc: '10 / 25 / 50 / 100 rows per page selector' },
        ]} />

        <SubHeading>Inmate Profile Page</SubHeading>
        <Prose>
          Clicking a prison number or inmate name opens the full profile at <C>/inmates/:id</C>. The page includes:
        </Prose>
        <FeatureList items={[
          { label: 'Hero Card', desc: 'Gradient header with mugshot (or coloured initials avatar), name, badges, offense banner, and 4 stat cards: age, days inside, fingerprint count, court appearances' },
          { label: 'Overdue Court Alert', desc: 'Amber banner if any appearances are past their date with no outcome — links to Courts page' },
          { label: 'Location Banner', desc: 'Current prison, block, cell, with a "Schedule court" quick action' },
          { label: 'Inline Editing', desc: 'Toggle Edit mode to edit individual fields in-place — each saves independently with a toast confirmation' },
          { label: 'Collapsible Sections', desc: 'Personal Details, Next of Kin, Case Info (with remand expiry and next court date callouts), Court Appearances, Movements, Medical Records, Items in Custody, Visits, Biometrics' },
          { label: 'Biometrics Section', desc: 'Photo grid with primary photo ring, fingerprint grid (5R + 5L) with confirmed state and progress bar' },
          { label: 'Download PDF', desc: 'Generates a full individual inmate file PDF (Tauri save dialog on desktop, browser download in web)' },
        ]} />

        <SubHeading>Inmate Types</SubHeading>
        <StatusGrid items={[
          { status: 'Remand', color: 'bg-amber-500', meaning: 'Held awaiting trial. Not yet convicted. Will typically have frequent court appearances.' },
          { status: 'Convict', color: 'bg-red-500', meaning: 'Sentenced following conviction. Has a defined sentence duration.' },
          { status: 'Civil', color: 'bg-blue-500', meaning: 'Held for civil contempt, debt enforcement, or other non-criminal court orders.' },
        ]} />

        <SubHeading>Inmate Status Values</SubHeading>
        <StatusGrid items={[
          { status: 'Remand', color: 'bg-amber-500', meaning: 'Active — awaiting trial, currently housed in the facility.' },
          { status: 'Convict', color: 'bg-red-500', meaning: 'Active — serving a sentence in the facility.' },
          { status: 'At Court', color: 'bg-blue-500', meaning: 'Temporarily out — escorted to court. Set automatically when a court movement is recorded.' },
          { status: 'Released', color: 'bg-emerald-500', meaning: 'No longer in custody. Set automatically on Acquitted or Bail Granted court outcomes, or when a Release movement is recorded.' },
          { status: 'Transferred', color: 'bg-violet-500', meaning: 'Moved to another facility. Set automatically when a Transfer movement is saved.' },
          { status: 'Escaped', color: 'bg-orange-500', meaning: 'Escaped from custody. Triggers a Dashboard alert visible to all users.' },
          { status: 'Deceased', color: 'bg-zinc-400', meaning: 'Deceased while in custody. Record is preserved for audit trail.' },
        ]} />

        <SubHeading>Risk Levels</SubHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { level: 'Low', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', note: 'Standard supervision' },
            { level: 'Medium', bg: 'bg-amber-50 border-amber-200 text-amber-700', note: 'Moderate supervision' },
            { level: 'High', bg: 'bg-orange-50 border-orange-200 text-orange-700', note: 'Enhanced supervision' },
            { level: 'Maximum', bg: 'bg-red-50 border-red-200 text-red-700', note: 'Strict isolation protocols' },
          ].map((r) => (
            <div key={r.level} className={cn('rounded-lg border px-3 py-2.5', r.bg)}>
              <p className="font-semibold">{r.level}</p>
              <p className="opacity-80 mt-0.5">{r.note}</p>
            </div>
          ))}
        </div>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'prisonNumber', type: 'string', required: true, description: 'Unique facility-assigned ID (e.g. LUZ/2024/001)' },
          { field: 'firstName / lastName', type: 'string', required: true, description: 'Legal name' },
          { field: 'otherNames', type: 'string', required: false, description: 'Middle or additional names' },
          { field: 'nationalId', type: 'string', required: false, description: 'Uganda National ID number' },
          { field: 'dob', type: 'date', required: true, description: 'Date of birth — used to calculate age throughout the system' },
          { field: 'gender', type: 'enum', required: true, description: 'male | female' },
          { field: 'nationality / tribe / religion', type: 'string', required: false, description: 'Demographic details' },
          { field: 'maritalStatus / educationLevel / occupation', type: 'string', required: false, description: 'Personal background fields' },
          { field: 'inmateType', type: 'enum', required: true, description: 'remand | convict | civil' },
          { field: 'status', type: 'enum', required: true, description: 'Current custody status — 7 possible values' },
          { field: 'riskLevel', type: 'enum', required: false, description: 'low | medium | high | maximum' },
          { field: 'prisonId', type: 'ref', required: true, description: 'Assigned prison facility' },
          { field: 'offenseId', type: 'ref', required: true, description: 'Primary offense' },
          { field: 'caseNumber', type: 'string', required: true, description: 'Court case reference number' },
          { field: 'admissionDate', type: 'date', required: true, description: 'Date entered custody' },
          { field: 'arrestingStation', type: 'string', required: false, description: 'Police station that made the arrest' },
          { field: 'remandExpiry', type: 'date', required: false, description: 'Date remand order expires — shown as callout on profile' },
          { field: 'nextCourtDate', type: 'date', required: false, description: 'Auto-updated when appearances are scheduled' },
          { field: 'convictionDate', type: 'date', required: false, description: 'Date of conviction' },
          { field: 'sentenceStart / sentenceEnd', type: 'date', required: false, description: 'Sentence period' },
          { field: 'sentenceDuration', type: 'string', required: false, description: 'Human-readable duration (e.g. "3 years")' },
          { field: 'isLifeSentence', type: 'boolean', required: false, description: 'Life sentence flag' },
          { field: 'fineAmount / finePaid', type: 'number / boolean', required: false, description: 'Fine in UGX and payment status' },
          { field: 'cellBlock / cellNumber', type: 'string', required: false, description: 'Housing assignment (e.g. Block A / 12B)' },
          { field: 'nextOfKin*', type: 'string', required: false, description: 'Name, phone, and relationship of next of kin' },
          { field: 'notes', type: 'string', required: false, description: 'Free-text notes' },
        ]} />

        <Warning>
          Setting status to "Escaped" displays a prominent alert banner on the Dashboard for all users.
          Only set this after proper incident reporting procedures have been followed.
        </Warning>
      </div>
    ),
  },

  // 03 ─ Biometrics
  {
    id: 'biometrics', number: '03', title: 'Biometrics',
    icon: Fingerprint02Icon, color: 'text-slate-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="03" title="Biometrics" />
        <Prose>
          The biometrics panel is a shared component used inside both the Inmate form and the Officer form.
          It handles mugshot photos and fingerprint templates.
          All biometric records start as unconfirmed and require supervisor confirmation before being treated as authoritative.
          The panel is only enabled after the parent record has been saved.
        </Prose>

        <SubHeading>Photo Capture Methods</SubHeading>
        <StatusGrid items={[
          { status: 'Webcam (Internal)', color: 'bg-blue-500', meaning: 'Opens the device camera in-browser. Take a live snapshot — stored in Convex file storage.' },
          { status: 'External URL', color: 'bg-violet-500', meaning: 'Paste a URL pointing to a photo on an external system (e.g. national ID database).' },
          { status: 'Upload', color: 'bg-emerald-500', meaning: 'Pick an image file from disk. Uploaded to Convex storage with a base64 preview stored alongside.' },
        ]} />

        <SubHeading>Photo Types</SubHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {[
            { t: 'Mugshot — Front', note: 'Standard full-face photograph (default for inmates)' },
            { t: 'Mugshot — Side', note: 'Left or right profile view' },
            { t: 'Mugshot — ¾ View', note: 'Three-quarter angle' },
            { t: 'Profile Photo', note: 'Used for officer records' },
            { t: 'Document / ID', note: 'Copy of an identity document' },
          ].map((p) => (
            <div key={p.t} className="rounded-lg border border-border/60 bg-sidebar/50 px-3 py-2">
              <p className="font-semibold">{p.t}</p>
              <p className="text-muted-foreground mt-0.5">{p.note}</p>
            </div>
          ))}
        </div>

        <SubHeading>Fingerprint Capture Methods</SubHeading>
        <Prose>Fingerprints are stored per-finger (10 fingers total — 5 right, 5 left):</Prose>
        <StatusGrid items={[
          { status: 'USB Scanner (Internal)', color: 'bg-blue-500', meaning: 'Integration point for a Tauri USB fingerprint scanner plugin. Captures the raw scan image.' },
          { status: 'External Template', color: 'bg-violet-500', meaning: 'Paste a base64-encoded WSQ or ISO minutiae template from a 3rd-party device.' },
          { status: 'Upload Template File', color: 'bg-emerald-500', meaning: 'Upload a .wsq or .bin file from disk to Convex storage.' },
        ]} />

        <SubHeading>Confirmation Workflow</SubHeading>
        <Prose>
          Every photo and fingerprint record is initially <C>isConfirmed: false</C>.
          When a supervising officer is identified (the <C>capturedById</C> prop), inline Confirm and Reject buttons appear on each record.
          Confirmed records display a green checkmark. Rejected records are removed.
          This ensures biometric data is reviewed before being treated as authoritative.
        </Prose>

        <SubHeading>Primary Photo</SubHeading>
        <Prose>
          One photo per inmate can be marked as primary. It is displayed as the profile image in the hero card on the inmate's profile page.
          If no primary is set, the first available photo is used. If no photos exist, a coloured initials avatar is shown instead.
        </Prose>

        <Note>The biometrics panel is disabled until the inmate or officer record has been saved. If accessed before saving, an amber notice prompts the user to save first.</Note>
      </div>
    ),
  },

  // 04 ─ Visits
  {
    id: 'visits', number: '04', title: 'Visit Management',
    icon: UserMultiple02Icon, color: 'text-sky-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="04" title="Visit Management" />
        <Prose>
          The Visits module tracks all civilian visitors entering the facility to see inmates.
          Each visit must be scheduled and passes through a lifecycle from scheduled to completed.
          Visitors currently inside the facility are tracked in real time on the Dashboard.
        </Prose>

        <SubHeading>Visit Lifecycle</SubHeading>
        <div className="flex items-center gap-1 flex-wrap text-xs">
          {['Scheduled', '→', 'Checked In', '→', 'Completed'].map((step, i) => (
            <span key={i} className={cn(
              i % 2 === 0 ? 'rounded border px-2.5 py-1 font-medium bg-sidebar border-border' : 'text-muted-foreground font-bold'
            )}>{step}</span>
          ))}
          <span className="text-muted-foreground ml-2">or</span>
          <span className="rounded border px-2.5 py-1 font-medium bg-red-50 border-red-200 text-red-700 ml-1">Denied</span>
          <span className="rounded border px-2.5 py-1 font-medium bg-orange-50 border-orange-200 text-orange-700 ml-1">Cancelled</span>
        </div>

        <SubHeading>Scheduling a Visit</SubHeading>
        <Steps items={[
          'Click "Schedule Visit" from the Dashboard or the Visits page.',
          'Select the Inmate being visited.',
          'Select the Prison where the visit takes place.',
          'Set the Scheduled Date (optional).',
          'Enter the visitor\'s full name, ID number, ID type, and relationship to the inmate.',
          'Enter the visitor\'s phone number (required for contact tracing).',
          'Declare any items the visitor intends to bring in.',
          'Click "Schedule Visit" to save.',
        ]} />

        <SubHeading>Check-In & Check-Out</SubHeading>
        <Steps items={[
          'When the visitor arrives, click "Check In" — check-in time is recorded automatically.',
          'The visit status becomes "Inside" and the visitor appears in the Dashboard "Visitors Inside Now" panel.',
          'When the visit ends, click "Check Out" — departure time is recorded and the visit is marked completed.',
        ]} />

        <SubHeading>Visit Status Reference</SubHeading>
        <StatusGrid items={[
          { status: 'Scheduled', color: 'bg-sky-500', meaning: 'Approved and awaiting the visitor on the day.' },
          { status: 'Inside', color: 'bg-emerald-500', meaning: 'Visitor has checked in and is currently in the facility.' },
          { status: 'Completed', color: 'bg-zinc-400', meaning: 'Visit concluded. Visitor has departed.' },
          { status: 'Denied', color: 'bg-red-500', meaning: 'Entry refused — security concern or rule violation.' },
          { status: 'Cancelled', color: 'bg-orange-500', meaning: 'Visit cancelled before it took place.' },
        ]} />

        <Tip>Filter the Visits page by "Inside" status to see all visitors currently present in the facility.</Tip>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'inmateId', type: 'ref', required: true, description: 'The inmate being visited' },
          { field: 'prisonId', type: 'ref', required: true, description: 'Facility where the visit occurs' },
          { field: 'fullName', type: 'string', required: true, description: 'Visitor\'s full legal name' },
          { field: 'idNumber', type: 'string', required: true, description: 'Visitor\'s ID document number' },
          { field: 'idType', type: 'enum', required: false, description: 'national_id | passport | driving_permit' },
          { field: 'relationship', type: 'string', required: true, description: 'Relationship to the inmate (e.g. Spouse)' },
          { field: 'phone', type: 'string', required: true, description: 'Visitor\'s contact number' },
          { field: 'scheduledDate', type: 'date', required: false, description: 'Date visit is scheduled for' },
          { field: 'reason', type: 'string', required: false, description: 'Purpose of the visit' },
          { field: 'itemsDeclaration', type: 'string', required: false, description: 'Items the visitor declares to bring in' },
        ]} />
      </div>
    ),
  },

  // 05 ─ Movements
  {
    id: 'movements', number: '05', title: 'Movement Records',
    icon: ArrowMoveLeftRight02Icon, color: 'text-indigo-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="05" title="Movement Records" />
        <Prose>
          A Movement is recorded any time an inmate leaves the facility or is moved between facilities.
          Movements create a full audit trail and automatically update inmate status and prison assignment as appropriate.
        </Prose>

        <SubHeading>Movement Types & Status Effects</SubHeading>
        <StatusGrid items={[
          { status: 'Transfer', color: 'bg-violet-500', meaning: 'Permanent move. Inmate\'s assigned prison is updated automatically. Status → Transferred.' },
          { status: 'Hospital', color: 'bg-red-500', meaning: 'Medical escort — inmate leaves and returns after treatment.' },
          { status: 'Court', color: 'bg-blue-500', meaning: 'Court escort. Status → At Court until a return date is recorded.' },
          { status: 'Work Party', color: 'bg-amber-500', meaning: 'External supervised work assignment.' },
          { status: 'Release', color: 'bg-emerald-500', meaning: 'Formal discharge. Status → Released permanently. No return expected.' },
        ]} />

        <SubHeading>Recording a Movement</SubHeading>
        <Steps items={[
          'Click "Record Movement" from the Dashboard or Movements page.',
          'Select the Inmate.',
          'Select the Movement Type (additional fields appear based on type).',
          'Set the Departure Date.',
          'For Transfers: select origin and destination prisons.',
          'For Hospital / Court / Work Party: enter the destination as free text.',
          'Optionally assign an Escorting Officer.',
          'Enter a Reason (required) and Notes.',
          'Click "Record Movement" to save.',
        ]} />

        <SubHeading>Recording a Return</SubHeading>
        <Prose>
          Open movements (no return date recorded) show a "Record Return" button on the Movements page.
          Clicking it sets today as the return date and reverts the inmate's status back to active.
        </Prose>

        <SubHeading>Release Reasons</SubHeading>
        <StatusGrid items={[
          { status: 'Sentence Served', color: 'bg-emerald-500', meaning: 'Sentence fully served.' },
          { status: 'Bail', color: 'bg-sky-500', meaning: 'Released on bail awaiting trial.' },
          { status: 'Acquitted', color: 'bg-blue-500', meaning: 'Court found not guilty.' },
          { status: 'Pardon', color: 'bg-violet-500', meaning: 'Presidential or judicial pardon.' },
          { status: 'Fine Paid', color: 'bg-amber-500', meaning: 'Fine paid in lieu of imprisonment.' },
        ]} />

        <Warning>Release movements have no return date. Once saved, status is permanently set to "Released". To reverse, manually update the inmate's status from their profile.</Warning>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'inmateId', type: 'ref', required: true, description: 'The inmate being moved' },
          { field: 'movementType', type: 'enum', required: true, description: 'transfer | hospital | court | work_party | release' },
          { field: 'departureDate', type: 'date', required: true, description: 'Date the inmate left' },
          { field: 'fromPrisonId', type: 'ref', required: false, description: 'Origin facility (required for transfers)' },
          { field: 'toPrisonId', type: 'ref', required: false, description: 'Destination facility (required for transfers)' },
          { field: 'destination', type: 'string', required: false, description: 'Free-text destination for non-transfer types' },
          { field: 'officerId', type: 'ref', required: false, description: 'Escorting officer' },
          { field: 'reason', type: 'string', required: true, description: 'Reason for the movement' },
          { field: 'returnDate', type: 'date', required: false, description: 'Date returned (triggers status revert)' },
          { field: 'releaseReason', type: 'enum', required: false, description: 'served | bail | acquitted | pardon | fine_paid' },
        ]} />
      </div>
    ),
  },

  // 06 ─ Officers
  {
    id: 'officers', number: '06', title: 'Officers & Attendance',
    icon: UserShield01Icon, color: 'text-teal-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="06" title="Officers & Attendance" />
        <Prose>
          Officers are prison wardens and staff registered in the system. They can be assigned as escorting officers on Movements,
          as approving officers on Visits, and as biometric capturers. The system also tracks shift attendance per officer.
        </Prose>

        <SubHeading>Registering an Officer</SubHeading>
        <Steps items={[
          'Navigate to Officers or click "Add Officer" from the Dashboard.',
          'Enter full name and a unique Badge Number (e.g. WDN-001).',
          'Set rank (e.g. Warden, Senior Warden, Superintendent).',
          'Enter phone number.',
          'Assign to a Prison facility.',
          'Click "Create Officer" to save.',
        ]} />

        <SubHeading>Attendance Tracking</SubHeading>
        <Prose>
          Attendance is recorded per officer, per day, per shift. Each record captures the status, optional check-in/check-out times, and hours worked.
        </Prose>

        <SubHeading>Attendance Status</SubHeading>
        <StatusGrid items={[
          { status: 'Present', color: 'bg-emerald-500', meaning: 'Officer reported for the assigned shift.' },
          { status: 'Absent', color: 'bg-red-500', meaning: 'Did not report and was not excused.' },
          { status: 'Late', color: 'bg-amber-500', meaning: 'Arrived after shift start time.' },
          { status: 'Half Day', color: 'bg-blue-400', meaning: 'Only worked half the shift.' },
          { status: 'Off Duty', color: 'bg-zinc-400', meaning: 'Rostered off, on leave, or rest day.' },
        ]} />

        <SubHeading>Shift Types</SubHeading>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: 'Morning', color: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'Afternoon', color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Night', color: 'bg-slate-100 border-slate-300 text-slate-700' },
          ].map((s) => (
            <span key={s.label} className={cn('rounded border px-3 py-1.5 font-medium', s.color)}>{s.label}</span>
          ))}
        </div>

        <SubHeading>Officer Biometrics</SubHeading>
        <Prose>Officers have the same biometrics panel as inmates, limited to the "Profile Photo" type. The same confirmation workflow applies.</Prose>

        <SubHeading>Fields Reference — Officer</SubHeading>
        <FieldTable rows={[
          { field: 'name', type: 'string', required: true, description: 'Full name' },
          { field: 'badgeNumber', type: 'string', required: true, description: 'Unique badge / service number' },
          { field: 'rank', type: 'string', required: false, description: 'Official rank or title' },
          { field: 'phone', type: 'string', required: false, description: 'Contact phone' },
          { field: 'prisonId', type: 'ref', required: true, description: 'Assigned facility' },
          { field: 'isActive', type: 'boolean', required: false, description: 'Whether the officer is currently active' },
        ]} />

        <SubHeading>Fields Reference — Attendance</SubHeading>
        <FieldTable rows={[
          { field: 'officerId', type: 'ref', required: true, description: 'The officer this record belongs to' },
          { field: 'prisonId', type: 'ref', required: true, description: 'Facility for this attendance entry' },
          { field: 'date', type: 'string', required: true, description: 'ISO date (YYYY-MM-DD)' },
          { field: 'shift', type: 'enum', required: true, description: 'morning | afternoon | night' },
          { field: 'status', type: 'enum', required: true, description: 'present | absent | late | half_day | off_duty' },
          { field: 'checkInTime', type: 'string', required: false, description: 'Actual check-in time HH:MM' },
          { field: 'checkOutTime', type: 'string', required: false, description: 'Actual check-out time HH:MM' },
          { field: 'hoursWorked', type: 'number', required: false, description: 'Total hours worked this shift' },
          { field: 'recordedById', type: 'ref', required: false, description: 'Officer who entered this record' },
        ]} />

        <Tip>Use the Prison filter on the Officers page to view all officers assigned to a specific facility.</Tip>
      </div>
    ),
  },

  // 07 ─ Prisons
  {
    id: 'prisons', number: '07', title: 'Prisons & Facilities',
    icon: Building01Icon, color: 'text-violet-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="07" title="Prisons & Facilities" />
        <Prose>
          The Prisons module maintains the registry of all correctional facilities.
          At least one prison must exist before any inmate or officer can be registered.
          The system tracks live occupancy against each facility's stated capacity.
        </Prose>

        <SubHeading>Registering a Prison</SubHeading>
        <Steps items={[
          'Navigate to Prisons or click "Add Prison" from the Dashboard.',
          'Enter the official name and a short unique code (e.g. LUP for Luzira Upper Prison).',
          'Select the facility type.',
          'Enter Region, District, and Address.',
          'Set Capacity — the maximum inmate count, used for occupancy tracking.',
          'Enter a contact phone number.',
          'Click "Create Prison" to save.',
        ]} />

        <SubHeading>Facility Types</SubHeading>
        <StatusGrid items={[
          { status: 'Main', color: 'bg-violet-500', meaning: 'Primary prison holding sentenced offenders long-term.' },
          { status: 'Remand', color: 'bg-amber-500', meaning: 'Holds suspects awaiting trial. Higher inmate throughput.' },
          { status: 'Open', color: 'bg-emerald-500', meaning: 'Minimum security, typically for low-risk near-release inmates.' },
          { status: 'Farm', color: 'bg-teal-500', meaning: 'Agricultural facility — inmates work under supervised farming.' },
          { status: 'Branch', color: 'bg-blue-500', meaning: 'Satellite facility attached to a main prison.' },
        ]} />

        <SubHeading>Occupancy Tracking</SubHeading>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-500" /><span>Under 70% — Normal</span></div>
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-amber-500" /><span>70–90% — High</span></div>
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-red-500" /><span>Over 90% — Critical</span></div>
        </div>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'name', type: 'string', required: true, description: 'Official facility name' },
          { field: 'code', type: 'string', required: true, description: 'Short unique code (e.g. LUP)' },
          { field: 'type', type: 'enum', required: true, description: 'main | remand | open | farm | branch' },
          { field: 'region', type: 'string', required: false, description: 'Administrative region (e.g. Central)' },
          { field: 'district', type: 'string', required: false, description: 'District name' },
          { field: 'address', type: 'string', required: false, description: 'Physical address' },
          { field: 'capacity', type: 'number', required: false, description: 'Maximum inmate capacity for occupancy tracking' },
          { field: 'contactPhone', type: 'string', required: false, description: 'Facility contact number' },
          { field: 'isActive', type: 'boolean', required: false, description: 'Whether the facility is currently operational' },
        ]} />
      </div>
    ),
  },

  // 08 ─ Courts
  {
    id: 'courts', number: '08', title: 'Courts & Appearances',
    icon: JusticeHammerIcon, color: 'text-blue-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="08" title="Courts & Appearances" />
        <Prose>
          The Courts module has two tabs: the Courts Registry and the Appearances Log.
          Courts are registered separately from appearances. When an appearance is scheduled,
          the inmate's Next Court Date is updated automatically. When an outcome is recorded,
          the inmate's status may change based on the court's decision.
        </Prose>

        <SubHeading>Courts Registry Tab</SubHeading>
        <Prose>
          Lists all courts with a type filter and stat strip showing counts per type.
          Each court row displays how many appearances have been recorded against it.
          Courts with no appearances can be deleted; courts with active appearances cannot.
        </Prose>

        <SubHeading>Court Types</SubHeading>
        <StatusGrid items={[
          { status: 'Magistrate', color: 'bg-blue-400', meaning: 'Handles minor criminal and civil cases.' },
          { status: 'Chief Magistrate', color: 'bg-blue-500', meaning: 'Higher magistrate jurisdiction for more serious cases.' },
          { status: 'High Court', color: 'bg-blue-700', meaning: 'Serious criminal cases including capital offenses.' },
          { status: 'Industrial Court', color: 'bg-indigo-500', meaning: 'Employment and labour disputes.' },
        ]} />

        <SubHeading>Appearances Log Tab</SubHeading>
        <Prose>
          Shows all scheduled appearances with three filter pills: <strong>Upcoming</strong> (future, no outcome),
          <strong> Pending outcome</strong> (no outcome, any date), and <strong>Past</strong> (all past dates).
          Rows with a past date and no outcome are highlighted in red as overdue.
          A pulsing alert strip at the top of the tab shows the count of appearances scheduled for today.
        </Prose>

        <SubHeading>Scheduling an Appearance — 3-Step Wizard</SubHeading>
        <Steps items={[
          'Open the sheet panel and select "Appearance". The form is a 3-step wizard.',
          'Step 1 — Select Inmate: choose from active inmates. A preview card shows the inmate\'s status, case number, and any existing next court date (with overdue warning if applicable).',
          'Step 2 — Hearing Details: select the Court (with inline quick-create for new courts), set the scheduled date, and enter a departure time. If the date is in the past, an amber callout offers to record the outcome immediately.',
          'Step 3 — Escort & Notes: review the summary, optionally assign an escorting officer, and add notes. Click "Schedule Appearance" to save.',
        ]} />

        <SubHeading>Inline Outcome for Past Dates</SubHeading>
        <Prose>
          On Step 2, if the scheduled date has already passed, a toggle "Record outcome now (optional)" appears.
          Enabling it reveals outcome pills and return time so the appearance and its result can be submitted together —
          useful when catching up on appearances that were not logged at the time.
        </Prose>

        <SubHeading>Recording an Outcome</SubHeading>
        <Prose>
          On the Appearances Log, rows with no outcome show a "Record Outcome" button.
          This opens a sheet with outcome pills, return time, optional next date, and notes fields.
        </Prose>

        <SubHeading>Outcomes & Automatic Status Changes</SubHeading>
        <StatusGrid items={[
          { status: 'Adjourned', color: 'bg-amber-500', meaning: 'Hearing postponed. Inmate returns to facility. Next court date updated if provided.' },
          { status: 'Convicted', color: 'bg-red-500', meaning: 'Found guilty. Inmate status → Convict.' },
          { status: 'Acquitted', color: 'bg-emerald-500', meaning: 'Found not guilty. Inmate status → Released.' },
          { status: 'Bail Granted', color: 'bg-sky-500', meaning: 'Bail approved. Inmate status → Released.' },
          { status: 'Remanded', color: 'bg-orange-500', meaning: 'Returned to custody pending next hearing. Status → Remand.' },
        ]} />

        <Note>Today's appearances show a pulsing dot on the Appearances tab and also appear in the Dashboard "Upcoming Court Appearances" panel.</Note>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'inmateId', type: 'ref', required: true, description: 'The inmate appearing in court' },
          { field: 'courtId', type: 'ref', required: true, description: 'The court for the appearance' },
          { field: 'scheduledDate', type: 'date', required: true, description: 'Date of the hearing' },
          { field: 'departureTime', type: 'string', required: false, description: 'Departure time from facility (HH:MM)' },
          { field: 'officerId', type: 'ref', required: false, description: 'Escorting officer' },
          { field: 'outcome', type: 'enum', required: false, description: 'adjourned | convicted | acquitted | bail_granted | remanded' },
          { field: 'returnTime', type: 'string', required: false, description: 'Time returned to facility (HH:MM)' },
          { field: 'nextDate', type: 'date', required: false, description: 'Next court date (for adjourned / remanded)' },
          { field: 'notes', type: 'string', required: false, description: 'Free-text notes about the hearing' },
        ]} />
      </div>
    ),
  },

  // 09 ─ Offenses
  {
    id: 'offenses', number: '09', title: 'Offenses',
    icon: WarningDiamondIcon, color: 'text-amber-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="09" title="Offenses" />
        <Prose>
          The Offenses module maintains a registry of chargeable offenses under Ugandan law.
          Each offense links to the relevant act, section, and chapter.
          A primary offense must be selected when registering an inmate.
        </Prose>

        <SubHeading>Adding an Offense</SubHeading>
        <Steps items={[
          'Open the sheet panel and select "Offense".',
          'Enter the offense name (e.g. Aggravated Robbery).',
          'Enter the Act (e.g. Penal Code Act), Section, Chapter, and any Amendment reference.',
          'Select the offense category.',
          'Optionally enter the maximum sentence in years.',
          'Add a description if needed.',
          'Click "Create Offense" to save.',
        ]} />

        <SubHeading>Offense Categories</SubHeading>
        <StatusGrid items={[
          { status: 'Capital', color: 'bg-red-600', meaning: 'Carries the death penalty or life imprisonment.' },
          { status: 'Felony', color: 'bg-orange-500', meaning: 'Serious offense — typically imprisonment over one year.' },
          { status: 'Misdemeanor', color: 'bg-amber-500', meaning: 'Less serious offense — typically under one year.' },
          { status: 'Traffic', color: 'bg-blue-400', meaning: 'Road traffic violations resulting in imprisonment.' },
        ]} />

        <SubHeading>Usage Tracking</SubHeading>
        <Prose>
          The Offenses page shows a live usage count next to each offense — how many inmates are currently charged under it.
          Offenses with active usage cannot be deleted; the delete button is disabled with a tooltip.
        </Prose>

        <Tip>You can create an offense inline while registering an inmate — click the + button next to the Offense dropdown in the inmate form.</Tip>

        <SubHeading>Fields Reference</SubHeading>
        <FieldTable rows={[
          { field: 'name', type: 'string', required: true, description: 'Official name of the offense' },
          { field: 'act', type: 'string', required: false, description: 'Relevant legislation (e.g. Penal Code Act)' },
          { field: 'section', type: 'string', required: false, description: 'Section of the act' },
          { field: 'chapter', type: 'string', required: false, description: 'Chapter reference' },
          { field: 'amendedBy', type: 'string', required: false, description: 'Amendment reference, if applicable' },
          { field: 'category', type: 'enum', required: false, description: 'capital | felony | misdemeanor | traffic' },
          { field: 'maxSentenceYears', type: 'number', required: false, description: 'Maximum penalty in years' },
          { field: 'description', type: 'string', required: false, description: 'Additional context or notes' },
        ]} />
      </div>
    ),
  },

  // 10 ─ Dashboard
  {
    id: 'dashboard', number: '10', title: 'Dashboard',
    icon: ChartBarLineIcon, color: 'text-foreground',
    content: (
      <div className="space-y-5">
        <SectionHeading number="10" title="Dashboard" />
        <Prose>
          The Dashboard is the operational overview page. It provides live stats, charts, alerts, and quick access to all common actions. All data is sourced from the live database — no refresh is needed.
        </Prose>

        <SubHeading>Stat Cards</SubHeading>
        <FeatureList items={[
          { label: 'Total Inmates', desc: 'All registered inmates with remand / convicted breakdown' },
          { label: 'Visitors Inside', desc: 'Visitors currently checked in with today\'s scheduled count' },
          { label: 'Open Movements', desc: 'Movements without a return date, with "at court" sub-count' },
          { label: 'Active Facilities', desc: 'Registered prisons with total officer count' },
        ]} />

        <SubHeading>Charts</SubHeading>
        <div className="space-y-2">
          {[
            { title: 'Admissions', desc: 'Area chart — new inmate registrations per month over the last 6 months.' },
            { title: 'Status Split', desc: 'Donut chart — distribution of inmates across all 7 status values.' },
            { title: 'Prison Occupancy', desc: 'Capacity bars per facility — colour-coded green → amber → red.' },
            { title: 'Movement Breakdown', desc: 'Bar chart — count of each movement type across all records.' },
            { title: 'Inmate Types', desc: 'Donut chart — Remand vs Convict vs Civil.' },
            { title: 'Visit Activity', desc: 'Area chart — visits scheduled per month over the last 6 months.' },
          ].map((c) => (
            <div key={c.title} className="flex items-start gap-2 text-sm">
              <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5 mt-0.5 shrink-0">{c.title}</span>
              <span className="text-muted-foreground">{c.desc}</span>
            </div>
          ))}
        </div>

        <SubHeading>Escape Alert</SubHeading>
        <Prose>
          If any inmate has an "Escaped" status, an orange alert banner appears at the top of the Dashboard showing the count and linking to the Inmates page filtered to escaped.
        </Prose>

        <SubHeading>Quick Actions</SubHeading>
        <Prose>Six buttons open the sheet panel pre-set to the relevant form: Add Inmate, Schedule Visit, Record Movement, Add Officer, Add Prison, Add Offense.</Prose>

        <SubHeading>Live Operational Panels</SubHeading>
        <FeatureList items={[
          { label: 'Upcoming Court Appearances', desc: 'Sorted by date with inmate name, court, and days until hearing.' },
          { label: 'Visitors Inside Now', desc: 'All visitors currently checked in, with check-in time and inmate name.' },
          { label: 'Recent Admissions', desc: 'Most recently registered inmates with admission date and status.' },
        ]} />
      </div>
    ),
  },

  // 11 ─ PDF Export
  {
    id: 'pdf', number: '11', title: 'PDF Export',
    icon: Download01Icon, color: 'text-emerald-600',
    content: (
      <div className="space-y-5">
        <SectionHeading number="11" title="PDF Export" />
        <Prose>
          The system produces two types of PDF documents — the Inmate Register (bulk export from the list page) and the
          Individual Inmate File (from the profile page). Both are generated client-side using jsPDF + jspdf-autotable
          and are Tauri-aware: on desktop a native save dialog appears; in web mode the file downloads directly.
          All exports are wrapped in Sonner toasts (loading → success with stats / error).
        </Prose>

        <SubHeading>Inmate Register PDF (List Page)</SubHeading>
        <Prose>
          Triggered by "Export PDF" on the Inmates list. Exports the currently filtered rows.
          When rows are checkbox-selected, an "Export selected" button in the floating toolbar exports just those rows.
          The document is structured as:
        </Prose>
        <FeatureList items={[
          { label: 'Page 1 — Cover (Portrait A4)', desc: 'Navy/gold letterhead with crest ring, "Republic of Uganda / Uganda Prisons Service", auto-generated document reference, timestamp, and active filter labels' },
          { label: 'Statistics Dashboard', desc: 'Big stat cards (total, male, female, avg age), status breakdown table with percentages, risk & classification summary, and a visual bar chart of status distribution per status' },
          { label: 'Authorisation Block', desc: 'Three signature lines: Prepared by / Reviewed by / Authorised by, with name and date blanks' },
          { label: 'Pages 2+ — Register (Landscape)', desc: '15 columns: #, Prison No., Full Name, Sex, D.O.B, Age, Nationality, Type, Status, Risk, Case No., Offense, Admitted, Time Served, Cell' },
          { label: 'Row Colour Coding', desc: 'Each row tinted by status — amber for Remand, red for Convict, blue for At Court, green for Released, purple for Transferred, orange for Escaped, grey for Deceased' },
          { label: 'Repeating Page Header', desc: 'Navy/gold header repeats on every continuation page with page number' },
          { label: 'Colour Key Legend', desc: 'Legend strip explaining row colours on the last page of the table' },
        ]} />

        <SubHeading>Individual Inmate File PDF (Profile Page)</SubHeading>
        <Prose>
          Triggered by "Download PDF" on the inmate profile. Generates a detailed multi-page document including:
          personal information, next of kin, location & custody details (prison, block, cell, time served),
          case information (offense, sentence, fine), and separate tables for medical records, court appearances,
          and items in custody (where data exists). Named <C>inmate-[prisonNo]-[lastName]-YYYY-MM-DD.pdf</C>.
        </Prose>

        <SubHeading>Tauri vs Browser</SubHeading>
        <Prose>
          Both exports detect the runtime via <C>window.__TAURI__</C>.
          On Tauri: uses <C>@tauri-apps/plugin-dialog</C> save dialog + <C>@tauri-apps/plugin-fs</C> writeFile.
          In browser: uses jsPDF's built-in <C>doc.save(filename)</C> download.
        </Prose>

        <Note>
          The PDF export button on the list page shows a count badge when filters are active, so you can see how many records will be exported before clicking.
        </Note>
      </div>
    ),
  },

  // 12 ─ Architecture
  {
    id: 'data', number: '12', title: 'Data & Architecture',
    icon: FileEditIcon, color: 'text-muted-foreground',
    content: (
      <div className="space-y-5">
        <SectionHeading number="12" title="Data & Architecture" />
        <Prose>
          The system is built on Convex, a real-time serverless database. All queries are reactive — React components
          re-render automatically when data changes. Mutations run server-side and are transactional.
        </Prose>

        <SubHeading>Database Tables (13 total)</SubHeading>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide">Table</th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide">Purpose</th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide">Key Indexes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { table: 'prisons', purpose: 'Prison facility registry', indexes: 'byCode, byType, byRegion' },
                { table: 'courts', purpose: 'Court registry', indexes: 'byType, byDistrict' },
                { table: 'officers', purpose: 'Prison officer records', indexes: 'byBadgeNumber, byPrisonId' },
                { table: 'offenses', purpose: 'Chargeable offense registry', indexes: 'byCategory' },
                { table: 'inmates', purpose: 'Core inmate records', indexes: 'byPrisonNumber, byPrisonId, byStatus, byInmateType, byNationalId' },
                { table: 'inmateCharges', purpose: 'Additional charges per inmate', indexes: 'byInmateId, byOffenseId' },
                { table: 'inmateVisits', purpose: 'Visitor & visit records', indexes: 'byInmateId, byPrisonId, byStatus' },
                { table: 'courtAppearances', purpose: 'Scheduled court appearances', indexes: 'byInmateId, byCourtId' },
                { table: 'recordMovements', purpose: 'Inmate movement records', indexes: 'byInmateId, byMovementType' },
                { table: 'itemsInCustody', purpose: 'Items stored on behalf of inmates', indexes: 'byInmateId' },
                { table: 'medicalRecords', purpose: 'Medical records per inmate', indexes: 'byInmateId, byRecordType' },
                { table: 'photoBucket', purpose: 'Photos for inmates and officers (unified)', indexes: 'byInmateId, byOfficerId, bySubjectType' },
                { table: 'fingerPrints', purpose: 'Fingerprint templates (unified)', indexes: 'byInmateId, byOfficerId' },
                { table: 'officerAttendance', purpose: 'Per-shift attendance records', indexes: 'byOfficerId, byPrisonId, byDate' },
              ].map((row) => (
                <tr key={row.table} className="hover:bg-muted/20">
                  <td className="px-3 py-2 font-mono font-medium">{row.table}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.purpose}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-[11px]">{row.indexes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SubHeading>Shared Biometric Schema</SubHeading>
        <Prose>
          Both <C>photoBucket</C> and <C>fingerPrints</C> use a unified schema with a <C>subjectType</C> discriminator
          field (<C>"inmate"</C> or <C>"officer"</C>). One of <C>inmateId</C> or <C>officerId</C> is set depending on the subject.
          This avoids duplicating table definitions while supporting biometrics for both subject types.
        </Prose>

        <SubHeading>Quick-Create Pattern</SubHeading>
        <Prose>
          Several relation dropdowns support inline record creation without leaving the current form.
          The <C>RelationSelect</C> component accepts a <C>quickCreateFields</C> prop and an <C>onCreate</C> callback.
          After creation the new record is automatically selected.
          Currently supported for: Offense (in inmate form), Prison (in inmate and officer forms), Court (in appearance form).
        </Prose>

        <SubHeading>getInmateWithRelations</SubHeading>
        <Prose>
          The <C>relations.ts</C> file contains <C>getInmateWithRelations</C>, used by the profile page.
          It fetches the inmate and resolves all foreign keys in one reactive query, returning a fully hydrated object with:
          <C>prison</C>, <C>offense</C>, <C>charges</C>, <C>visits</C>, <C>courtAppearances</C> (with court names and officer),
          <C>movements</C> (with prison names and officer), <C>photos</C>, <C>fingerprints</C>,
          and computed helpers <C>primaryPhoto</C> and <C>capturedFingers</C>.
        </Prose>

        <Note>
          Convex queries are reactive. Components using <C>useQuery</C> re-render automatically when server data changes — no polling or manual refresh needed.
        </Note>
      </div>
    ),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

function RouteComponent() {
  const [activeId, setActiveId] = useState('overview')
  const [search, setSearch] = useState('')

  const activeSection = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0]

  const filtered = search.trim()
    ? SECTIONS.filter((s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) || s.number.includes(search)
    )
    : SECTIONS

  return (
    <article className="flex flex-col gap-0 py-5 md:max-w-5xl w-full">

      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <HugeiconsIcon icon={BookOpen01Icon} className="size-5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Documentation</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">System Reference</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prison Management Application — operational and technical reference for all 12 modules.
        </p>
      </header>

      <div className="flex gap-6 items-start">

        {/* Sidebar nav */}
        <nav className="w-52 shrink-0 sticky top-10 hidden md:flex flex-col gap-1">
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

        {/* Mobile picker */}
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

        {/* Content */}
        <main className="flex-1 min-w-0 rounded-xl border border-border/60 bg-sidebar p-6 md:p-8">
          {activeSection.content}

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