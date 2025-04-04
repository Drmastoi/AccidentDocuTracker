import { jsPDF } from "jspdf";
import { Case } from "@shared/schema";
import signatureImage from '@/assets/SIGN2.jpeg';

export const generateCustomMedcoPDF = (caseData: Case & {
  claimantDetails?: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    medcoRefNumber?: string;
    dateOfReport?: string;
    identificationProvided?: string;
    accompaniedBy?: string;
    helpWithCommunication?: boolean;
    instructingParty?: string;
    solicitorName?: string;
    dateOfExamination?: string;
    timeSpent?: string;
    placeOfExamination?: string;
  };
  accidentDetails?: {
    accidentDate?: string;
    identificationProvided?: string;
    accompaniedBy?: string;
    helpWithCommunication?: string;
    vehiclePosition?: string;
    impactType?: string;
    wasMoving?: boolean;
    damageSeverity?: string;
    wearingSeatbelt?: boolean;
    hadHeadrest?: boolean;
    airbagDeployed?: boolean;
  };
  expertDetails?: {
    examiner?: string;
    licenseNumber?: string;
    licensureState?: string;
    credentials?: string;
    dateOfReport?: string;
    instructingParty?: string;
    solicitorName?: string;
    medcoRefNumber?: string;
    dateOfExamination?: string;
    timeSpent?: string;
    placeOfExamination?: string;
  };
  physicalInjuryDetails?: {
    injuries?: any[];
  };
}): string => {
  // Initialize PDF with A4 portrait format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Define common variables
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const tealColor = [14, 124, 123]; // RGB for Teal Green #0E7C7B
  
  // Format date function
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Not provided";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };
  
  // Add footer function
  const addFooter = (pageNum: number, totalPages: number) => {
    const claimantName = caseData.claimantDetails?.fullName || "Claimant";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${pageNum} of ${totalPages} | ${claimantName} | ${caseData.caseNumber || "Medico-Legal Report"}`, 
      pageWidth / 2, 
      pageHeight - 10, 
      { align: "center" }
    );
  };
  
  // ======= PAGE 1: COVER PAGE =======
  
  let yPos = 60; // Starting Y position

  // Set black color for title elements
  doc.setTextColor(0, 0, 0);
  
  // Top header - Report type
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MEDICO-LEGAL REPORT", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 30;
  
  // Claimant name in large font - teal labels, black values
  doc.setFontSize(24);
  // Use teal color for the actual name
  doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.text(caseData.claimantDetails?.fullName || "CLAIMANT NAME", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 20;
  
  // MedCo reference with teal label
  doc.setFontSize(14);
  doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.text("MedCo Reference:", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0); // Black for the value
  doc.text(caseData.claimantDetails?.medcoRefNumber || "[REFERENCE NUMBER]", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 40;
  
  // Medical expert details
  doc.setFontSize(14);
  doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]); // Teal for label
  doc.text("Medical Expert:", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0); // Black for the value
  doc.text(caseData.expertDetails?.examiner || "Dr. Awais Iqbal", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text(caseData.expertDetails?.credentials || "MBBS, Direct Medical Expert", pageWidth / 2, yPos, { align: "center" });
  
  // Add date at bottom
  yPos = pageHeight - 40;
  doc.setFontSize(12);
  doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]); // Teal for label
  doc.text("Report Date:", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 8;
  doc.setTextColor(0, 0, 0); // Black for the value
  doc.text(formatDate(caseData.claimantDetails?.dateOfReport || new Date().toISOString()), pageWidth / 2, yPos, { align: "center" });
  
  // Add temporary footer (will be updated with correct total page count at the end)
  addFooter(1, 1);
  
  // ======= PAGE 2: DETAILS PAGE =======
  doc.addPage();
  
  // Helper function to add a field with label and value
  const addField = (label: string, value: string | undefined, x: number, y: number, labelWidth = 60): number => {
    const valueMaxWidth = pageWidth - x - margin - labelWidth;
    
    // Label with teal color
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.text(label, x, y);
    
    // Value with black color
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const valueText = value || "Not provided";
    const valueLines = doc.splitTextToSize(valueText, valueMaxWidth);
    doc.text(valueLines, x + labelWidth, y);
    
    // Return new Y position based on the number of lines
    return y + Math.max(5, valueLines.length * 5);
  };
  
  // Helper function to add a section header
  const addSectionHeader = (title: string, y: number): number => {
    // Draw teal background
    doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.rect(margin, y, pageWidth - (margin * 2), 7, "F");
    
    // Draw white text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, y + 5);
    
    return y + 10;
  };
  
  // Start Y position for page 2
  yPos = margin;
  
  // Section 1: Claimant Details
  yPos = addSectionHeader("1. CLAIMANT DETAILS", yPos);
  
  yPos = addField("1.1 Claimant's Name:", caseData.claimantDetails?.fullName, margin, yPos);
  yPos = addField("1.2 Date of Birth:", formatDate(caseData.claimantDetails?.dateOfBirth), margin, yPos);
  yPos = addField("1.3 Address:", caseData.claimantDetails?.address, margin, yPos);
  yPos = addField("1.4 Gender:", caseData.claimantDetails?.gender || "Not specified", margin, yPos);
  
  // Calculate age if date of birth and accident date are available
  let age = "Not calculated";
  if (caseData.claimantDetails?.dateOfBirth && caseData.accidentDetails?.accidentDate) {
    try {
      const dob = new Date(caseData.claimantDetails.dateOfBirth);
      const accidentDate = new Date(caseData.accidentDetails.accidentDate);
      
      // Safer calculation that handles leap years and month/day differences correctly
      let ageAtAccident = accidentDate.getFullYear() - dob.getFullYear();
      
      // Handle month and day differences
      if (accidentDate.getMonth() < dob.getMonth() || 
          (accidentDate.getMonth() === dob.getMonth() && accidentDate.getDate() < dob.getDate())) {
        ageAtAccident--;
      }
      
      age = ageAtAccident.toString();
    } catch (e) {
      age = "Error calculating";
    }
  }
  
  // Use a smaller font for the "At the time of the Incident" part
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.text("1.5 Age ", margin, yPos);
  
  // Calculate the width of "1.5 Age " text
  const labelWidth = doc.getTextWidth("1.5 Age ");
  
  // Add the smaller text
  doc.setFontSize(8); // 20% smaller than the normal 10pt font
  doc.text("(At the time of the Incident)", margin + labelWidth, yPos);
  
  // Reset for the actual value
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(age || "Not provided", margin + 60, yPos);
  
  // Move to next line
  yPos += 5;
  yPos = addField("1.6 Date of Accident:", formatDate(caseData.accidentDetails?.accidentDate), margin, yPos);
  yPos = addField("1.7 Identification:", (caseData.claimantDetails as any)?.identification?.type || "Not specified", margin, yPos);
  yPos = addField("1.8 Accompanied by:", caseData.claimantDetails?.accompaniedBy || "None", margin, yPos);
  
  // Generate help with communication details for section 1.9
  let communicationHelp = "No";
  if (caseData.claimantDetails?.helpWithCommunication) {
    if ((caseData.claimantDetails as any)?.interpreterName && (caseData.claimantDetails as any)?.interpreterRelationship) {
      communicationHelp = `Yes - ${(caseData.claimantDetails as any).interpreterName} (${(caseData.claimantDetails as any).interpreterRelationship})`;
    } else if ((caseData.claimantDetails as any)?.interpreterName) {
      communicationHelp = `Yes - ${(caseData.claimantDetails as any).interpreterName}`;
    } else {
      communicationHelp = "Yes";
    }
  }
  yPos = addField("1.9 Help with Communication:", communicationHelp, margin, yPos);
  
  yPos += 5;
  
  // Section 2: Expert Details
  yPos = addSectionHeader("2. EXPERT DETAILS", yPos);
  
  yPos = addField("2.1 Medical Expert Name:", caseData.expertDetails?.examiner || "Dr. Awais Iqbal", margin, yPos);
  yPos = addField("2.2 GMC Number:", caseData.expertDetails?.licenseNumber || "GMC 6138189", margin, yPos);
  yPos = addField("2.3 Medco Registration:", caseData.expertDetails?.licensureState || "8094", margin, yPos);
  
  yPos += 5;
  
  // Section 3: Instruction Details
  yPos = addSectionHeader("3. INSTRUCTION DETAILS", yPos);
  
  yPos = addField("3.1 Agency Name:", caseData.claimantDetails?.instructingParty || "Not provided", margin, yPos);
  yPos = addField("3.2 Agency Reference Number:", (caseData.claimantDetails as any)?.instructingPartyRef || "Not provided", margin, yPos);
  yPos = addField("3.3 Solicitor Name:", caseData.claimantDetails?.solicitorName || "Not provided", margin, yPos);
  yPos = addField("3.4 Solicitor Reference Number:", (caseData.claimantDetails as any)?.referenceNumber || "Not provided", margin, yPos);
  yPos = addField("3.5 Medco Reference:", caseData.claimantDetails?.medcoRefNumber || "Not provided", margin, yPos);
  yPos = addField("3.6 Review of Records:", "No medical records were provided for review", margin, yPos);
  
  yPos += 5;
  
  // Section 4: Appointment Details
  yPos = addSectionHeader("4. APPOINTMENT DETAILS", yPos);
  
  yPos = addField("4.1 Date of Appointment:", formatDate(caseData.claimantDetails?.dateOfExamination), margin, yPos);
  yPos = addField("4.2 Time spent:", caseData.claimantDetails?.timeSpent || "15 min", margin, yPos);
  yPos = addField("4.3 Place of Examination:", caseData.claimantDetails?.placeOfExamination || "Medical Examination Center", margin, yPos);
  
  // Add Statement or Instruction section
  yPos += 10;
  
  yPos = addSectionHeader("5. STATEMENT OF INSTRUCTION", yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  const instructionText = "This report is entirely independent and is prepared for the injuries sustained in the accident. The instructing party has requested an examination to be conducted with a report to include the nature and extent of the claimant's injuries, treatment received, effects on lifestyle and whether any further treatment is appropriate.\n\nThe report is produced for the Court based on the information provided by the client and the instructing party.";
  
  const instructionStatementLines = doc.splitTextToSize(instructionText, pageWidth - (margin * 2) - 5);
  doc.text(instructionStatementLines, margin + 5, yPos);
  
  // Calculate new Y position based on the lines
  yPos += instructionStatementLines.length * 5 + 10;
  
  // Add Exceptional Circumstances section
  yPos = addSectionHeader("6. EXCEPTIONAL CIRCUMSTANCES", yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  // Get the value from the family history data
  const familyHistoryData = caseData.familyHistory || {};
  // Check both properties for backward compatibility
  const hasExceptionalCircumstances = 
    (familyHistoryData as any)?.hasExceptionalCircumstances === true || 
    (familyHistoryData as any)?.hasExceptionalSeverity === true;
  
  // Set the appropriate text based on the answer
  let exceptionalCircumstancesText = "";
  if (hasExceptionalCircumstances) {
    exceptionalCircumstancesText = "Claimant has claimed for exceptional physical and exceptional psychological circumstances. I would agree considering history symptoms and examination.";
  } else {
    exceptionalCircumstancesText = "Claimant has not claimed for exceptional physical or exceptional psychological circumstances. I would agree considering history symptoms and examination.";
  }
  
  const exceptionalLines = doc.splitTextToSize(exceptionalCircumstancesText, pageWidth - (margin * 2) - 5);
  doc.text(exceptionalLines, margin + 5, yPos);
  
  // Add footer
  addFooter(2, 3);
  
  // ======= PAGE 3: INJURY SUMMARY TABLE =======
  doc.addPage();
  
  yPos = margin;
  
  // Add page title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.text("SUMMARY OF INJURIES", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  
  // Section 1: Summary of Injuries
  yPos = addSectionHeader("1 - SUMMARY OF INJURIES", yPos);
  
  // Define column widths
  const colWidth1 = 35; // Injury Name
  const colWidth2 = 40; // Current Status
  const colWidth3 = 40; // Prognosis
  const colWidth4 = 40; // Treatment
  const colWidth5 = 30; // Classification
  
  const tableWidth = colWidth1 + colWidth2 + colWidth3 + colWidth4 + colWidth5;
  const tableX = margin;
  const rowHeight = 10;
  
  // Draw table header
  doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.rect(tableX, yPos, tableWidth, rowHeight, "F");
  
  // Add header text
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  
  let xPos = tableX + 3;
  doc.text("Injury Name", xPos, yPos + 6);
  xPos += colWidth1;
  doc.text("Current Status", xPos, yPos + 6);
  xPos += colWidth2;
  doc.text("Prognosis", xPos, yPos + 6);
  xPos += colWidth3;
  doc.text("Treatment", xPos, yPos + 6);
  xPos += colWidth4;
  doc.text("Classification", xPos, yPos + 6);
  
  yPos += rowHeight;
  
  // Reset text color for data rows
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  // Get injuries from physical injuries if available
  const tableInjuries = caseData.physicalInjuryDetails?.injuries || [];
  
  if (tableInjuries.length > 0) {
    // Add data rows
    tableInjuries.forEach((injury: any) => {
      // Draw row background (alternating colors for better readability)
      doc.setFillColor(245, 245, 245);
      doc.rect(tableX, yPos, tableWidth, rowHeight, "F");
      
      // Add cell borders
      doc.setDrawColor(200, 200, 200);
      doc.line(tableX, yPos, tableX + tableWidth, yPos); // Top line
      
      // Vertical lines
      let lineX = tableX;
      doc.line(lineX, yPos, lineX, yPos + rowHeight);
      lineX += colWidth1;
      doc.line(lineX, yPos, lineX, yPos + rowHeight);
      lineX += colWidth2;
      doc.line(lineX, yPos, lineX, yPos + rowHeight);
      lineX += colWidth3;
      doc.line(lineX, yPos, lineX, yPos + rowHeight);
      lineX += colWidth4;
      doc.line(lineX, yPos, lineX, yPos + rowHeight);
      
      // Right border
      doc.line(tableX + tableWidth, yPos, tableX + tableWidth, yPos + rowHeight);
      
      // Bottom border
      doc.line(tableX, yPos + rowHeight, tableX + tableWidth, yPos + rowHeight);
      
      // Add text to cells
      doc.setFontSize(8);
      
      // Calculate text positions and account for word wrapping
      xPos = tableX + 3;
      const injuryName = injury.type || "Unknown";
      doc.text(injuryName, xPos, yPos + 5);
      
      xPos += colWidth1;
      
      // Get current status based on currentSeverity field
      const currentSeverity = injury.currentSeverity || injury.severityGrade || "Mild";
      let currentStatus = "";
      if (currentSeverity.toLowerCase() === "resolved") {
        currentStatus = "Resolved";
      } else {
        currentStatus = `${currentSeverity} symptoms currently present`;
      }
      const statusLines = doc.splitTextToSize(currentStatus, colWidth2 - 6);
      doc.text(statusLines, xPos, yPos + 5);
      
      xPos += colWidth2;
      
      // Determine prognosis based on severity
      let prognosis = "";
      const needsSpecialistReferral = injury.needsSpecialistReferral === true;
      
      if (currentSeverity.toLowerCase() === "resolved") {
        prognosis = "Resolved";
      } else if (needsSpecialistReferral) {
        prognosis = "Per specialist report";
      } else if (currentSeverity.toLowerCase() === "mild") {
        prognosis = "3 months";
      } else if (currentSeverity.toLowerCase() === "moderate") {
        prognosis = "6 months";
      } else if (currentSeverity.toLowerCase() === "severe") {
        prognosis = "9 months";
      } else {
        prognosis = "To be determined";
      }
      doc.text(prognosis, xPos, yPos + 5);
      
      xPos += colWidth3;
      
      // Determine treatment
      const wantsPhysiotherapy = injury.wantsPhysiotherapy !== false;
      let treatment = "";
      
      if (currentSeverity.toLowerCase() === "resolved") {
        treatment = "None needed";
      } else if (wantsPhysiotherapy) {
        treatment = "Physiotherapy";
      } else {
        treatment = "Pain medication";
      }
      doc.text(treatment, xPos, yPos + 5);
      
      xPos += colWidth4;
      
      // Determine classification
      let classification = "Non-whiplash";
      if (injuryName.toLowerCase().includes("neck") || 
          injuryName.toLowerCase().includes("shoulder") || 
          injuryName.toLowerCase().includes("back")) {
        classification = "Whiplash";
      } else if (injuryName.toLowerCase().includes("headache")) {
        classification = "Whiplash Associated";
      } else if (injuryName.toLowerCase().includes("bruising")) {
        classification = "Non-whiplash";
      } else if (injuryName.toLowerCase().includes("anxiety") || 
                 injuryName.toLowerCase().includes("stress") || 
                 injuryName.toLowerCase().includes("depression") ||
                 injuryName.toLowerCase().includes("trauma")) {
        classification = "Psychological";
      }
      doc.text(classification, xPos, yPos + 5);
      
      // Move to next row
      yPos += rowHeight;
    });
  } else {
    // No injuries available - add empty row
    doc.setFillColor(245, 245, 245);
    doc.rect(tableX, yPos, tableWidth, rowHeight, "F");
    
    // Add cell borders
    doc.setDrawColor(200, 200, 200);
    doc.line(tableX, yPos, tableX + tableWidth, yPos); // Top line
    
    // Vertical lines
    let lineX = tableX;
    doc.line(lineX, yPos, lineX, yPos + rowHeight);
    lineX += colWidth1;
    doc.line(lineX, yPos, lineX, yPos + rowHeight);
    lineX += colWidth2;
    doc.line(lineX, yPos, lineX, yPos + rowHeight);
    lineX += colWidth3;
    doc.line(lineX, yPos, lineX, yPos + rowHeight);
    lineX += colWidth4;
    doc.line(lineX, yPos, lineX, yPos + rowHeight);
    
    // Right border
    doc.line(tableX + tableWidth, yPos, tableX + tableWidth, yPos + rowHeight);
    
    // Bottom border
    doc.line(tableX, yPos + rowHeight, tableX + tableWidth, yPos + rowHeight);
    
    // Add "No injuries recorded" text spanning all columns
    doc.setFontSize(9);
    doc.text("No injuries recorded", tableX + (tableWidth / 2), yPos + 5, { align: "center" });
    
    yPos += rowHeight;
  }
  
  // Add note below table
  yPos += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Note: The injuries listed above are based on the claimant's reported symptoms and clinical examination.", margin, yPos);
  
  // Add additional statement
  yPos += 15;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const additionalStatement = "There were no other injuries / symptoms which were stated in the instructions other than those listed in the medical report suffered by the claimant as told to me during the examination after direct questioning.";
  const additionalStatementLines = doc.splitTextToSize(additionalStatement, pageWidth - (margin * 2));
  doc.text(additionalStatementLines, margin, yPos);
  
  // Add Accident/Incident Details section
  yPos += 20;
  
  // Section 2: Accident/Incident Details
  yPos = addSectionHeader("2 - ACCIDENT/INCIDENT DETAILS", yPos);
  
  // Generate accident summary text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  let accidentDate = "the reported date";
  if (caseData.accidentDetails?.accidentDate) {
    try {
      accidentDate = formatDate(caseData.accidentDetails.accidentDate);
    } catch (e) {
      // Use default text if date formatting fails
    }
  }
  
  // Determine vehicle position
  const vehiclePosition = caseData.accidentDetails?.vehiclePosition || "driver";
  
  // Determine impact type
  const impactType = caseData.accidentDetails?.impactType || "rear-end";
  
  // Determine motion
  const wasMoving = caseData.accidentDetails?.wasMoving !== false;
  
  // Determine jolt direction based on impact type
  let joltDirection = "forward/backward";
  if (impactType === "rear-end") joltDirection = "forward";
  else if (impactType === "front-end") joltDirection = "backward";
  
  // Determine damage severity
  const damageSeverity = caseData.accidentDetails?.damageSeverity || "mild";
  
  // Determine safety equipment
  const wearingSeatbelt = caseData.accidentDetails?.wearingSeatbelt !== false;
  const hadHeadrest = caseData.accidentDetails?.hadHeadrest !== false;
  const airbagDeployed = caseData.accidentDetails?.airbagDeployed === true;
  
  // Construct accident summary
  const accidentSummary = `On ${accidentDate}, claimant was ${vehiclePosition} of the car when an other car hit claimant's car in the ${impactType} when it was ${wasMoving ? "moving" : "stationary"}, as a result of this claimant was jolted ${joltDirection}. Due to the accident claimant's vehicle was ${damageSeverity}ly damaged. Claimant was ${wearingSeatbelt ? "wearing" : "not wearing"} seat belt, head rest were ${hadHeadrest ? "fitted" : "not fitted"}, air bags ${airbagDeployed ? "did" : "did not"} deploy.`;
  
  const accidentLines = doc.splitTextToSize(accidentSummary, pageWidth - (margin * 2));
  doc.text(accidentLines, margin, yPos);
  
  // Add detailed Injuries/Symptoms section
  yPos += 20;
  
  // Section 3: Injuries / Symptoms
  yPos = addSectionHeader("3 - INJURIES / SYMPTOMS", yPos);
  
  // Add statement about injury sources
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("Note: The injuries listed below are based on the claimant's reported symptoms and clinical examination.", margin, yPos);
  
  yPos += 10;
  
  // Get injuries from physical injuries if available
  const detailedInjuries = caseData.physicalInjuryDetails?.injuries || [];
  
  if (detailedInjuries.length > 0) {
    // Process each injury with detailed information
    detailedInjuries.forEach((injury: any, index: number) => {
      // Skip if at bottom of page - ensure enough space for at least header
      if (yPos > pageHeight - 60) {
        // Add footer to current page
        addFooter(3, 3);
        
        // Add new page
        doc.addPage();
        yPos = margin;
        
        // Add continued section header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
        doc.text("3 - INJURIES / SYMPTOMS (CONTINUED)", margin, yPos);
        
        yPos += 10;
      }
      
      // Injury name as header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
      // Get the injury name for the header
      const injuryHeader = injury.type || `Injury ${index + 1}`;
      doc.text(injuryHeader + ":", margin, yPos);
      
      yPos += 6;
      
      // Format for each injury detail
      const addDetail = (label: string, value: string) => {
        // Skip if at bottom of page
        if (yPos > pageHeight - 40) {
          // Add footer to current page
          addFooter(3, 3);
          
          // Add new page
          doc.addPage();
          yPos = margin;
          
          // Add continued section header using the same helper function
          yPos = addSectionHeader("3 - INJURIES / SYMPTOMS (CONTINUED)", yPos);
        }
        
        // Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`${label}:`, margin + 5, yPos);
        
        // Value (with word wrapping)
        doc.setFont("helvetica", "normal");
        const valueLines = doc.splitTextToSize(value, pageWidth - margin * 2 - 65);
        doc.text(valueLines, margin + 65, yPos);
        
        // Increase y position based on number of lines
        yPos += Math.max(5, valueLines.length * 5);
      };
      
      // Extract injury information
      const injuryName = injury.type || "Unspecified injury";
      
      // Determine onset based on timing data or default
      const onset = injury.onsetTiming === "immediate" ? "Same day" : 
                    injury.onsetTiming === "delayed" ? "Next day" : "Not specified";
      
      // Determine injury severity (initial and current)
      const initialSeverity = injury.initialSeverity || "Moderate";
      const currentSeverity = injury.currentSeverity || injury.severityGrade || "Mild";
      
      // Classify injury based on type (following the rules provided)
      let classification = "Non-whiplash";
      if (injuryName.toLowerCase().includes("neck") || 
          injuryName.toLowerCase().includes("shoulder") || 
          injuryName.toLowerCase().includes("back")) {
        classification = "Whiplash";
      } else if (injuryName.toLowerCase().includes("headache")) {
        classification = "Whiplash Associated";
      } else if (injuryName.toLowerCase().includes("bruising")) {
        classification = "Non-whiplash";
      } else if (injuryName.toLowerCase().includes("anxiety") || 
                 injuryName.toLowerCase().includes("stress") || 
                 injuryName.toLowerCase().includes("depression") ||
                 injuryName.toLowerCase().includes("trauma")) {
        classification = "Psychological";
      }
      
      // Generate mechanism description based on classification and accident details
      let mechanism = "";
      if (classification === "Whiplash" || classification === "Whiplash Associated") {
        // Determine jolt direction based on impact type
        let joltDirection = "forward and backward";
        if (impactType === "rear-end") {
          joltDirection = "forward and backward";
        } else if (impactType === "front-end") {
          joltDirection = "backward and forward";
        } else if (impactType === "side") {
          joltDirection = "sideways";
        }
        
        mechanism = `Due to sudden jolt ${joltDirection} during the collision. It is classified as a ${classification} injury.`;
      } else if (classification === "Non-whiplash") {
        mechanism = "It was due to the direct trauma. It is classified as a non-whiplash injury and falls within subsection 1.3 of the Civil Liability Act 2018.";
      } else if (classification === "Psychological") {
        mechanism = "Due to the psychological impact of the accident and its aftermath. It is classified as a psychological injury related to the accident.";
      }
      
      // Generate examination findings based on current severity
      let examination = "";
      if (currentSeverity.toLowerCase() === "resolved") {
        examination = "No findings upon examination as the injury has resolved.";
      } else {
        let tenderness = "mild";
        if (currentSeverity.toLowerCase() === "moderate") {
          tenderness = "moderate";
        } else if (currentSeverity.toLowerCase() === "severe") {
          tenderness = "severe";
        }
        
        // Standard examination findings
        if (classification === "Whiplash" || classification === "Whiplash Associated") {
          examination = `Palpation: ${tenderness} tenderness\nRange of Motion: Flexion and extension limited due to pain\nNeurological Assessment: normal.`;
        } else if (classification === "Non-whiplash") {
          examination = `Inspection: ${tenderness} visible signs\nPalpation: ${tenderness} tenderness on palpation\nNeurological Assessment: normal.`;
        } else if (classification === "Psychological") {
          examination = "Based on patient interview and self-reported symptoms. No physical examination findings.";
        }
      }
      
      // Generate treatment recommendations based on current severity and preferences
      let treatmentRecommendations = "";
      const wantsPhysiotherapy = injury.wantsPhysiotherapy !== false;
      
      if (currentSeverity.toLowerCase() === "resolved") {
        treatmentRecommendations = "No further treatment needed as the injury has resolved.";
      } else if (wantsPhysiotherapy) {
        treatmentRecommendations = "Physiotherapy is recommended. Number of sessions to be advised by the referred expert.";
      } else {
        treatmentRecommendations = "Pain management with appropriate over-the-counter pain medications as the claimant does not want physiotherapy.";
      }
      
      // Generate prognosis based on current severity
      let prognosis = "";
      const needsSpecialistReferral = injury.needsSpecialistReferral === true;
      
      if (currentSeverity.toLowerCase() === "resolved") {
        prognosis = "Injury has resolved with no expected ongoing symptoms.";
      } else if (needsSpecialistReferral) {
        prognosis = "Prognosis to be provided by referred expert in an additional report.";
      } else if (currentSeverity.toLowerCase() === "mild") {
        prognosis = "Expected recovery within 3 months from the date of accident.";
      } else if (currentSeverity.toLowerCase() === "moderate") {
        prognosis = "Expected recovery within 6 months from the date of accident.";
      } else if (currentSeverity.toLowerCase() === "severe") {
        prognosis = "Expected recovery within 9 months from the date of accident.";
      } else {
        prognosis = "Prognosis uncertain at this time and will depend on response to treatment.";
      }
      
      // Determine if additional report is required
      const additionalReportRequired = needsSpecialistReferral ? "Yes" : "No";
      let referredExpert = "";
      
      if (needsSpecialistReferral) {
        if (classification === "Whiplash" || classification === "Whiplash Associated" || classification === "Non-whiplash") {
          referredExpert = "Orthopedic Specialist";
        } else if (classification === "Psychological") {
          referredExpert = "Clinical Psychologist";
        } else {
          referredExpert = "Relevant Specialist";
        }
      }
      
      // Add all the details
      addDetail("Injury Name", injuryName);
      addDetail("When did this injury start", onset);
      addDetail("Initial Severity", initialSeverity);
      addDetail("Current Severity", currentSeverity);
      addDetail("Classification", classification);
      addDetail("Mechanism", mechanism);
      addDetail("Examination", examination);
      addDetail("Treatment Recommendations", treatmentRecommendations);
      addDetail("Prognosis", prognosis);
      addDetail("Additional Report Required", additionalReportRequired + (referredExpert ? ` (${referredExpert})` : ""));
      
      // Add space between injuries
      yPos += 10;
    });
  } else {
    // No injuries message
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("No specific injuries or symptoms have been recorded.", margin + 5, yPos);
    
    yPos += 10;
  }
  
  // Add Section 4: Treatments
  // Check if we need a new page based on current y position
  if (yPos > pageHeight - 90) {
    // Add footer to current page
    addFooter(3, 3);
    
    // Add new page
    doc.addPage();
    yPos = margin;
  } else {
    yPos += 20;
  }
  
  // Section 4: Treatments
  yPos = addSectionHeader("4 - TREATMENTS", yPos);
  
  // Treatment details from the questionnaire
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  // Extract treatment information from the case data
  const treatmentDetails = caseData.treatments || {};
  
  // Function to add a treatment subsection
  const addTreatmentSubsection = (title: string, value: string | undefined | null, defaultText: string = "None reported") => {
    // Skip if at bottom of page
    if (yPos > pageHeight - 40) {
      // Add footer to current page
      addFooter(3, 4);
      
      // Add new page
      doc.addPage();
      yPos = margin;
      
      // Add continued section header using the same helper function
      yPos = addSectionHeader("4 - TREATMENTS (CONTINUED)", yPos);
    }
    
    // Subsection title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(title + ":", margin, yPos);
    
    yPos += 6;
    
    // Subsection content with word wrapping
    doc.setFont("helvetica", "normal");
    const textToUse = value || defaultText;
    const textLines = doc.splitTextToSize(textToUse, pageWidth - (margin * 2) - 10);
    doc.text(textLines, margin + 10, yPos);
    
    // Adjust y position based on text lines
    yPos += Math.max(8, textLines.length * 5);
  };
  
  // Only add a single comprehensive treatment summary paragraph
  let treatmentSummary = (treatmentDetails as any)?.treatmentSummary;
  
  // If no summary is provided, generate a default one based on presence of other treatment info
  if (!treatmentSummary) {
    const hasEmergencyTreatment = (treatmentDetails as any)?.emergencyTreatment;
    const hasGpVisits = (treatmentDetails as any)?.gpVisits;
    const hasHospitalTreatment = (treatmentDetails as any)?.hospitalTreatment;
    const hasPhysiotherapy = (treatmentDetails as any)?.physiotherapy;
    const hasOtherTreatments = (treatmentDetails as any)?.otherTreatments;
    const hasCurrentMedication = (treatmentDetails as any)?.currentMedication;
    
    treatmentSummary = "The claimant reports the following treatment history: ";
    
    if (hasEmergencyTreatment) {
      treatmentSummary += "Emergency treatment was received following the accident. ";
    } else {
      treatmentSummary += "No emergency treatment was required at the time of the accident. ";
    }
    
    if (hasGpVisits) {
      treatmentSummary += `GP visits: ${(treatmentDetails as any)?.gpVisits} visits. ${(treatmentDetails as any)?.gpTreatmentDetails || ''} `;
    } else {
      treatmentSummary += "No GP visits were required. ";
    }
    
    if (hasHospitalTreatment) {
      treatmentSummary += `Hospital treatment: ${(treatmentDetails as any)?.hospitalTreatment}. `;
    } else {
      treatmentSummary += "No hospital treatment was required. ";
    }
    
    if (hasPhysiotherapy) {
      treatmentSummary += `Physiotherapy: ${(treatmentDetails as any)?.physiotherapySessions || 'Unknown'} sessions. ${(treatmentDetails as any)?.physiotherapyDetails || ''} `;
    } else {
      treatmentSummary += "No physiotherapy was received. ";
    }
    
    if (hasOtherTreatments) {
      treatmentSummary += `Other treatments: ${(treatmentDetails as any)?.otherTreatments}. `;
    }
    
    if (hasCurrentMedication) {
      treatmentSummary += `Current medications: ${(treatmentDetails as any)?.currentMedication}.`;
    } else {
      treatmentSummary += "No current medications reported.";
    }
  }
  
  // Set font and text styling
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  // Format treatment summary text with word wrapping
  const summaryLines = doc.splitTextToSize(treatmentSummary, pageWidth - (margin * 2));
  doc.text(summaryLines, margin, yPos);
  
  // Adjust y position based on text lines
  yPos += Math.max(10, summaryLines.length * 5);
  
  // Add Section 5: Impact on Daily Life
  // Check if we need a new page based on current y position
  if (yPos > pageHeight - 90) {
    // Add footer to current page
    const currentPageBeforeSection5 = doc.getNumberOfPages();
    addFooter(currentPageBeforeSection5, currentPageBeforeSection5);
    
    // Add new page
    doc.addPage();
    yPos = margin;
  } else {
    yPos += 20;
  }
  
  // Section 5: Impact on Daily Life
  yPos = addSectionHeader("5 - IMPACT ON DAILY LIFE", yPos);
  
  // Impact details from the questionnaire
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  // Extract lifestyle impact information from the case data
  const lifestyleImpact = caseData.lifestyleImpact || {};
  
  // Function to add an impact subsection
  const addImpactSubsection = (title: string, value: string | undefined | null, defaultText: string = "No impact reported") => {
    // Skip if at bottom of page
    if (yPos > pageHeight - 40) {
      // Add footer to current page
      const currentPageInSection = doc.getNumberOfPages();
      addFooter(currentPageInSection, currentPageInSection);
      
      // Add new page
      doc.addPage();
      yPos = margin;
      
      // Add continued section header using the same helper function
      yPos = addSectionHeader("5 - IMPACT ON DAILY LIFE (CONTINUED)", yPos);
    }
    
    // Subsection title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(title + ":", margin, yPos);
    
    yPos += 6;
    
    // Subsection content with word wrapping
    doc.setFont("helvetica", "normal");
    const textToUse = value || defaultText;
    const textLines = doc.splitTextToSize(textToUse, pageWidth - (margin * 2) - 10);
    doc.text(textLines, margin + 10, yPos);
    
    // Adjust y position based on text lines
    yPos += Math.max(8, textLines.length * 5);
  };
  
  // Only show the overall impact summary
  const impactSummary = (lifestyleImpact as any)?.impactSummary || (lifestyleImpact as any)?.lifestyleSummary || "No impact summary provided";
  addImpactSubsection("Impact Summary", impactSummary, "No impact summary provided");
  
  // Add job market prospects statement
  yPos += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("PROSPECTS ON THE OPEN JOB MARKET:", margin, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Employment prospects in the open job market would be unaffected because of the injuries", margin, yPos);
  
  // Add Section 6: Past History of Accidents or Illness
  // Check if we need a new page based on current y position
  if (yPos > pageHeight - 90) {
    // Add footer to current page
    const currentPageBeforeSection6 = doc.getNumberOfPages();
    addFooter(currentPageBeforeSection6, currentPageBeforeSection6);
    
    // Add new page
    doc.addPage();
    yPos = margin;
  } else {
    yPos += 20;
  }
  
  // Section 6: Past History of Accidents or Illness
  yPos = addSectionHeader("6 - PAST HISTORY OF ACCIDENTS OR ILLNESS", yPos);
  
  // Past history details from the questionnaire
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  // Extract family history information from the case data
  const familyHistory = caseData.familyHistory || {};
  
  // Function to add a past history subsection
  const addHistorySubsection = (title: string, value: string | undefined | null, defaultText: string = "No history reported") => {
    // Skip if at bottom of page
    if (yPos > pageHeight - 40) {
      // Add footer to current page
      const currentPageInSection = doc.getNumberOfPages();
      addFooter(currentPageInSection, currentPageInSection);
      
      // Add new page
      doc.addPage();
      yPos = margin;
      
      // Add continued section header using the same helper function
      yPos = addSectionHeader("6 - PAST HISTORY OF ACCIDENTS OR ILLNESS (CONTINUED)", yPos);
    }
    
    // Subsection title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(title + ":", margin, yPos);
    
    yPos += 6;
    
    // Subsection content with word wrapping
    doc.setFont("helvetica", "normal");
    const textToUse = value || defaultText;
    const textLines = doc.splitTextToSize(textToUse, pageWidth - (margin * 2) - 10);
    doc.text(textLines, margin + 10, yPos);
    
    // Adjust y position based on text lines
    yPos += Math.max(8, textLines.length * 5);
  };
  
  // Only add a single summary paragraph
  const historySummary = (familyHistory as any)?.historySummary || "No significant past medical history reported by the claimant. The claimant denies any previous accidents, injuries, or pre-existing medical conditions relevant to the current claim. Overall general health was reported as good prior to the accident.";
  
  // Set font and text 
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  // Format summary text with word wrapping
  const historyLines = doc.splitTextToSize(historySummary, pageWidth - (margin * 2));
  doc.text(historyLines, margin, yPos);
  
  // Adjust y position based on text lines
  yPos += Math.max(10, historyLines.length * 5);
  
  // Add Section 7: Case Classification and Declaration
  // Check if we need a new page based on current y position
  if (yPos > pageHeight - 120) {
    // Add footer to current page
    const currentPageBeforeSection7 = doc.getNumberOfPages();
    addFooter(currentPageBeforeSection7, currentPageBeforeSection7);
    
    // Add new page
    doc.addPage();
    yPos = margin;
  } else {
    yPos += 20;
  }
  
  // Section title
  // Section 7: Case Classification and Declaration
  yPos = addSectionHeader("7 - CASE CLASSIFICATION AND DECLARATION", yPos);
  
  // Case Classification
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("Case Classification:", margin, yPos);
  
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Seatbelts: Was the claimant wearing a seat belt? Yes", margin + 10, yPos);
  
  yPos += 5;
  doc.text("Soft-tissue Injury Claim: Yes", margin + 10, yPos);
  
  yPos += 5;
  doc.text("Was the Claimant an occupant of a motor vehicle? Yes", margin + 10, yPos);
  
  yPos += 5;
  doc.text("Is the client's most significant injury a soft-tissue injury? Yes", margin + 10, yPos);
  
  yPos += 5;
  doc.text("Is this the first report in relation to the client's injuries from the index accident? Yes", margin + 10, yPos);
  
  yPos += 10;
  
  // Declaration
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Declaration:", margin, yPos);
  
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  const declarationText = "I was able to obtain a good history. Claimant's injuries and recovery period were entirely consistent with the account of the accident. The treatment provided for the claimant has been appropriate. The problems reported in home life are consistent and reasonable. In my opinion, the time taken off work by the claimant is reasonable. Claimant is currently fit working. Declaration: I have not provided treatment to the claimant. I am not associated with any person who has provided treatment. I have not recommended any treatment provider.";
  
  const declarationLines = doc.splitTextToSize(declarationText, pageWidth - (margin * 2));
  doc.text(declarationLines, margin, yPos);
  
  yPos += declarationLines.length * 5 + 10;
  
  doc.text("Agreement of Report: I confirm that I have verified with the claimant the facts as referred to in this report", margin, yPos);
  
  yPos += 15;
  
  // Examiner signature line
  doc.setDrawColor(0);
  doc.line(margin, yPos, margin + 200, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Dr. Awais Iqbal, MBBS, Direct Medical Expert", margin, yPos);
  
  // Add Section 8: Statement of Truth
  // Check if we need a new page based on current y position
  if (yPos > pageHeight - 80) {
    // Add footer to current page
    const currentPageBeforeSection8 = doc.getNumberOfPages();
    addFooter(currentPageBeforeSection8, currentPageBeforeSection8);
    
    // Add new page
    doc.addPage();
    yPos = margin;
  } else {
    yPos += 25;
  }
  
  // Section 8: Statement of Truth
  yPos = addSectionHeader("8 - STATEMENT OF TRUTH", yPos);
  
  // Statement of Truth text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  const truthStatementText = "Statement of Truth: I understand that my overriding duty is to the court, both in preparing reports and in giving oral evidence. I have complied and will continue to comply with that duty. I am aware of the requirements of Part 35 and practice direction 35, the protocol for instructing experts to give evidence in civil claims and the practice direction on pre-action conduct. I have set out in my report that I understand from those instructing me to be the questions in respect of which my opinion as an expert is required. I have done my best, in preparing this report, to be accurate and complete. I have mentioned all matters which I regard as relevant to the opinions I have expressed. I consider that all the matters on which I have expressed an opinion lie within my field of expertise. I have drawn to the attention of the court all matters, of which I am aware, which might adversely affect my opinion.";
  
  const truthStatementLines = doc.splitTextToSize(truthStatementText, pageWidth - (margin * 2));
  doc.text(truthStatementLines, margin, yPos);
  
  yPos += truthStatementLines.length * 5 + 15;
  
  // Signature for Statement of Truth
  doc.setDrawColor(0);
  doc.line(margin, yPos, margin + 200, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Dr. Awais Iqbal, MBBS, Direct Medical Expert", margin, yPos);

  // Add Section 9: Medical Expert's CV
  // Check if we need a new page based on current y position
  if (yPos > pageHeight - 120) {
    // Add footer to current page
    const currentPageBeforeSection9 = doc.getNumberOfPages();
    addFooter(currentPageBeforeSection9, currentPageBeforeSection9);
    
    // Add new page
    doc.addPage();
    yPos = margin;
  } else {
    yPos += 25;
  }
  
  // Section 9: Medical Expert's CV
  yPos = addSectionHeader("9 - MEDICAL EXPERT'S CURRICULUM VITAE", yPos);
  
  // CV content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  const cvText = "Dr. Awais Iqbal MBBS, Direct Medical Expert\n\nI fully appreciate the time pressures associated with civil litigation, the limitations of expertise, and the imperative for independent, balanced consideration when instructing solicitors. I am fully registered with the General Medical Council. My professional affiliation is with the British Medical Association. In addition, I am a member of the Medical Protection Society.\n\nMedical Expert's Curriculum Vitae:\n\nProfessional Registration Details:\nGMC: 6138189\nICO registration: ZA526555\nMedco Reg: DME 8094\nMember Society of occupational Medicine, MDDUS, BMA Member.\n\nQualification:\nMBBS, Direct Medical Expert\n\nExperience:\nWith 20 years of clinical experience in orthopedics, medicine, surgery, emergency medicine, general practice, and occupational medicine. I completed medical-legal reports on time for over 1000 clients in the last 3 years. My experience includes whiplash injuries from road traffic accidents, injuries due to occupational hazards, fitness to work assessments.";
  
  const cvLines = doc.splitTextToSize(cvText, pageWidth - (margin * 2));
  doc.text(cvLines, margin, yPos);
  
  yPos += cvLines.length * 5 + 15;
  
  // Signature for CV
  doc.setDrawColor(0);
  doc.line(margin, yPos, margin + 200, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Dr. Awais Iqbal, MBBS, Direct Medical Expert", margin, yPos);
  
  // Section 10: Signature with uploaded image
  yPos += 20;
  yPos = addSectionHeader("10 - SIGNATURE", yPos);
  
  // Add signature date
  const signatureDate = formatDate(caseData.expertDetails?.dateOfReport || new Date().toISOString().split('T')[0]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${signatureDate}`, margin, yPos + 5);
  
  // Add signature image - positioned on the left side
  try {
    // Add the signature image
    doc.addImage(signatureImage, 'JPEG', margin, yPos, 40, 20);
  } catch (e) {
    console.error('Error adding signature image:', e);
    // Fallback if image fails
    doc.setFont("helvetica", "italic");
    doc.text("Signature on file", margin, yPos + 10);
  }
  
  // Add expert name below signature - also aligned to the left
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(caseData.expertDetails?.examiner || "Dr. Awais Iqbal", margin, yPos + 30);
  doc.text(caseData.expertDetails?.credentials || "MBBS, Direct Medical Expert", margin, yPos + 36);
  
  // Add footer to final page and fix all page numbers
  const totalPages = doc.getNumberOfPages();
  
  // Now go through and update all page footers with correct total
  for (let i = 1; i <= totalPages; i++) {
    // Set page as active
    doc.setPage(i);
    
    // Clear old footer (draw white rectangle at bottom)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
    
    // Add correct footer
    const claimantName = caseData.claimantDetails?.fullName || "Claimant";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${totalPages} | ${claimantName} | ${caseData.caseNumber || "Medico-Legal Report"}`, 
      pageWidth / 2, 
      pageHeight - 10, 
      { align: "center" }
    );
  }
  
  // Return the PDF as data URL
  return doc.output('dataurlstring');
};