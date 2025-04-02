import { jsPDF } from "jspdf";
import { Case } from "@shared/schema";

export const generateCustomMedcoPDF = (caseData: Case): string => {
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
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${pageNum} of ${totalPages} | ${caseData.caseNumber || "Medico-Legal Report"}`, 
      pageWidth / 2, 
      pageHeight - 10, 
      { align: "center" }
    );
  };
  
  // ======= PAGE 1: COVER PAGE =======
  
  let yPos = 60; // Starting Y position

  // Set teal color for title elements
  doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
  
  // Top header - Report type
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MEDICO-LEGAL REPORT", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 30;
  
  // Claimant name in large font
  doc.setFontSize(24);
  doc.text(caseData.claimantDetails?.fullName || "CLAIMANT NAME", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 20;
  
  // MedCo reference 
  doc.setFontSize(14);
  doc.text("MedCo Reference:", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(18);
  doc.text(caseData.claimantDetails?.medcoRefNumber || "[REFERENCE NUMBER]", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 40;
  
  // Medical expert details
  doc.setFontSize(14);
  doc.text("Medical Expert:", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(20);
  doc.text(caseData.expertDetails?.examiner || "Dr. Awais Iqbal", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text(caseData.expertDetails?.credentials || "MBBS, MRCGP", pageWidth / 2, yPos, { align: "center" });
  
  // Add date at bottom
  yPos = pageHeight - 40;
  doc.setFontSize(12);
  doc.text("Report Date:", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 8;
  doc.text(formatDate(caseData.claimantDetails?.dateOfReport || new Date().toISOString()), pageWidth / 2, yPos, { align: "center" });
  
  // Add footer
  addFooter(1, 2);
  
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
      const ageAtAccident = accidentDate.getFullYear() - dob.getFullYear();
      // Adjust age if birthday hasn't occurred yet in the accident year
      const m = accidentDate.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && accidentDate.getDate() < dob.getDate())) {
        age = (ageAtAccident - 1).toString();
      } else {
        age = ageAtAccident.toString();
      }
    } catch (e) {
      age = "Error calculating";
    }
  }
  
  yPos = addField("1.5 Age (At the time of the Incident):", age, margin, yPos);
  yPos = addField("1.6 Date of Accident:", formatDate(caseData.accidentDetails?.accidentDate), margin, yPos);
  yPos = addField("1.7 Identification:", caseData.claimantDetails?.identificationProvided || "Not specified", margin, yPos);
  yPos = addField("1.8 Accompanied by:", caseData.claimantDetails?.accompaniedBy || "None", margin, yPos);
  yPos = addField("1.9 Interpreter:", caseData.claimantDetails?.helpWithCommunication ? "Yes" : "No", margin, yPos);
  
  yPos += 5;
  
  // Section 2: Expert Details
  yPos = addSectionHeader("2. EXPERT DETAILS", yPos);
  
  yPos = addField("2.1 Medical Expert Name:", caseData.expertDetails?.examiner || "Dr. Awais Iqbal", margin, yPos);
  yPos = addField("2.2 Regulatory:", caseData.expertDetails?.licenseNumber || "GMC 6138189", margin, yPos);
  yPos = addField("2.3 Medco Registration:", caseData.expertDetails?.licensureState || "8094", margin, yPos);
  
  yPos += 5;
  
  // Section 3: Instruction Details
  yPos = addSectionHeader("3. INSTRUCTION DETAILS", yPos);
  
  yPos = addField("3.1 Agency Name:", caseData.claimantDetails?.instructingParty || "Not provided", margin, yPos);
  yPos = addField("3.2 Solicitor Name:", caseData.claimantDetails?.solicitorName || "Not provided", margin, yPos);
  yPos = addField("3.3 Medco Reference:", caseData.claimantDetails?.medcoRefNumber || "Not provided", margin, yPos);
  yPos = addField("3.4 Review of Records:", "No medical records were provided for review", margin, yPos);
  
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
  
  const statementText = "This report is entirely independent and is prepared for the injuries sustained in the accident. The instructing party has requested an examination to be conducted with a report to include the nature and extent of the claimant's injuries, treatment received, effects on lifestyle and whether any further treatment is appropriate.\n\nThe report is produced for the Court based on the information provided by the client and the instructing party.";
  
  const statementLines = doc.splitTextToSize(statementText, pageWidth - (margin * 2) - 5);
  doc.text(statementLines, margin + 5, yPos);
  
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
  
  // Add table title
  doc.setFontSize(11);
  doc.text("1 - SUMMARY OF INJURIES", margin, yPos);
  
  yPos += 8;
  
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
  const injuries = caseData.physicalInjuryDetails?.injuries || [];
  
  if (injuries.length > 0) {
    // Add data rows
    injuries.forEach((injury: any) => {
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
      const currentStatus = injury.currentCondition || "Not provided";
      const statusLines = doc.splitTextToSize(currentStatus, colWidth2 - 6);
      doc.text(statusLines, xPos, yPos + 5);
      
      xPos += colWidth2;
      const prognosis = injury.expectedRecovery || "Unknown";
      doc.text(prognosis, xPos, yPos + 5);
      
      xPos += colWidth3;
      const treatment = "As advised";
      doc.text(treatment, xPos, yPos + 5);
      
      xPos += colWidth4;
      const classification = injury.severityGrade || "Moderate";
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
  
  // Add footer to page 3
  addFooter(3, 3);
  
  // Return the PDF as data URL
  return doc.output('dataurlstring');
};