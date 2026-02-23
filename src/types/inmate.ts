import { Id } from 'convex/_generated/dataModel';

export type Inmate = {
    _id: Id<'inmates'>;
    _creationTime: number;
    firstName: string;
    lastName: string;
    otherNames?: string;
    prisonNumber: string;
    nationalId?: string;
    dob: string;
    gender: 'male' | 'female';
    nationality?: string;
    tribe?: string;
    religion?: string;
    educationLevel?: string;
    maritalStatus?: string;
    occupation?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    nextOfKinRelationship?: string;
    inmateType: 'remand' | 'convict' | 'civil';
    status: 'remand' | 'convict' | 'at_court' | 'released' | 'transferred' | 'escaped' | 'deceased';
    riskLevel?: 'low' | 'medium' | 'high' | 'maximum';
    prisonId: Id<'prisons'>;
    cellBlock?: string;
    cellNumber?: string;
    caseNumber: string;
    offenseId: Id<'offenses'>;
    arrestingStation?: string;
    admissionDate: string;
    remandExpiry?: string;
    nextCourtDate?: string;
    convictionDate?: string;
    sentenceStart?: string;
    sentenceEnd?: string;
    sentenceDuration?: string;
    isLifeSentence?: boolean;
    fineAmount?: number;
    finePaid?: boolean;
    actualReleaseDate?: string;
    releaseReason?: 'served' | 'bail' | 'acquitted' | 'pardon' | 'fine_paid';
    notes?: string;
};

export type Prison = {
    _id: Id<'prisons'>;
    name: string;
    code: string;
    type: string;
    region?: string;
    district?: string;
    address?: string;
    capacity?: number;
    contactPhone?: string;
    isActive?: boolean;
};

export type Offense = {
    _id: Id<'offenses'>;
    name: string;
    category?: string;
    // ... other fields
};

export type PhotoBucket = {
    _id: Id<'photoBucket'>;
    subjectType: 'inmate' | 'officer';
    inmateId?: Id<'inmates'>;
    photoType: string;
    // ... other fields
};

export type FingerPrint = {
    _id: Id<'fingerPrints'>;
    subjectType: 'inmate' | 'officer';
    inmateId?: Id<'inmates'>;
    finger: string;
    // ... other fields
};

export type MedicalRecord = {
    _id: Id<'medicalRecords'>;
    inmateId: Id<'inmates'>;
    recordType: string;
    diagnosis?: string;
    treatment?: string;
    attendedBy?: string;
    recordDate: string;
    notes?: string;
};

export type ItemsInCustody = {
    _id: Id<'itemsInCustody'>;
    inmateId: Id<'inmates'>;
    name: string;
    description?: string;
    condition?: string;
    value?: number;
    storageLocation?: string;
    returnedAt?: string;
};

export type CourtAppearance = {
    _id: Id<'courtAppearances'>;
    inmateId: Id<'inmates'>;
    courtId: Id<'courts'>;
    scheduledDate: string;
    departureTime?: string;
    returnTime?: string;
    outcome?: string;
    notes?: string;
};

export type RecordMovement = {
    _id: Id<'recordMovements'>;
    inmateId: Id<'inmates'>;
    movementType: string;
    departureDate: string;
    returnDate?: string;
    reason: string;
    notes?: string;
};

export type InmateVisits = {
    _id: Id<'inmateVisits'>;
    inmateId: Id<'inmates'>;
    fullName: string;
    status: string;
    // ... other fields
};