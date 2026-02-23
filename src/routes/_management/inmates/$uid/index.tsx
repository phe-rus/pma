import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { useQuery, useMutation } from 'convex/react'
import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { generateInmatePDF } from '@/lib/pdf-generator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Download01Icon,
    PrinterIcon,
    ArrowLeft02Icon,
    Edit01Icon,
    UserIcon,
    Building02Icon,
    File02Icon,
    MedicineIcon,
    Boxes as BoxIcon,
    GalaxyIcon as GavelIcon,
    Car01Icon,
    Fingerprint as Fingerprint02Icon,
    CallIcon,
    UserMultipleIcon,
    Calendar03Icon,
    Location01Icon,
    InformationCircleIcon
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_management/inmates/$uid/')({
    component: RouteComponent,
})

const statusColors: Record<string, string> = {
    remand: 'bg-amber-50 text-amber-700 border-amber-200',
    convict: 'bg-rose-50 text-rose-700 border-rose-200',
    at_court: 'bg-blue-50 text-blue-700 border-blue-200',
    released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    transferred: 'bg-purple-50 text-purple-700 border-purple-200',
    escaped: 'bg-red-50 text-red-700 border-red-200',
    deceased: 'bg-gray-50 text-gray-700 border-gray-200',
}

const riskColors: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    maximum: 'bg-red-100 text-red-800 border-red-200',
}

const genderColors: Record<string, string> = {
    male: 'bg-blue-50 text-blue-700',
    female: 'bg-pink-50 text-pink-700',
}

