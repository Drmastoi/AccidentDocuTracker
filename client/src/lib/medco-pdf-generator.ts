import { jsPDF } from "jspdf";
import { Case, PhysicalInjury, ClaimantDetails, AccidentDetails, Treatments, FamilyHistory, ExpertDetails, LifestyleImpact, PsychologicalInjuries } from "@shared/schema";

// PDF customization options interface (reused from original pdf-generator.ts)
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
    expertDetails?: boolean;
  };
}

// Type guard functions for safety
const hasClaimantDetails = (details: any): details is ClaimantDetails => {
  return details !== null && details !== undefined;
};

const hasAccidentDetails = (details: any): details is AccidentDetails => {
  return details !== null && details !== undefined;
};

const hasPhysicalInjuryWithInjuries = (details: any): details is PhysicalInjuryWithInjuries => {
  return details !== null && details !== undefined && Array.isArray(details.injuries);
};

const hasTreatments = (details: any): details is Treatments => {
  return details !== null && details !== undefined;
};

const hasLifestyleImpact = (details: any): details is LifestyleImpact => {
  return details !== null && details !== undefined;
};

const hasFamilyHistory = (details: any): details is FamilyHistory => {
  return details !== null && details !== undefined;
};

const hasExpertDetails = (details: any): details is ExpertDetails => {
  return details !== null && details !== undefined;
};

const hasPsychologicalInjuries = (details: any): details is PsychologicalInjuries => {
  return details !== null && details !== undefined;
};

// Extended interfaces for nested data
interface PhysicalInjuryWithInjuries extends PhysicalInjury {
  injuries: any[];
}

// Default options
const defaultPDFOptions: PDFCustomizationOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  includeCoverPage: true,
  includeAgencyDetails: true,
  fontFamily: 'helvetica',
  fontSize: {
    title: 18,
    subtitle: 14,
    sectionHeader: 12,
    bodyText: 10
  },
  includeSectionNumbers: true,
  includeTableOfContents: false,
  primaryColor: [14, 124, 123], // Teal blue (#0E7C7B)
  secondaryColor: [74, 85, 104], // Slate gray (#4A5568)
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
    expertDetails: true
  }
};

