import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Inmate, Prison, Offense, PhotoBucket, FingerPrint, MedicalRecord, ItemsInCustody, CourtAppearance, RecordMovement, InmateVisits } from '@/types/inmate';

interface FullInmateRecord {
    inmate: Inmate;
    prison: Prison | null;
    offense: Offense | null;
    photos: PhotoBucket[];
    fingerprints: FingerPrint[];
    medicalRecords: MedicalRecord[];
    items: ItemsInCustody[];
    courtAppearances: (CourtAppearance & { court: any; officer: any })[];
    movements: (RecordMovement & { fromPrison: any; toPrison: any; officer: any })[];
    visits: InmateVisits[];
}

export const generateInmatePDF = (data: FullInmateRecord): jsPDF => {
    const { inmate, prison, offense } = data;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(25, 55, 95);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('PRISON MANAGEMENT AUTHORITY', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('INMATE FILE RECORD', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 33, { align: 'center' });

    let yPos = 50;

    // Personal Information Section
    doc.setTextColor(25, 55, 95);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONAL INFORMATION', 14, yPos);

    doc.setDrawColor(25, 55, 95);
    doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const personalInfo = [
        ['Prison Number:', inmate.prisonNumber],
        ['Full Name:', `${inmate.firstName} ${inmate.otherNames || ''} ${inmate.lastName}`.trim()],
        ['National ID:', inmate.nationalId || 'N/A'],
        ['Date of Birth:', inmate.dob],
        ['Gender:', inmate.gender],
        ['Nationality:', inmate.nationality || 'N/A'],
        ['Tribe:', inmate.tribe || 'N/A'],
        ['Religion:', inmate.religion || 'N/A'],
        ['Education Level:', inmate.educationLevel || 'N/A'],
        ['Marital Status:', inmate.maritalStatus || 'N/A'],
        ['Occupation:', inmate.occupation || 'N/A'],
    ];

    (doc as any).autoTable({
        startY: yPos,
        body: personalInfo,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', width: 40 },
            1: { width: 60 },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Next of Kin
    if (inmate.nextOfKinName) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 55, 95);
        doc.text('NEXT OF KIN', 14, yPos);
        doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

        yPos += 10;
        const nextOfKinInfo = [
            ['Name:', inmate.nextOfKinName],
            ['Phone:', inmate.nextOfKinPhone || 'N/A'],
            ['Relationship:', inmate.nextOfKinRelationship || 'N/A'],
        ];

        (doc as any).autoTable({
            startY: yPos,
            body: nextOfKinInfo,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: {
                0: { fontStyle: 'bold', width: 40 },
            },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Prison Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 55, 95);
    doc.text('PRISON INFORMATION', 14, yPos);
    doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

    yPos += 10;
    const prisonInfo = [
        ['Current Prison:', prison?.name || 'N/A'],
        ['Prison Code:', prison?.code || 'N/A'],
        ['Cell Block:', inmate.cellBlock || 'N/A'],
        ['Cell Number:', inmate.cellNumber || 'N/A'],
        ['Status:', inmate.status.toUpperCase()],
        ['Risk Level:', inmate.riskLevel?.toUpperCase() || 'N/A'],
        ['Inmate Type:', inmate.inmateType.toUpperCase()],
    ];

    (doc as any).autoTable({
        startY: yPos,
        body: prisonInfo,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', width: 40 },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Case Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 55, 95);
    doc.text('CASE INFORMATION', 14, yPos);
    doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

    yPos += 10;
    const caseInfo = [
        ['Case Number:', inmate.caseNumber],
        ['Offense:', offense?.name || 'N/A'],
        ['Offense Category:', offense?.category || 'N/A'],
        ['Arresting Station:', inmate.arrestingStation || 'N/A'],
        ['Admission Date:', inmate.admissionDate],
        ['Conviction Date:', inmate.convictionDate || 'N/A'],
        ['Sentence Start:', inmate.sentenceStart || 'N/A'],
        ['Sentence End:', inmate.sentenceEnd || 'N/A'],
        ['Duration:', inmate.sentenceDuration || 'N/A'],
        ['Life Sentence:', inmate.isLifeSentence ? 'YES' : 'NO'],
        ['Fine Amount:', inmate.fineAmount ? `$${inmate.fineAmount}` : 'N/A'],
        ['Fine Paid:', inmate.finePaid ? 'YES' : 'NO'],
    ];

    (doc as any).autoTable({
        startY: yPos,
        body: caseInfo,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', width: 40 },
        },
    });

    // Add new page for medical records if they exist
    if (data.medicalRecords.length > 0) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 55, 95);
        doc.text('MEDICAL RECORDS', 14, yPos);
        doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

        const medicalData = data.medicalRecords.map(record => [
            record.recordDate,
            record.recordType,
            record.diagnosis || 'N/A',
            record.treatment || 'N/A',
            record.attendedBy || 'N/A',
        ]);

        (doc as any).autoTable({
            startY: yPos + 10,
            head: [['Date', 'Type', 'Diagnosis', 'Treatment', 'Attended By']],
            body: medicalData,
            theme: 'striped',
            headStyles: { fillColor: [25, 55, 95], textColor: 255 },
        });
    }

    // Add items in custody
    if (data.items.length > 0) {
        if (yPos > 200) doc.addPage();
        yPos = (doc as any).lastAutoTable?.finalY + 20 || 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 55, 95);
        doc.text('ITEMS IN CUSTODY', 14, yPos);
        doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

        const itemsData = data.items.map(item => [
            item.name,
            item.description || 'N/A',
            item.condition || 'N/A',
            item.value ? `$${item.value}` : 'N/A',
            item.storageLocation || 'N/A',
            item.returnedAt ? 'Returned' : 'In Storage',
        ]);

        (doc as any).autoTable({
            startY: yPos + 10,
            head: [['Item', 'Description', 'Condition', 'Value', 'Location', 'Status']],
            body: itemsData,
            theme: 'striped',
            headStyles: { fillColor: [25, 55, 95], textColor: 255 },
        });
    }

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount} - Confidential Document`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        doc.text('Prison Management Authority - Official Use Only', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
    }

    return doc;
};