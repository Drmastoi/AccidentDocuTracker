import { jsPDF } from "jspdf";
import { Case, PhysicalInjury, ClaimantDetails, AccidentDetails, Treatments, FamilyHistory, Prognosis, ExpertDetails, LifestyleImpact } from "@shared/schema";

// PDF customization options interface
export interface PDFCustomizationOptions {
  // Layout options
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  
  // Cover page options
  includeCoverPage?: boolean;
  includeAgencyDetails?: boolean;
  logoUrl?: string;
  
  // Content options
  fontFamily?: 'helvetica' | 'courier' | 'times';
  fontSize?: {
    title: number;
    subtitle: number;
    sectionHeader: number;
    bodyText: number;
  };
  includeSectionNumbers?: boolean;
  includeTableOfContents?: boolean;
  
  // Style options
  primaryColor?: [number, number, number]; // RGB values
  secondaryColor?: [number, number, number]; // RGB values
  
  // Additional content options
  includeExpertCV?: boolean;
  includeDeclaration?: boolean;
  includeFooterOnEveryPage?: boolean;
  
  // Sections to include/exclude
  sectionsToInclude?: {
    claimantDetails?: boolean;
    accidentDetails?: boolean;
    physicalInjury?: boolean;
    psychologicalInjury?: boolean;
    treatments?: boolean;
    lifeStyleImpact?: boolean;
    familyHistory?: boolean;
    prognosis?: boolean;
    expertDetails?: boolean;
  };
}

// Type guard functions to ensure proper type checking with jsonb fields
const hasClaimantDetails = (details: any): details is ClaimantDetails => {
  return details !== null && typeof details === 'object';
};

const hasAccidentDetails = (details: any): details is AccidentDetails => {
  return details !== null && typeof details === 'object';
};

// Type guard for PhysicalInjury with injuries array
interface PhysicalInjuryWithInjuries extends PhysicalInjury {
  injuries: any[];
}

const hasPhysicalInjury = (details: any): details is PhysicalInjury => {
  return details !== null && typeof details === 'object';
};

const hasPhysicalInjuryWithInjuries = (details: any): details is PhysicalInjuryWithInjuries => {
  return hasPhysicalInjury(details) && Array.isArray(details.injuries);
};

const hasTreatments = (details: any): details is Treatments => {
  return details !== null && typeof details === 'object';
};

const hasLifestyleImpact = (details: any): details is LifestyleImpact => {
  return details !== null && typeof details === 'object';
};

const hasFamilyHistory = (details: any): details is FamilyHistory => {
  return details !== null && typeof details === 'object';
};

// Type guard for Prognosis with treatmentRecommendations array
interface PrognosisWithRecommendations extends Prognosis {
  treatmentRecommendations: string[];
  overallPrognosis: string;
}

const hasPrognosis = (details: any): details is Prognosis => {
  return details !== null && typeof details === 'object';
};

const hasPrognosisWithRecommendations = (details: any): details is PrognosisWithRecommendations => {
  return hasPrognosis(details) && Array.isArray(details.treatmentRecommendations) && typeof details.overallPrognosis === 'string';
};

const hasExpertDetails = (details: any): details is ExpertDetails => {
  return details !== null && typeof details === 'object';
};

// Function to format date from ISO string to DD/MM/YYYY
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

// Function to calculate age from date of birth
const calculateAge = (dateOfBirth?: string) => {
  if (!dateOfBirth) return "N/A";
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Function to add footer with claimant name and date on each page
const addFooter = (doc: jsPDF, claimantName: string) => {
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102); // Dark gray
    
    // Current date
    const currentDate = formatDate(new Date().toISOString());
    
    // Add footer text
    doc.text(`${claimantName || "Unknown Claimant"} - ${currentDate}`, 105, 290, { align: "center" });
  }
};

// Default PDF customization options
const defaultPDFOptions: PDFCustomizationOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  includeCoverPage: true,
  includeAgencyDetails: true,
  fontFamily: 'helvetica',
  fontSize: {
    title: 18,
    subtitle: 10,
    sectionHeader: 12,
    bodyText: 9
  },
  includeSectionNumbers: false,
  includeTableOfContents: false,
  primaryColor: [14, 124, 123], // RGB for #0E7C7B dark teal
  secondaryColor: [74, 85, 104], // RGB for #4A5568 slate grey
  includeExpertCV: true,
  includeDeclaration: true,
  includeFooterOnEveryPage: true,
  sectionsToInclude: {
    claimantDetails: true,
    accidentDetails: true,
    physicalInjury: true,
    psychologicalInjury: true,
    treatments: true,
    lifeStyleImpact: true,
    familyHistory: true,
    prognosis: true,
    expertDetails: true
  }
};