function RouteComponent() {
    const { uid } = Route.useParams()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)

    const data = useQuery(api.inmate.getFullInmateRecord, {
        id: uid as Id<'inmates'>
    })

    const updateInmate = useMutation(api.inmate.update)

    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    const { inmate, prison, offense, photos, fingerprints, medicalRecords, items, courtAppearances, movements, visits } = data

    const handleDownloadPDF = () => {
        const doc = generateInmatePDF(data)
        doc.save(`inmate-${inmate.prisonNumber}-${inmate.lastName}.pdf`)
    }

    const handlePrint = () => {
        const doc = generateInmatePDF(data)
        doc.autoPrint()
        doc.output('dataurlnewwindow')
    }

    const handleUpdateField = async (field: string, value: any) => {
        await updateInmate({
            id: uid as Id<'inmates'>,
            patch: { [field]: value }
        })
    }

    // Calculate age from DOB
    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob)
        const diff = Date.now() - birthDate.getTime()
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
    }

    return (
        <article className="flex flex-col gap-6 py-6 md:max-w-5xl w-full mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => navigate({ to: '/inmates' })}>
                    <HugeiconsIcon icon={ArrowLeft02Icon} className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                        <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                        {isEditing ? 'Done' : 'Edit'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <HugeiconsIcon icon={PrinterIcon} className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button size="sm" onClick={handleDownloadPDF}>
                        <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                </div>
            </div>

            {/* Critical Info Header Card */}
            <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar / Photo Placeholder */}
                <div className="relative">
                    <div className="size-55 rounded-full bg-linear-to-br from-primary/20 to-primary/40 flex items-center justify-center border-4 border-background shadow-xl">
                        <HugeiconsIcon icon={UserIcon} className="size-18 text-primary/60" />
                    </div>
                    {photos.length > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 size-6 rounded-full border-2 border-background flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">{photos.length}</span>
                        </div>
                    )}
                </div>

                {/* Name & Prison Number */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {inmate.firstName} {inmate.lastName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {inmate.otherNames && <span className="italic">{inmate.otherNames}</span>}
                    </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-2 max-w-2xs">
                    <Badge variant="secondary" className="text-xs">
                        {inmate.prisonNumber}
                    </Badge>
                    <Badge className={cn('capitalize text-xs', statusColors[inmate.status])}>
                        {inmate.status.replace('_', ' ')}
                    </Badge>
                    {inmate.riskLevel && (
                        <Badge className={cn('capitalize text-xs', riskColors[inmate.riskLevel])}>
                            {inmate.riskLevel} Risk
                        </Badge>
                    )}
                    <Badge className={cn('capitalize text-xs', genderColors[inmate.gender])}>
                        {inmate.gender}
                    </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-xs pt-4 border-t">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{calculateAge(inmate.dob)}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Years Old</p>
                    </div>
                    <div className="text-center border-x">
                        <p className="text-2xl font-bold text-primary">
                            {Math.floor((Date.now() - new Date(inmate.admissionDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Days Inside</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{fingerprints.length}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Fingerprints</p>
                    </div>
                </div>
            </div>

            <section className="flex flex-col gap-1">
                {/* Current Location Alert */}
                <Card className="p-0 rounded-sm bg-muted/50 border-l border-l-primary w-full md:max-w-2xl mx-auto">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <HugeiconsIcon icon={Building02Icon} className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium">Currently at {prison?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    Block {inmate.cellBlock || 'N/A'} • Cell {inmate.cellNumber || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Admitted {new Date(inmate.admissionDate).toLocaleDateString()}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Accordion Sections */}
                <Accordion multiple defaultValue={['identity', 'case-info']} className="space-y-1 md:max-w-2xl mx-auto">
                    {/* Identity & Personal Details */}
                    <AccordionItem value="identity" className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={Fingerprint02Icon} className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold">Identity & Personal Details</p>
                                    <p className="text-xs text-muted-foreground">National ID, demographics, appearance</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <EditableField
                                        label="National ID Number"
                                        value={inmate.nationalId || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('nationalId', v)}
                                    />
                                    <EditableField
                                        label="Date of Birth"
                                        value={inmate.dob}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('dob', v)}
                                    />
                                    <EditableField
                                        label="Nationality"
                                        value={inmate.nationality || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('nationality', v)}
                                    />
                                    <EditableField
                                        label="Tribe / Ethnicity"
                                        value={inmate.tribe || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('tribe', v)}
                                    />
                                    <EditableField
                                        label="Religion"
                                        value={inmate.religion || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('religion', v)}
                                    />
                                    <EditableField
                                        label="Marital Status"
                                        value={inmate.maritalStatus || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('maritalStatus', v)}
                                    />
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <EditableField
                                        label="Education Level"
                                        value={inmate.educationLevel || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('educationLevel', v)}
                                    />
                                    <EditableField
                                        label="Occupation"
                                        value={inmate.occupation || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('occupation', v)}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Case Information */}
                    <AccordionItem value="case-info" className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                                    <HugeiconsIcon icon={File02Icon} className="h-4 w-4 text-rose-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold">Case Information</p>
                                    <p className="text-xs text-muted-foreground">Offense, sentence, court details</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="space-y-4 pt-2">
                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                                    <p className="text-xs text-rose-600 uppercase tracking-wider font-semibold mb-1">Current Charge</p>
                                    <p className="text-lg font-bold text-rose-900">{offense?.name || 'Unknown Offense'}</p>
                                    <p className="text-sm text-rose-700 mt-1">Case #{inmate.caseNumber}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Category</Label>
                                        <p className="text-sm font-medium capitalize">{offense?.category || 'N/A'}</p>
                                    </div>
                                    <EditableField
                                        label="Arresting Station"
                                        value={inmate.arrestingStation || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('arrestingStation', v)}
                                    />
                                    <EditableField
                                        label="Conviction Date"
                                        value={inmate.convictionDate || 'Not convicted'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('convictionDate', v)}
                                    />
                                    <EditableField
                                        label="Sentence Start"
                                        value={inmate.sentenceStart || 'Not set'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('sentenceStart', v)}
                                    />
                                    <EditableField
                                        label="Sentence End"
                                        value={inmate.sentenceEnd || 'Not set'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('sentenceEnd', v)}
                                    />
                                    <EditableField
                                        label="Duration"
                                        value={inmate.sentenceDuration || 'Life' + (inmate.isLifeSentence ? ' Sentence' : '')}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('sentenceDuration', v)}
                                    />
                                </div>

                                {inmate.fineAmount && (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Fine Amount</Label>
                                                <p className="text-sm font-medium">${inmate.fineAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Payment Status</Label>
                                                <Badge variant={inmate.finePaid ? 'default' : 'destructive'} className="mt-1">
                                                    {inmate.finePaid ? 'PAID' : 'UNPAID'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Next of Kin */}
                    <AccordionItem value="next-of-kin" className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <HugeiconsIcon icon={UserMultipleIcon} className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold">Next of Kin</p>
                                    <p className="text-xs text-muted-foreground">Emergency contact information</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="space-y-4 pt-2">
                                <EditableField
                                    label="Full Name"
                                    value={inmate.nextOfKinName || 'Not recorded'}
                                    isEditing={isEditing}
                                    onSave={(v) => handleUpdateField('nextOfKinName', v)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <EditableField
                                        label="Phone Number"
                                        value={inmate.nextOfKinPhone || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('nextOfKinPhone', v)}
                                    />
                                    <EditableField
                                        label="Relationship"
                                        value={inmate.nextOfKinRelationship || 'Not recorded'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('nextOfKinRelationship', v)}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Location & Assignment */}
                    <AccordionItem value="location" className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <HugeiconsIcon icon={Location01Icon} className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold">Location & Assignment</p>
                                    <p className="text-xs text-muted-foreground">Prison, cell block, transfers</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Current Prison</Label>
                                        <p className="text-sm font-medium">{prison?.name}</p>
                                        <p className="text-xs text-muted-foreground">{prison?.code}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Prison Type</Label>
                                        <p className="text-sm font-medium capitalize">{prison?.type}</p>
                                    </div>
                                    <EditableField
                                        label="Cell Block"
                                        value={inmate.cellBlock || 'Unassigned'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('cellBlock', v)}
                                    />
                                    <EditableField
                                        label="Cell Number"
                                        value={inmate.cellNumber || 'Unassigned'}
                                        isEditing={isEditing}
                                        onSave={(v) => handleUpdateField('cellNumber', v)}
                                    />
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Admission Date</Label>
                                        <p className="text-sm font-medium">{new Date(inmate.admissionDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Time Served</Label>
                                        <p className="text-sm font-medium">
                                            {Math.floor((Date.now() - new Date(inmate.admissionDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                                        </p>
                                    </div>
                                </div>

                                {movements.length > 0 && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-2 block">Recent Movements</Label>
                                            <div className="space-y-2">
                                                {movements.slice(0, 3).map((movement, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                                                        <span className="capitalize">{movement.movementType.replace('_', ' ')}</span>
                                                        <span className="text-muted-foreground text-xs">{movement.departureDate}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Medical Records */}
                    <AccordionItem value="medical" className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <HugeiconsIcon icon={MedicineIcon} className="h-4 w-4 text-red-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold">Medical Records</p>
                                    <p className="text-xs text-muted-foreground">{medicalRecords.length} record(s) on file</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="space-y-3 pt-2">
                                {medicalRecords.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No medical records found</p>
                                ) : (
                                    medicalRecords.map((record, idx) => (
                                        <div key={idx} className="border rounded-lg p-3 bg-red-50/30">
                                            <div className="flex justify-between items-start mb-1">
                                                <Badge variant="outline" className="text-xs">{record.recordType.replace('_', ' ')}</Badge>
                                                <span className="text-xs text-muted-foreground">{record.recordDate}</span>
                                            </div>
                                            {record.diagnosis && (
                                                <p className="text-sm"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>
                                            )}
                                            {record.treatment && (
                                                <p className="text-sm text-muted-foreground mt-1">{record.treatment}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                                <Button variant="outline" size="sm" className="w-full">Add Medical Record</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Property & Items */}
                    <AccordionItem value="property" className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <HugeiconsIcon icon={BoxIcon} className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold">Property & Items</p>
                                    <p className="text-xs text-muted-foreground">{items.length} item(s) in custody</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="space-y-3 pt-2">
                                {items.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No items in custody</p>
                                ) : (
                                    items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={item.returnedAt ? 'secondary' : 'default'} className="text-xs">
                                                    {item.returnedAt ? 'Returned' : 'Stored'}
                                                </Badge>
                                                {item.value && (
                                                    <p className="text-xs text-muted-foreground mt-1">${item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <Button variant="outline" size="sm" className="w-full">Add Item</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Court Appearances */}
                    <AccordionItem value="court" className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <HugeiconsIcon icon={GavelIcon} className="h-4 w-4 text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold">Court Appearances</p>
                                    <p className="text-xs text-muted-foreground">{courtAppearances.length} appearance(s)</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="space-y-3 pt-2">
                                {courtAppearances.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No court appearances recorded</p>
                                ) : (
                                    courtAppearances.map((appearance, idx) => (
                                        <div key={idx} className="border rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-medium">{appearance.court?.name}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{appearance.court?.type} Court</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm">{appearance.scheduledDate}</p>
                                                    {appearance.outcome && (
                                                        <Badge className="mt-1 text-xs">{appearance.outcome}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <Button variant="outline" size="sm" className="w-full">Schedule Appearance</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Additional Information */}
                    <AccordionItem value="additional" className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-gray-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold">Additional Information</p>
                                    <p className="text-xs text-muted-foreground">Notes, photos, biometrics</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="space-y-4 pt-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">Photos ({photos.length})</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {photos.length > 0 ? (
                                            photos.map((photo, idx) => (
                                                <div key={idx} className="aspect-square bg-muted rounded flex items-center justify-center">
                                                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                                                        {photo.photoType.replace('_', '\n')}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-4 aspect-video bg-muted rounded flex items-center justify-center">
                                                <span className="text-sm text-muted-foreground">No photos available</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">Fingerprints ({fingerprints.length}/10)</Label>
                                    <div className="flex flex-wrap gap-1">
                                        {['right_thumb', 'right_index', 'right_middle', 'right_ring', 'right_little',
                                            'left_thumb', 'left_index', 'left_middle', 'left_ring', 'left_little'].map((finger) => {
                                                const hasPrint = fingerprints.some(f => f.finger === finger)
                                                return (
                                                    <Badge
                                                        key={finger}
                                                        variant={hasPrint ? 'default' : 'outline'}
                                                        className="text-[10px] capitalize"
                                                    >
                                                        {finger.replace('_', ' ')}
                                                    </Badge>
                                                )
                                            })}
                                    </div>
                                </div>

                                {inmate.notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">Notes</Label>
                                            <p className="text-sm bg-muted p-3 rounded">{inmate.notes}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </article>
    )
}

// Editable Field Component
function EditableField({
    label,
    value,
    isEditing,
    onSave
}: {
    label: string
    value: string
    isEditing: boolean
    onSave: (value: string) => void
}) {
    const [editValue, setEditValue] = useState(value)
    const [isOpen, setIsOpen] = useState(false)

    if (!isEditing) {
        return (
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <p className="text-sm font-medium">{value}</p>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>
                <div className="cursor-pointer hover:bg-muted/50 p-2 rounded -m-2 transition-colors">
                    <Label className="text-xs text-muted-foreground cursor-pointer">{label}</Label>
                    <p className="text-sm font-medium flex items-center gap-2 text-primary">
                        {value}
                        <HugeiconsIcon icon={Edit01Icon} className="h-3 w-3 opacity-50" />
                    </p>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {label}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={() => { onSave(editValue); setIsOpen(false); }}>Save Changes</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}