// Define footer function
const addFooter = (doc: jsPDF, pageNumber: number, totalPages: number, caseNumber: string) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Page ${pageNumber} of ${totalPages} | ${caseNumber || "Medico-Legal Report"}`, pageWidth / 2, pageHeight - 10, { align: "center" });
};

// Main PDF generation function
export const generateMedcoPDF = (caseData: Case, options?: PDFCustomizationOptions): string => {
  const pdfOptions = {
    ...defaultPDFOptions,
    ...options
  };
  
  const doc = new jsPDF({
    orientation: pdfOptions.orientation || 'portrait',
    unit: 'mm',
    format: pdfOptions.pageSize || 'a4'
  });
  
  // Set the font family
  const fontFamily = pdfOptions.fontFamily || 'helvetica';
  doc.setFont(fontFamily);
  
  // Format date function
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };
  
  // Helper function to add a section header with black background
  const addSectionHeader = (title: string, yPos: number) => {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const headerWidth = pageWidth - (margin * 2);
    
    // Black header bar
    doc.setFillColor(0, 0, 0);
    doc.rect(margin, yPos, headerWidth, 7, "F");
    
    // White header text
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont(fontFamily, "bold");
    doc.text(title, margin + 5, yPos + 5);
    
    return yPos + 10; // Return new Y position after header
  };
  
  // Helper function to add a field with label and value
  const addField = (label: string, value: string, xPos: number, yPos: number, maxWidth?: number) => {
    doc.setFontSize(9);
    doc.setFont(fontFamily, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(label, xPos, yPos);
    
    doc.setFont(fontFamily, "normal");
    const valueMaxWidth = maxWidth || 80;
    const valueLines = doc.splitTextToSize(value || "Not provided", valueMaxWidth);
    doc.text(valueLines, xPos, yPos + 5);
    
    return yPos + 5 + (valueLines.length * 5); // Return updated Y position
  };
  
  // Keep track of total pages for footer
  let totalPages = 1;
  let currentPage = 1;
  
  // === PAGE 1: START ===
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  let yPosition = margin;
  const claimant = caseData.claimantDetails || {};
  
  // FIRST SECTION: CLAIMANT DETAILS
  yPosition = addSectionHeader("CLAIMANT DETAILS", yPosition);
  
  // Two-column layout for claimant details
  const col1X = margin + 5;
  const col2X = pageWidth / 2 + 5;
  
  // First column details
  let leftColY = yPosition;
  leftColY = addField("Full Name:", claimant?.fullName || "Not provided", col1X, leftColY);
  leftColY = addField("Date of Birth:", claimant?.dateOfBirth ? formatDate(claimant.dateOfBirth) : "Not provided", col1X, leftColY + 2);
  leftColY = addField("Address:", claimant?.address || "Not provided", col1X, leftColY + 2);
  
  // Second column details
  let rightColY = yPosition;
  rightColY = addField("Occupation:", claimant?.occupation || "Not provided", col2X, rightColY);
  rightColY = addField("Accompanied By:", claimant?.accompaniedBy || "None", col2X, rightColY + 2);
  
  // Next Y position should be the greater of the two columns
  yPosition = Math.max(leftColY, rightColY) + 5;
  
  // INSTRUCTING PARTY SECTION
  yPosition = addSectionHeader("INSTRUCTING PARTY DETAILS", yPosition);
  
  // Two-column layout for instructing party
  leftColY = yPosition;
  leftColY = addField("Instructing Party:", claimant?.instructingParty || "Not provided", col1X, leftColY);
  leftColY = addField("Solicitor:", claimant?.solicitorName || "Not provided", col1X, leftColY + 2);
  
  rightColY = yPosition;
  rightColY = addField("MedCo Reference:", claimant?.medcoRefNumber || "Not provided", col2X, rightColY);
  
  // Next Y position
  yPosition = Math.max(leftColY, rightColY) + 5;
  
  // EXAMINATION DETAILS SECTION
  yPosition = addSectionHeader("EXAMINATION DETAILS", yPosition);
  
  // Two-column layout for examination details
  leftColY = yPosition;
  leftColY = addField("Date of Examination:", claimant?.dateOfExamination ? formatDate(claimant.dateOfExamination) : "Not provided", col1X, leftColY);
  leftColY = addField("Place of Examination:", claimant?.placeOfExamination || "Not provided", col1X, leftColY + 2);
  
  rightColY = yPosition;
  rightColY = addField("Date of Report:", claimant?.dateOfReport ? formatDate(claimant.dateOfReport) : formatDate(new Date().toISOString()), col2X, rightColY);
  rightColY = addField("Time with Claimant:", claimant?.timeSpentWithClaimant || "Not recorded", col2X, rightColY + 2);
  
  // Next Y position
  yPosition = Math.max(leftColY, rightColY) + 5;
  
  // ACCIDENT DETAILS SECTION
  yPosition = addSectionHeader("ACCIDENT DETAILS", yPosition);
  
  const accident = caseData.accidentDetails || {};
  
  // Single column for accident details
  yPosition = addField("Date of Accident:", accident?.dateOfAccident ? formatDate(accident.dateOfAccident) : "Not provided", col1X, yPosition);
  yPosition = addField("Time of Accident:", accident?.timeOfAccident || "Not provided", col1X, yPosition + 2);
  yPosition = addField("Location of Accident:", accident?.locationOfAccident || "Not provided", col1X, yPosition + 2);
  yPosition = addField("Description of Accident:", accident?.descriptionOfAccident || "Not provided", col1X, yPosition + 2, pageWidth - 30);
  
  yPosition += 5;
  
  // MEDICAL HISTORY SECTION
  yPosition = addSectionHeader("MEDICAL HISTORY", yPosition);
  
  // Check if we have data
  if (hasPhysicalInjuryWithInjuries(caseData.physicalInjuryDetails)) {
    const physical = caseData.physicalInjuryDetails;
    
    yPosition = addField("Previous Medical History:", physical.previousMedicalHistory || "No relevant history reported", col1X, yPosition, pageWidth - 30);
    yPosition = addField("GP Details:", physical.gpDetails || "Not provided", col1X, yPosition + 2, pageWidth - 30);
    
    // Add list of injuries if available
    if (physical.injuries && physical.injuries.length > 0) {
      yPosition += 5;
      doc.setFont(fontFamily, "bold");
      doc.text("Injuries Sustained:", col1X, yPosition);
      yPosition += 5;
      
      doc.setFont(fontFamily, "normal");
      physical.injuries.forEach((injury: any, index: number) => {
        doc.text(`${index + 1}. ${injury.name || "Unspecified injury"}`, col1X + 5, yPosition);
        yPosition += 5;
      });
    }
  } else {
    yPosition = addField("Medical History:", "No medical history information provided", col1X, yPosition, pageWidth - 30);
  }
  
  // Add footer
  addFooter(doc, currentPage, totalPages, caseData.caseNumber);
  
  // PHYSICAL EXAMINATION SECTION (new page)
  doc.addPage();
  currentPage++;
  totalPages++;
  yPosition = margin;
  
  yPosition = addSectionHeader("PHYSICAL EXAMINATION", yPosition);
  
  if (hasPhysicalInjuryWithInjuries(caseData.physicalInjuryDetails)) {
    const physical = caseData.physicalInjuryDetails;
    
    yPosition = addField("Examination Findings:", physical.examinationFindings || "No specific findings noted", col1X, yPosition, pageWidth - 30);
    
    // Add injury details with detailed examination findings for each
    if (physical.injuries && physical.injuries.length > 0) {
      physical.injuries.forEach((injury: any) => {
        yPosition += 5;
        doc.setFont(fontFamily, "bold");
        doc.text(`${injury.name || "Injury"} - Details:`, col1X, yPosition);
        yPosition += 5;
        
        doc.setFont(fontFamily, "normal");
        const details = injury.currentCondition || "No detailed information provided";
        const detailLines = doc.splitTextToSize(details, pageWidth - 30);
        doc.text(detailLines, col1X + 5, yPosition);
        yPosition += (detailLines.length * 5) + 3;
      });
    }
  } else {
    yPosition = addField("Examination Findings:", "No physical examination information provided", col1X, yPosition, pageWidth - 30);
  }
  
  // PSYCHOLOGICAL ASSESSMENT
  yPosition += 5;
  yPosition = addSectionHeader("PSYCHOLOGICAL ASSESSMENT", yPosition);
  
  if (hasPsychologicalInjuries(caseData.psychologicalInjuries)) {
    const psych = caseData.psychologicalInjuries;
    
    const anxietySymptoms = psych.travelAnxietySymptoms ? psych.travelAnxietySymptoms.join(", ") : "None reported";
    yPosition = addField("Travel Anxiety Symptoms:", anxietySymptoms, col1X, yPosition, pageWidth - 30);
    
    const anxietyOnset = psych.travelAnxietyOnset || "Not specified";
    yPosition = addField("Anxiety Onset:", anxietyOnset, col1X, yPosition + 2, pageWidth - 30);
    
    const initialSeverity = psych.travelAnxietyInitialSeverity || "Not specified";
    yPosition = addField("Initial Severity:", initialSeverity, col1X, yPosition + 2, pageWidth - 30);
    
    const currentSeverity = psych.travelAnxietyCurrentSeverity || "Not specified";
    yPosition = addField("Current Severity:", currentSeverity, col1X, yPosition + 2, pageWidth - 30);
  } else {
    yPosition = addField("Psychological Findings:", "No psychological information provided", col1X, yPosition, pageWidth - 30);
  }
  
  // Add footer
  addFooter(doc, currentPage, totalPages, caseData.caseNumber);
  
  // TREATMENTS PAGE
  doc.addPage();
  currentPage++;
  totalPages++;
  yPosition = margin;
  
  yPosition = addSectionHeader("TREATMENT DETAILS", yPosition);
  
  if (hasTreatments(caseData.treatments)) {
    const treatments = caseData.treatments;
    
    // Hospital attendance information
    const hospitalAttendance = treatments.attHospital ? "Yes" : "No";
    yPosition = addField("Attended Hospital:", hospitalAttendance, col1X, yPosition, pageWidth - 30);
    
    if (treatments.attHospital) {
      yPosition = addField("Hospital Name:", treatments.hospitalName || "Not specified", col1X, yPosition + 2, pageWidth - 30);
      yPosition = addField("Hospital Department:", treatments.hospitalDepartment || "Not specified", col1X, yPosition + 2, pageWidth - 30);
    }
    
    // GP information
    const gp = treatments.consultedGP ? "Yes" : "No";
    yPosition = addField("Consulted GP:", gp, col1X, yPosition + 2, pageWidth - 30);
    
    // Medication information
    const medications = [];
    if (treatments.painkillers) medications.push("Painkillers");
    if (treatments.antiinflammatories) medications.push("Anti-inflammatories");
    if (treatments.muscleRelaxants) medications.push("Muscle Relaxants");
    if (treatments.sleepMedication) medications.push("Sleep Medication");
    
    const medicationText = medications.length > 0 ? medications.join(", ") : "None";
    yPosition = addField("Medications:", medicationText, col1X, yPosition + 2, pageWidth - 30);
    
    // Treatment summary
    yPosition = addField("Treatment Summary:", treatments.treatmentSummary || "No summary provided", col1X, yPosition + 2, pageWidth - 30);
  } else {
    yPosition = addField("Treatment Information:", "No treatment information provided", col1X, yPosition, pageWidth - 30);
  }
  
  // LIFESTYLE IMPACT SECTION
  yPosition += 5;
  yPosition = addSectionHeader("IMPACT ON LIFESTYLE", yPosition);
  
  if (hasLifestyleImpact(caseData.lifestyleImpact)) {
    const lifestyle = caseData.lifestyleImpact;
    
    // Work-related impacts
    yPosition = addField("Job Title:", lifestyle.currentJobTitle || "Not provided", col1X, yPosition, pageWidth - 30);
    yPosition = addField("Employment Status:", lifestyle.workStatus || "Not provided", col1X, yPosition + 2, pageWidth - 30);
    
    // Time off work
    const timeOffWork = lifestyle.daysOffWork ? `${lifestyle.daysOffWork} days` : "None reported";
    yPosition = addField("Time Off Work:", timeOffWork, col1X, yPosition + 2, pageWidth - 30);
    
    // Domestic impact details
    const domesticImpact = lifestyle.hasDomesticImpact ? "Yes" : "No";
    yPosition = addField("Domestic Impact:", domesticImpact, col1X, yPosition + 2, pageWidth - 30);
    
    if (lifestyle.hasDomesticImpact && lifestyle.domesticDetails) {
      yPosition = addField("Domestic Details:", lifestyle.domesticDetails, col1X, yPosition + 2, pageWidth - 30);
    }
    
    // Leisure impact details
    const leisureImpact = lifestyle.hasLeisureImpact ? "Yes" : "No";
    yPosition = addField("Leisure Impact:", leisureImpact, col1X, yPosition + 2, pageWidth - 30);
    
    if (lifestyle.hasLeisureImpact && lifestyle.leisureDetails) {
      yPosition = addField("Leisure Details:", lifestyle.leisureDetails, col1X, yPosition + 2, pageWidth - 30);
    }
    
    // Summary
    yPosition = addField("Lifestyle Summary:", lifestyle.lifestyleSummary || "No summary provided", col1X, yPosition + 2, pageWidth - 30);
  } else {
    yPosition = addField("Lifestyle Impact:", "No information provided regarding impact on lifestyle", col1X, yPosition, pageWidth - 30);
  }
  
  // Add footer
  addFooter(doc, currentPage, totalPages, caseData.caseNumber);
  
  // OPINION AND PROGNOSIS PAGE
  doc.addPage();
  currentPage++;
  totalPages++;
  yPosition = margin;
  
  yPosition = addSectionHeader("OPINION AND PROGNOSIS", yPosition);
  
  // Physical injury opinions
  if (hasPhysicalInjuryWithInjuries(caseData.physicalInjuryDetails)) {
    const physical = caseData.physicalInjuryDetails;
    
    // Display each injury with prognosis
    if (physical.injuries && physical.injuries.length > 0) {
      physical.injuries.forEach((injury: any, index: number) => {
        // Injury name and prognosis
        doc.setFont(fontFamily, "bold");
        doc.text(`${index + 1}. ${injury.name || "Unspecified injury"}:`, col1X, yPosition);
        yPosition += 5;
        
        doc.setFont(fontFamily, "normal");
        const prognosis = injury.prognosis || "No prognosis provided";
        const prognosisLines = doc.splitTextToSize(prognosis, pageWidth - 30);
        doc.text(prognosisLines, col1X + 5, yPosition);
        yPosition += (prognosisLines.length * 5) + 3;
      });
    }
    
    // Overall opinion
    yPosition += 3;
    doc.setFont(fontFamily, "bold");
    doc.text("Overall Opinion:", col1X, yPosition);
    yPosition += 5;
    
    doc.setFont(fontFamily, "normal");
    const opinion = physical.overallOpinion || "No overall opinion provided";
    const opinionLines = doc.splitTextToSize(opinion, pageWidth - 30);
    doc.text(opinionLines, col1X + 5, yPosition);
    yPosition += (opinionLines.length * 5) + 3;
  }
  
  // Add recommendations section
  yPosition += 3;
  yPosition = addSectionHeader("RECOMMENDATIONS", yPosition);
  
  if (hasPhysicalInjuryWithInjuries(caseData.physicalInjuryDetails)) {
    const physical = caseData.physicalInjuryDetails;
    
    const recommendations = physical.recommendationsAndNext || "No specific recommendations provided";
    yPosition = addField("Further Treatment Recommendations:", recommendations, col1X, yPosition, pageWidth - 30);
  } else {
    yPosition = addField("Recommendations:", "No recommendations provided", col1X, yPosition, pageWidth - 30);
  }
  
  // Add footer
  addFooter(doc, currentPage, totalPages, caseData.caseNumber);
  
  // DECLARATION PAGE
  doc.addPage();
  currentPage++;
  totalPages++;
  yPosition = margin;
  
  yPosition = addSectionHeader("STATEMENT OF TRUTH", yPosition);
  
  // Expert information
  const expert = caseData.expertDetails || {};
  const expertName = expert.examiner || "Dr. Awais Iqbal";
  const expertCredentials = expert.credentials || "MBBS, Direct Medical Expert";
  
  // Declaration text
  yPosition += 5;
  doc.setFont(fontFamily, "normal");
  const declarationText = 
    "I understand that my overriding duty is to the court, both in preparing this report and in giving oral evidence. " +
    "I have complied with that duty and will continue to do so. I am aware of the requirements set out in Part 35 of the Civil " +
    "Procedure Rules and the accompanying practice direction, and the Guidance for the Instruction of Experts in Civil Claims 2014. " +
    "\n\nI have set out in my report what I understand from those instructing me to be the questions in respect of which my opinion " +
    "as an expert is required. " +
    "\n\nI have done my best, in preparing this report, to be accurate and complete. I have mentioned all matters which I regard as " +
    "relevant to the opinions I have expressed. All of the matters on which I have expressed an opinion lie within my field of expertise. " +
    "\n\nI have drawn to the attention of the court all matters, of which I am aware, which might adversely affect my opinion. " +
    "\n\nWherever I have no personal knowledge, I have indicated the source of factual information. " +
    "\n\nI have not included anything in this report which has been suggested to me by anyone, including the lawyers instructing me, " +
    "without forming my own independent view of the matter. " +
    "\n\nI will notify those instructing me if, for any reason, I subsequently consider that the report requires any correction or qualification. " +
    "\n\nI understand that this report will be the evidence that I will give under oath, subject to any correction or qualification I may make " +
    "before swearing to its veracity. " +
    "\n\nI have attached to this report a summary of my relevant qualifications, my relevant experience and the literature or other " +
    "material which I have relied upon to prepare this report. " +
    "\n\nI have also attached a statement setting out the substance of all facts and instructions given to me which are material to the " +
    "opinions expressed in this report or upon which those opinions are based.";
  
  const declarationLines = doc.splitTextToSize(declarationText, pageWidth - 30);
  doc.text(declarationLines, col1X, yPosition);
  yPosition += (declarationLines.length * 5) + 10;
  
  // Signature area
  doc.setFont(fontFamily, "bold");
  doc.text("Signed:", col1X, yPosition);
  yPosition += 10;
  
  // Expert signature (name and credentials)
  doc.setFont(fontFamily, "normal");
  doc.setFontSize(11);
  doc.text(expertName, col1X + 20, yPosition);
  yPosition += 5;
  doc.setFontSize(9);
  doc.setFont(fontFamily, "italic");
  doc.text(expertCredentials, col1X + 20, yPosition);
  yPosition += 5;
  
  // Date
  doc.setFont(fontFamily, "normal");
  const today = formatDate(new Date().toISOString());
  doc.text(`Date: ${today}`, col1X + 20, yPosition);
  
  // Add footer
  addFooter(doc, currentPage, totalPages, caseData.caseNumber);
  
  // Update all page numbers in footers after we know total page count
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages, caseData.caseNumber);
  }
  
  return doc.output('datauristring');
};

// Preview function that reuses the main PDF generator
export const generateMedcoPDFPreview = (caseData: Case, options?: PDFCustomizationOptions): string => {
  return generateMedcoPDF(caseData, options);
};