// Generate PDF from case data
export const generatePDF = (caseData: Case, options?: PDFCustomizationOptions): string => {
  // Merge provided options with default options
  const pdfOptions = { ...defaultPDFOptions, ...options };
  
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: pdfOptions.orientation,
    unit: 'mm',
    format: pdfOptions.pageSize
  });
  
  // Set the main font
  doc.setFont(pdfOptions.fontFamily || "helvetica");
  
  // Define the brand colors
  const primaryColor = pdfOptions.primaryColor || [14, 124, 123]; // RGB for #0E7C7B dark teal
  const secondaryColor = pdfOptions.secondaryColor || [74, 85, 104]; // RGB for #4A5568 slate grey
  
  // ==================== PAGE 1: COVER PAGE ====================
  
  // Set up page margins
  const margin = 50;
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 40;
  
  // TITLE
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(pdfOptions.fontSize?.title || 18);
  doc.setFont(pdfOptions.fontFamily || "helvetica", "bold");
  doc.text("MEDICAL REPORT", margin, yPosition);
  
  // Subtitle - Prepared for the Court
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(pdfOptions.fontSize?.subtitle || 14);
  doc.text("Prepared for the Court on:", margin, yPosition);
  
  // Draw table
  yPosition += 15;
  const tableStartY = yPosition;
  const tableWidth = pageWidth - (margin * 2);
  const leftColWidth = tableWidth / 2;
  const rowHeight = 22;
  const claimant = caseData.claimantDetails;
  
  // Function to draw a table row
  const drawTableRow = (label: string, value: string, y: number) => {
    // Draw borders
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + tableWidth, y); // Top line
    doc.line(margin, y + rowHeight, margin + tableWidth, y + rowHeight); // Bottom line
    doc.line(margin, y, margin, y + rowHeight); // Left line
    doc.line(margin + leftColWidth, y, margin + leftColWidth, y + rowHeight); // Middle line
    doc.line(margin + tableWidth, y, margin + tableWidth, y + rowHeight); // Right line
    
    // Add text
    doc.setFontSize(10);
    doc.setFont(pdfOptions.fontFamily || "helvetica", "normal");
    doc.text(label, margin + 5, y + 15);
    doc.text(value, margin + leftColWidth + 5, y + 15);
  };
  
  // Table rows
  drawTableRow("Claimant's Full Name", claimant?.fullName ? `${claimant.fullName}` : "{{Full Name}}", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("Date Of Birth:", claimant?.dateOfBirth ? `${formatDate(claimant.dateOfBirth)}` : "{{Date of birth}}", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("Address:", claimant?.address ? `${claimant.address}` : "{{Full Address}}", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("ID Checked:", "{{Type of ID}}", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("Instructing Party:", claimant?.instructingParty ? `${claimant.instructingParty}` : "", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("IP Reference:", claimant?.instructingPartyRef ? `${claimant.instructingPartyRef}` : "", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("Solicitor:", claimant?.solicitorName ? `${claimant.solicitorName}` : "", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("Reference Number:", claimant?.referenceNumber ? `${claimant.referenceNumber}` : "", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("MedCo Ref Number:", claimant?.medcoRefNumber ? `${claimant.medcoRefNumber}` : "", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("Accompanied By:", claimant?.accompaniedBy || "", yPosition);
  yPosition += rowHeight;
  
  // Multi-row cells - Solicitor and reference details
  const multiRowStartY = yPosition;
  doc.setLineWidth(0.5);
  
  // Left column for labels - 3 rows
  doc.line(margin, multiRowStartY, margin + leftColWidth, multiRowStartY); // Top line
  doc.line(margin, multiRowStartY, margin, multiRowStartY + (rowHeight * 3)); // Left line
  doc.line(margin, multiRowStartY + (rowHeight * 3), margin + leftColWidth, multiRowStartY + (rowHeight * 3)); // Bottom line
  doc.line(margin + leftColWidth, multiRowStartY, margin + leftColWidth, multiRowStartY + (rowHeight * 3)); // Middle line
  
  // Right column for values - 3 rows
  doc.line(margin + leftColWidth, multiRowStartY, margin + tableWidth, multiRowStartY); // Top line
  doc.line(margin + tableWidth, multiRowStartY, margin + tableWidth, multiRowStartY + (rowHeight * 3)); // Right line
  doc.line(margin + leftColWidth, multiRowStartY + (rowHeight * 3), margin + tableWidth, multiRowStartY + (rowHeight * 3)); // Bottom line
  
  // Add text for multi-row cells
  doc.text("Name Of Referring Party:", margin + 5, multiRowStartY + 15);
  doc.text("Reference Number:", margin + 5, multiRowStartY + 35);
  doc.text("Name Of Solicitor:", margin + 5, multiRowStartY + 55);
  doc.text("Reference Number:", margin + 5, multiRowStartY + 75);
  doc.text("Time Spent With Claimant:", margin + 5, multiRowStartY + 95);
  
  // Add horizontal lines between rows in the multi-row section
  doc.line(margin, multiRowStartY + rowHeight, margin + tableWidth, multiRowStartY + rowHeight); // Line after row 1
  doc.line(margin, multiRowStartY + (rowHeight * 2), margin + tableWidth, multiRowStartY + (rowHeight * 2)); // Line after row 2
  
  yPosition += (rowHeight * 3);
  
  // Continue with single rows
  
  drawTableRow("Examination Location:", claimant?.placeOfExamination || "", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("Date Of Examination:", claimant?.dateOfExamination ? `${formatDate(claimant.dateOfExamination)}` : "", yPosition);
  yPosition += rowHeight;
  
  drawTableRow("Date Of Report:", claimant?.dateOfReport ? `${formatDate(claimant.dateOfReport)}` : "", yPosition);
  yPosition += rowHeight;
  
  // Expert details section
  yPosition += 20;
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Prepared by:", margin, yPosition);
  
  // Expert name, larger size
  yPosition += 5;
  doc.setFontSize(14);
  doc.setFont(pdfOptions.fontFamily || "helvetica", "bold");
  
  const expertName = caseData.expertDetails?.examiner || "Dr Awais Iqbal";
  const expertTitle = caseData.expertDetails?.credentials || "MBBS, Direct Medical Expert";
  doc.text(`${expertName}, ${expertTitle}`, margin + 100, yPosition);
  
  // Expert statement
  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont(pdfOptions.fontFamily || "helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  const expertStatement = `The Writer: I, ${expertName}, am a medico-legal practitioner. Full details of my qualifications and experience entitling me to provide an expert opinion can be found on the last page of this medical report.`;
  const statementLines = doc.splitTextToSize(expertStatement, tableWidth);
  doc.text(statementLines, margin, yPosition);
  
  yPosition += statementLines.length * 7;
  
  // Methodology statement
  const methodologyStatement = "Methodology: I have been instructed to prepare this medical report for The Court in connection with the personal injuries sustained by the claimant. I interviewed and examined the claimant.";
  const methodologyLines = doc.splitTextToSize(methodologyStatement, tableWidth);
  doc.text(methodologyLines, margin, yPosition);
  
  // ==================== PAGE 2: INJURY TABLE & DETAILS ====================
  doc.addPage();
  
  // Add header with background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 20, "F");
  
  // Header text
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255); // White
  doc.setFont("helvetica", "bold");
  doc.text("INJURY ASSESSMENT & TREATMENT DETAILS", 105, 14, { align: "center" });
  
  yPosition = 30;
  
  // Injury Table
  if (caseData.physicalInjuryDetails && hasPhysicalInjuryWithInjuries(caseData.physicalInjuryDetails) && caseData.physicalInjuryDetails.injuries.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("INJURY SUMMARY TABLE", 105, yPosition, { align: "center" });
    
    yPosition += 10;
    
    // Table headers
    const headers = ["Injury", "Current Condition", "Prognosis", "Treatment", "Classification"];
    const columnWidths = [40, 35, 35, 35, 35];
    const startX = 15;
    
    // Draw table header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(startX, yPosition, columnWidths.reduce((a, b) => a + b, 0), 10, "F");
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    
    let currentX = startX;
    headers.forEach((header, i) => {
      doc.text(header, currentX + columnWidths[i] / 2, yPosition + 6, { align: "center" });
      currentX += columnWidths[i];
    });
    
    yPosition += 10;
    
    // Draw table rows
    const injuries = caseData.physicalInjuryDetails.injuries;
    let rowHeight = 10;
    
    // Get prognosis data if available
    let treatmentRecommendations: string[] = [];
    if (caseData.prognosis && hasPrognosisWithRecommendations(caseData.prognosis)) {
      treatmentRecommendations = caseData.prognosis.treatmentRecommendations;
    }
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    injuries.forEach((injury: any, index: number) => {
      // Set alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      
      doc.rect(startX, yPosition, columnWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
      
      // Row content
      currentX = startX;
      
      // Injury name
      doc.text(injury.type, currentX + 2, yPosition + 6);
      currentX += columnWidths[0];
      
      // Current condition
      doc.text(injury.currentSeverity, currentX + 2, yPosition + 6);
      currentX += columnWidths[1];
      
      // Prognosis
      let prognosisText = "";
      if (injury.currentSeverity === "Resolved") {
        prognosisText = `Resolved after ${injury.resolutionDays || "unknown"} days`;
      } else {
        prognosisText = "Ongoing";
        if (caseData.prognosis && hasPrognosisWithRecommendations(caseData.prognosis)) {
          prognosisText = caseData.prognosis.overallPrognosis;
        }
      }
      doc.text(prognosisText, currentX + 2, yPosition + 6);
      currentX += columnWidths[2];
      
      // Treatment recommendation
      const treatment = treatmentRecommendations.length > 0 ? 
        treatmentRecommendations[0] : "Standard care advised";
      doc.text(treatment, currentX + 2, yPosition + 6);
      currentX += columnWidths[3];
      
      // Classification
      doc.text(injury.classification, currentX + 2, yPosition + 6);
      
      yPosition += rowHeight;
    });
    
    yPosition += 10;
  }
  
  // Sections with details
  
  // Accident Details Section
  if (caseData.accidentDetails && hasAccidentDetails(caseData.accidentDetails)) {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition, 180, 10, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("ACCIDENT DETAILS", 105, yPosition + 7, { align: "center" });
    
    yPosition += 15;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const accident = caseData.accidentDetails;
    
    // Create formatted description text without repeating the accident date
    let description = `Time: ${accident.accidentTime || "Unknown"} | Location: ${accident.accidentLocation || "Unknown"}\n`;
    
    if (accident.vehicleType) {
      description += `Vehicle Type: ${accident.vehicleType} | `;
    }
    
    if (accident.claimantPosition) {
      description += `Claimant Position: ${accident.claimantPosition} | `;
    }
    
    if (accident.impactLocation) {
      description += `Impact: ${accident.impactLocation}\n`;
    }
    
    if (accident.accidentDescription) {
      description += `\n${accident.accidentDescription}`;
    }
    
    const splitText = doc.splitTextToSize(description, 170);
    doc.text(splitText, 20, yPosition);
    
    yPosition += splitText.length * 5 + 10;
  }
  
  // Injury Details Section
  if (caseData.physicalInjuryDetails && hasPhysicalInjury(caseData.physicalInjuryDetails)) {
    // Check if we need to start a new page
    if (yPosition > 230) {
      doc.addPage();
      
      // Add header with background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 20, "F");
      
      // Header text
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); // White
      doc.setFont("helvetica", "bold");
      doc.text("INJURY & TREATMENT DETAILS (CONTINUED)", 105, 14, { align: "center" });
      
      yPosition = 30;
    }
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition, 180, 10, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("INJURY DETAILS", 105, yPosition + 7, { align: "center" });
    
    yPosition += 15;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Physical injuries summary
    if (caseData.physicalInjuryDetails.physicalInjurySummary) {
      const splitSummary = doc.splitTextToSize(caseData.physicalInjuryDetails.physicalInjurySummary, 170);
      doc.text(splitSummary, 20, yPosition);
      yPosition += splitSummary.length * 5 + 5;
    }
    
    // Additional notes
    if (caseData.physicalInjuryDetails.additionalNotes) {
      doc.setFont("helvetica", "bold");
      doc.text("Additional Notes:", 20, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      
      const splitNotes = doc.splitTextToSize(caseData.physicalInjuryDetails.additionalNotes, 170);
      doc.text(splitNotes, 20, yPosition);
      yPosition += splitNotes.length * 5 + 5;
    }
    
    yPosition += 5;
  }
  
  // Treatment Details Section
  if (caseData.treatments && hasTreatments(caseData.treatments)) {
    // Check if we need to start a new page
    if (yPosition > 230) {
      doc.addPage();
      
      // Add header with background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 20, "F");
      
      // Header text
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); // White
      doc.setFont("helvetica", "bold");
      doc.text("INJURY & TREATMENT DETAILS (CONTINUED)", 105, 14, { align: "center" });
      
      yPosition = 30;
    }
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition, 180, 10, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("TREATMENT DETAILS", 105, yPosition + 7, { align: "center" });
    
    yPosition += 15;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const treatments = caseData.treatments;
    
    let treatmentText = "";
    
    // Treatment at accident scene
    if (treatments.receivedTreatmentAtScene) {
      treatmentText += "Treatment at Scene: ";
      const sceneTreatments = [];
      
      if (treatments.sceneFirstAid) sceneTreatments.push("First Aid");
      if (treatments.sceneNeckCollar) sceneTreatments.push("Neck Collar");
      if (treatments.sceneAmbulanceArrived) sceneTreatments.push("Ambulance Attendance");
      if (treatments.scenePoliceArrived) sceneTreatments.push("Police Attendance");
      if (treatments.sceneOtherTreatment && treatments.sceneOtherTreatmentDetails) {
        sceneTreatments.push(treatments.sceneOtherTreatmentDetails);
      }
      
      treatmentText += sceneTreatments.join(", ") + "\n";
    }
    
    // Hospital treatment
    if (treatments.wentToHospital) {
      treatmentText += "Hospital Attendance: ";
      
      if (treatments.hospitalName) {
        treatmentText += treatments.hospitalName;
      }
      
      treatmentText += "\nHospital Treatment: ";
      const hospitalTreatments = [];
      
      if (treatments.hospitalXRay) hospitalTreatments.push("X-Ray");
      if (treatments.hospitalCTScan) hospitalTreatments.push("CT Scan");
      if (treatments.hospitalBandage) hospitalTreatments.push("Bandage");
      if (treatments.hospitalNeckCollar) hospitalTreatments.push("Neck Collar");
      if (treatments.hospitalOtherTreatment && treatments.hospitalOtherTreatmentDetails) {
        hospitalTreatments.push(treatments.hospitalOtherTreatmentDetails);
      }
      if (treatments.hospitalNoTreatment) hospitalTreatments.push("No treatment received");
      
      treatmentText += hospitalTreatments.join(", ") + "\n";
    }
    
    // GP/Walk-in treatment
    if (treatments.wentToGPWalkIn) {
      treatmentText += "GP/Walk-in Visit: ";
      if (treatments.daysToGPWalkIn) {
        treatmentText += `${treatments.daysToGPWalkIn} days after accident`;
      } else {
        treatmentText += "Yes";
      }
      treatmentText += "\n";
    }
    
    // Current medications
    const medications = [];
    if (treatments.takingParacetamol) medications.push("Paracetamol");
    if (treatments.takingIbuprofen) medications.push("Ibuprofen");
    if (treatments.takingCodeine) medications.push("Codeine");
    if (treatments.takingOtherMedication && treatments.otherMedicationDetails) {
      medications.push(treatments.otherMedicationDetails);
    }
    
    if (medications.length > 0) {
      treatmentText += "Current Medications: " + medications.join(", ") + "\n";
    }
    
    // Physiotherapy
    if (treatments.physiotherapySessions) {
      treatmentText += `Physiotherapy: ${treatments.physiotherapySessions} sessions\n`;
    }
    
    // Treatment summary
    if (treatments.treatmentSummary) {
      treatmentText += "\n" + treatments.treatmentSummary;
    }
    
    const splitTreatment = doc.splitTextToSize(treatmentText, 170);
    doc.text(splitTreatment, 20, yPosition);
    yPosition += splitTreatment.length * 5 + 10;
  }
  
  // Impact on Lifestyle Section
  if (caseData.lifestyleImpact && hasLifestyleImpact(caseData.lifestyleImpact)) {
    // Check if we need to start a new page
    if (yPosition > 230) {
      doc.addPage();
      
      // Add header with background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 20, "F");
      
      // Header text
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); // White
      doc.setFont("helvetica", "bold");
      doc.text("INJURY IMPACT & PROGNOSIS (CONTINUED)", 105, 14, { align: "center" });
      
      yPosition = 30;
    }
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition, 180, 10, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("IMPACT ON LIFESTYLE", 105, yPosition + 7, { align: "center" });
    
    yPosition += 15;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const lifestyle = caseData.lifestyleImpact;
    
    let lifestyleText = "";
    
    // Job details
    if (lifestyle.currentJobTitle) {
      lifestyleText += `Job Title: ${lifestyle.currentJobTitle} (${lifestyle.workStatus || "Unknown status"})\n`;
      
      if (lifestyle.secondJob) {
        lifestyleText += `Second Job: ${lifestyle.secondJob}\n`;
      }
    }
    
    // Work impact
    if (lifestyle.daysOffWork) {
      lifestyleText += `Days Off Work: ${lifestyle.daysOffWork}\n`;
    }
    
    if (lifestyle.workDifficulties && lifestyle.workDifficulties.length > 0) {
      lifestyleText += `Work Difficulties: ${lifestyle.workDifficulties.join(", ")}\n`;
    }
    
    // Sleep impact
    if (lifestyle.hasSleepDisturbance && lifestyle.sleepDisturbances && lifestyle.sleepDisturbances.length > 0) {
      lifestyleText += `Sleep Disturbances: ${lifestyle.sleepDisturbances.join(", ")}\n`;
    }
    
    // Domestic impact
    if (lifestyle.hasDomesticImpact && lifestyle.domesticActivities && lifestyle.domesticActivities.length > 0) {
      lifestyleText += `Domestic Activities Affected: ${lifestyle.domesticActivities.join(", ")}\n`;
    }
    
    // Sport/leisure impact
    if (lifestyle.hasSportLeisureImpact && lifestyle.sportLeisureActivities && lifestyle.sportLeisureActivities.length > 0) {
      lifestyleText += `Sport/Leisure Activities Affected: ${lifestyle.sportLeisureActivities.join(", ")}\n`;
    }
    
    // Social impact
    if (lifestyle.hasSocialImpact && lifestyle.socialActivities && lifestyle.socialActivities.length > 0) {
      lifestyleText += `Social Activities Affected: ${lifestyle.socialActivities.join(", ")}\n`;
    }
    
    // Lifestyle summary
    if (lifestyle.lifestyleSummary) {
      lifestyleText += "\n" + lifestyle.lifestyleSummary;
    }
    
    const splitLifestyle = doc.splitTextToSize(lifestyleText, 170);
    doc.text(splitLifestyle, 20, yPosition);
    yPosition += splitLifestyle.length * 5 + 10;
  }
  
  // Attached Statements Section - First Statement
  let addedFirstStatement = false;
  
  if (caseData.familyHistory && hasFamilyHistory(caseData.familyHistory)) {
    // Check if we need to start a new page
    if (yPosition > 230) {
      doc.addPage();
      
      // Add header with background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 20, "F");
      
      // Header text
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); // White
      doc.setFont("helvetica", "bold");
      doc.text("ATTACHMENTS & STATEMENTS", 105, 14, { align: "center" });
      
      yPosition = 30;
    }
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition, 180, 10, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("ATTACHED STATEMENT - PREVIOUS MEDICAL HISTORY", 105, yPosition + 7, { align: "center" });
    
    yPosition += 15;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const history = caseData.familyHistory;
    
    let historyText = "";
    
    // Previous accidents
    if (history.hasPreviousAccident) {
      historyText += `Previous Road Traffic Accident: Yes\n`;
      if (history.previousAccidentYear) {
        historyText += `Year of Previous Accident: ${history.previousAccidentYear}\n`;
      }
      if (history.previousAccidentRecovery) {
        historyText += `Recovery from Previous Accident: ${history.previousAccidentRecovery}\n`;
      }
    } else {
      historyText += "Previous Road Traffic Accident: No\n";
    }
    
    // Previous medical conditions
    if (history.hasPreviousMedicalCondition) {
      historyText += `Pre-existing Medical Conditions: Yes\n`;
      if (history.previousMedicalConditionDetails) {
        historyText += `Details: ${history.previousMedicalConditionDetails}\n`;
      }
    } else {
      historyText += "Pre-existing Medical Conditions: No\n";
    }
    
    // Exceptional severity
    if (history.hasExceptionalSeverity) {
      historyText += "This case has exceptional severity: Yes\n";
    }
    
    // Physiotherapy preference
    if (history.physiotherapyPreference) {
      historyText += `Physiotherapy Preference: ${history.physiotherapyPreference}\n`;
    }
    
    // Medical history summary
    if (history.medicalHistorySummary) {
      historyText += "\n" + history.medicalHistorySummary;
    }
    
    // Additional notes
    if (history.additionalNotes) {
      historyText += "\n\nAdditional Notes:\n" + history.additionalNotes;
    }
    
    const splitHistory = doc.splitTextToSize(historyText, 170);
    doc.text(splitHistory, 20, yPosition);
    yPosition += splitHistory.length * 5 + 10;
    
    addedFirstStatement = true;
  }
  
  // Attached Statements Section - Second Statement (Prognosis)
  if (caseData.prognosis && hasPrognosis(caseData.prognosis)) {
    // Check if we need to start a new page
    if (yPosition > 230) {
      doc.addPage();
      
      // Add header with background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 20, "F");
      
      // Header text
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); // White
      doc.setFont("helvetica", "bold");
      doc.text(addedFirstStatement ? "ATTACHMENTS & STATEMENTS (CONTINUED)" : "ATTACHMENTS & STATEMENTS", 105, 14, { align: "center" });
      
      yPosition = 30;
    }
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition, 180, 10, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("ATTACHED STATEMENT - PROGNOSIS & RECOMMENDATIONS", 105, yPosition + 7, { align: "center" });
    
    yPosition += 15;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const prognosis = caseData.prognosis;
    
    let prognosisText = "";
    
    // Overall prognosis
    if (hasPrognosisWithRecommendations(prognosis) && prognosis.overallPrognosis) {
      prognosisText += `Overall Prognosis: ${prognosis.overallPrognosis}\n`;
    }
    
    // Expected recovery
    if (prognosis.expectedRecoveryTime) {
      prognosisText += `Expected Recovery Time: ${prognosis.expectedRecoveryTime}\n`;
    }
    
    // Permanent impairment
    if (prognosis.permanentImpairment) {
      prognosisText += `Permanent Impairment: ${prognosis.permanentImpairment}\n`;
    }
    
    // Future care
    if (prognosis.futureCarePlans) {
      prognosisText += `Future Care Plans: ${prognosis.futureCarePlans}\n`;
    }
    
    // Treatment recommendations
    if (hasPrognosisWithRecommendations(prognosis) && prognosis.treatmentRecommendations.length > 0) {
      prognosisText += `Treatment Recommendations: ${prognosis.treatmentRecommendations.join(", ")}\n`;
    }
    
    // Additional notes
    if (prognosis.additionalNotes) {
      prognosisText += "\nAdditional Notes:\n" + prognosis.additionalNotes;
    }
    
    const splitPrognosis = doc.splitTextToSize(prognosisText, 170);
    doc.text(splitPrognosis, 20, yPosition);
    yPosition += splitPrognosis.length * 5 + 10;
  }
  
  // Add final declaration and signature page
  doc.addPage();
  
  // Add header with background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 20, "F");
  
  // Header text
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255); // White
  doc.setFont("helvetica", "bold");
  doc.text("DECLARATION", 105, 14, { align: "center" });
  
  yPosition = 30;
  
  // Declaration content
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Declaration text
  let declarationText = "Declaration:";
  const splitDeclaration = doc.splitTextToSize(declarationText, 170);
  doc.text(splitDeclaration, 20, yPosition);
  yPosition += splitDeclaration.length * 5 + 15;
  
  // Agreement text
  declarationText = "Agreement of Report:";
  const splitAgreement = doc.splitTextToSize(declarationText, 170);
  doc.text(splitAgreement, 20, yPosition);
  yPosition += splitAgreement.length * 5 + 15;
  
  // Statement of Truth text
  declarationText = "Statement of Truth:";
  const splitTruth = doc.splitTextToSize(declarationText, 170);
  doc.text(splitTruth, 20, yPosition);
  yPosition += splitTruth.length * 5 + 30;
  
  // Signature line
  doc.text("Signature:", 20, yPosition);
  doc.line(55, yPosition, 180, yPosition);
  yPosition += 15;
  
  // Date line
  doc.text("Date:", 20, yPosition);
  doc.line(55, yPosition, 180, yPosition);
  yPosition += 25;
  
  // Medical expert CV
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Medical Expert's Curriculum Vitae:", 20, yPosition);
  yPosition += 15;
  
  if (caseData.expertDetails && hasExpertDetails(caseData.expertDetails)) {
    const expert = caseData.expertDetails;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    let cvText = "";
    
    cvText += `Name: ${expert.examiner || "N/A"}\n`;
    cvText += `Credentials: ${expert.credentials || "N/A"}\n`;
    
    if (expert.specialty) {
      cvText += `Specialty: ${expert.specialty}\n`;
    }
    
    if (expert.licensureState && expert.licenseNumber) {
      cvText += `License: ${expert.licenseNumber} (${expert.licensureState})\n`;
    }
    
    if (expert.experienceYears) {
      cvText += `Years of Experience: ${expert.experienceYears}\n`;
    }
    
    if (expert.contactInformation) {
      cvText += `Contact Information: ${expert.contactInformation}\n`;
    }
    
    const splitCV = doc.splitTextToSize(cvText, 170);
    doc.text(splitCV, 20, yPosition);
  }
  
  // Add footer on each page
  if (caseData.claimantDetails && hasClaimantDetails(caseData.claimantDetails) && caseData.claimantDetails.fullName) {
    addFooter(doc, caseData.claimantDetails.fullName);
  } else {
    addFooter(doc, "Unknown Claimant");
  }
  
  // Generate data URL for the PDF
  return doc.output('datauristring');
};

// Generate a preview of the PDF from case data
export const generatePDFPreview = (caseData: Case, options?: PDFCustomizationOptions): string => {
  // In a real application, we would render this as an HTML preview
  // For now, we'll return a message that the preview is generated in PDF format with options
  
  // Merge provided options with default options
  const pdfOptions = { ...defaultPDFOptions, ...options };
  
  // Create a string representation of the active options for display
  const optionsDisplay = `
    <div class="pdf-options-summary">
      <h3>PDF Customization Options</h3>
      <ul>
        <li><strong>Page Layout:</strong> ${pdfOptions.pageSize} (${pdfOptions.orientation})</li>
        <li><strong>Font:</strong> ${pdfOptions.fontFamily}</li>
        <li><strong>Cover Page:</strong> ${pdfOptions.includeCoverPage ? 'Included' : 'Not included'}</li>
        <li><strong>Agency Details:</strong> ${pdfOptions.includeAgencyDetails ? 'Included' : 'Not included'}</li>
        <li><strong>Logo:</strong> ${pdfOptions.logoUrl ? 'Custom logo' : 'Default logo'}</li>
        <li><strong>Table of Contents:</strong> ${pdfOptions.includeTableOfContents ? 'Included' : 'Not included'}</li>
        <li><strong>Expert CV:</strong> ${pdfOptions.includeExpertCV ? 'Included' : 'Not included'}</li>
        <li><strong>Declaration:</strong> ${pdfOptions.includeDeclaration ? 'Included' : 'Not included'}</li>
        <li><strong>Primary Color:</strong> RGB(${pdfOptions.primaryColor?.join(', ')})</li>
      </ul>
      <h4>Sections to Include:</h4>
      <ul>
        <li><strong>Claimant Details:</strong> ${pdfOptions.sectionsToInclude?.claimantDetails ? 'Yes' : 'No'}</li>
        <li><strong>Accident Details:</strong> ${pdfOptions.sectionsToInclude?.accidentDetails ? 'Yes' : 'No'}</li>
        <li><strong>Physical Injury:</strong> ${pdfOptions.sectionsToInclude?.physicalInjury ? 'Yes' : 'No'}</li>
        <li><strong>Psychological Injury:</strong> ${pdfOptions.sectionsToInclude?.psychologicalInjury ? 'Yes' : 'No'}</li>
        <li><strong>Treatments:</strong> ${pdfOptions.sectionsToInclude?.treatments ? 'Yes' : 'No'}</li>
        <li><strong>Lifestyle Impact:</strong> ${pdfOptions.sectionsToInclude?.lifeStyleImpact ? 'Yes' : 'No'}</li>
        <li><strong>Family History:</strong> ${pdfOptions.sectionsToInclude?.familyHistory ? 'Yes' : 'No'}</li>
        <li><strong>Prognosis:</strong> ${pdfOptions.sectionsToInclude?.prognosis ? 'Yes' : 'No'}</li>
        <li><strong>Expert Details:</strong> ${pdfOptions.sectionsToInclude?.expertDetails ? 'Yes' : 'No'}</li>
      </ul>
    </div>
  `;
  
  return `
    <div>
      <h2>MedCo-Compliant PDF Report</h2>
      <p>The PDF report has been customized with the following options:</p>
      ${optionsDisplay}
      <p>Click "Generate PDF" to download the complete report with these options.</p>
    </div>
  `;
};
