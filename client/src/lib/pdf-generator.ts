import { jsPDF } from "jspdf";
import { Case } from "@shared/schema";
import { sections } from "./sections";

// Function to format date from ISO string to MM/DD/YYYY
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString();
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

// Generate PDF from case data
export const generatePDF = (caseData: Case): string => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set font
  doc.setFont("helvetica");
  
  // Add header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("MEDICAL-LEGAL REPORT", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("Road Traffic Accident Case Assessment", 105, 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Case Number: ${caseData.caseNumber}`, 105, 36, { align: "center" });
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 105, 42, { align: "center" });
  
  // Add line
  doc.setLineWidth(0.5);
  doc.line(20, 48, 190, 48);
  
  let yPosition = 55;
  
  // 1. Claimant Details
  if (caseData.claimantDetails) {
    doc.setFontSize(12);
    doc.setTextColor(0, 124, 123); // Primary teal color
    doc.text("1. CLAIMANT DETAILS", 20, yPosition);
    yPosition += 8;
    
    const claimant = caseData.claimantDetails;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Name: ${claimant.fullName || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Date of Birth: ${formatDate(claimant.dateOfBirth)} (${calculateAge(claimant.dateOfBirth)} years)`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Address: ${claimant.address || ""} ${claimant.city || ""}, ${claimant.state || ""} ${claimant.zipCode || ""}`.trim(), 20, yPosition);
    yPosition += 6;
    
    doc.text(`Phone: ${claimant.phone || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Email: ${claimant.email || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Occupation: ${claimant.occupation || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Employer: ${claimant.employer || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Insurance: ${claimant.insurance || "N/A"} (Policy #: ${claimant.policyNumber || "N/A"})`, 20, yPosition);
    yPosition += 10;
  }
  
  // 2. Accident Details
  if (caseData.accidentDetails) {
    doc.setFontSize(12);
    doc.setTextColor(0, 124, 123); // Primary teal color
    doc.text("2. ACCIDENT DETAILS", 20, yPosition);
    yPosition += 8;
    
    const accident = caseData.accidentDetails;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Date and Time: ${formatDate(accident.accidentDate)} ${accident.accidentTime || ""}`.trim(), 20, yPosition);
    yPosition += 6;
    
    doc.text(`Location: ${accident.accidentLocation || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Weather Conditions: ${accident.weatherConditions || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Type of Accident: ${accident.accidentType || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    // Description with word wrap
    if (accident.accidentDescription) {
      doc.text("Description:", 20, yPosition);
      yPosition += 5;
      
      const splitText = doc.splitTextToSize(accident.accidentDescription, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 5 + 5;
    }
    
    // Police report information
    doc.text(`Police Report Filed: ${accident.policeReportFiled ? "Yes" : "No"}`, 20, yPosition);
    yPosition += 6;
    
    if (accident.policeReportFiled) {
      doc.text(`Report Number: ${accident.reportNumber || "N/A"}`, 20, yPosition);
      yPosition += 6;
      
      doc.text(`Reporting Officer: ${accident.reportingOfficer || "N/A"}`, 20, yPosition);
      yPosition += 6;
    }
    
    // Witness information
    if (accident.witnesses && accident.witnesses.length > 0) {
      doc.text("Witnesses:", 20, yPosition);
      yPosition += 6;
      
      accident.witnesses.forEach((witness, index) => {
        doc.text(`Witness #${index + 1}: ${witness.name || "N/A"}`, 25, yPosition);
        yPosition += 5;
        
        if (witness.statement) {
          const splitStatement = doc.splitTextToSize(`Statement: ${witness.statement}`, 165);
          doc.text(splitStatement, 30, yPosition);
          yPosition += splitStatement.length * 5 + 2;
        }
      });
    }
    
    yPosition += 4;
  }
  
  // Check if we need a new page before continuing
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  // 3. Physical Injury Details
  if (caseData.physicalInjuryDetails) {
    doc.setFontSize(12);
    doc.setTextColor(0, 124, 123); // Primary teal color
    doc.text("3. PHYSICAL INJURY DETAILS", 20, yPosition);
    yPosition += 8;
    
    const physical = caseData.physicalInjuryDetails;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Initial Complaints
    if (physical.initialComplaints) {
      doc.text("Initial Complaints:", 20, yPosition);
      yPosition += 5;
      
      const splitComplaints = doc.splitTextToSize(physical.initialComplaints, 170);
      doc.text(splitComplaints, 20, yPosition);
      yPosition += splitComplaints.length * 5 + 5;
    }
    
    // Pain Scale
    if (physical.painScale !== undefined) {
      doc.text(`Pain Scale (0-10): ${physical.painScale}`, 20, yPosition);
      yPosition += 6;
    }
    
    // Injury Locations
    if (physical.injuryLocations && physical.injuryLocations.length > 0) {
      doc.text(`Injury Locations: ${physical.injuryLocations.join(", ")}`, 20, yPosition);
      yPosition += 6;
    }
    
    // Symptoms
    if (physical.symptoms && physical.symptoms.length > 0) {
      doc.text(`Reported Symptoms: ${physical.symptoms.join(", ")}`, 20, yPosition);
      yPosition += 6;
    }
    
    // Diagnoses
    if (physical.diagnoses && physical.diagnoses.length > 0) {
      doc.text("Diagnoses:", 20, yPosition);
      yPosition += 6;
      
      physical.diagnoses.forEach((diagnosis, index) => {
        doc.text(`${index + 1}. ${diagnosis.diagnosis || "N/A"} (Date: ${formatDate(diagnosis.diagnosisDate)})`, 25, yPosition);
        yPosition += 5;
        
        if (diagnosis.diagnosingPhysician) {
          doc.text(`   Physician: ${diagnosis.diagnosingPhysician}`, 25, yPosition);
          yPosition += 5;
        }
      });
      
      yPosition += 2;
    }
    
    // Additional Notes
    if (physical.additionalNotes) {
      doc.text("Additional Notes:", 20, yPosition);
      yPosition += 5;
      
      const splitNotes = doc.splitTextToSize(physical.additionalNotes, 170);
      doc.text(splitNotes, 20, yPosition);
      yPosition += splitNotes.length * 5 + 5;
    }
    
    yPosition += 4;
  }
  
  // Continue with other sections...
  // (Add similar blocks for remaining sections)
  
  // Check if we need a new page for expert details
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Finally, add Expert Details and Signature
  if (caseData.expertDetails) {
    doc.setFontSize(12);
    doc.setTextColor(0, 124, 123);
    doc.text("MEDICAL EXPERT DETAILS", 20, yPosition);
    yPosition += 8;
    
    const expert = caseData.expertDetails;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Examiner: ${expert.examiner || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Credentials: ${expert.credentials || "N/A"}`, 20, yPosition);
    yPosition += 6;
    
    if (expert.specialty) {
      doc.text(`Specialty: ${expert.specialty}`, 20, yPosition);
      yPosition += 6;
    }
    
    if (expert.licensureState && expert.licenseNumber) {
      doc.text(`License: ${expert.licenseNumber} (${expert.licensureState})`, 20, yPosition);
      yPosition += 6;
    }
    
    if (expert.experienceYears) {
      doc.text(`Years of Experience: ${expert.experienceYears}`, 20, yPosition);
      yPosition += 6;
    }
    
    // Signature area
    yPosition += 10;
    doc.text("Signature: ________________________", 20, yPosition);
    yPosition += 6;
    
    doc.text(`Date: ${formatDate(expert.signatureDate) || new Date().toLocaleDateString()}`, 20, yPosition);
  }
  
  // Generate data URL for the PDF
  return doc.output('datauristring');
};

// Generate a preview of the PDF from case data
export const generatePDFPreview = (caseData: Case): string => {
  // In a real application, we would render this as an HTML preview
  // This is a simplified version that would normally be more complex
  return `
    <div>
      <h1>PDF Preview would go here</h1>
      <p>This is a placeholder for the PDF preview</p>
    </div>
  `;
};
