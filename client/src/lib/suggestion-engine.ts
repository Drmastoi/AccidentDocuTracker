import { Case, ClaimantDetails, AccidentDetails, PhysicalInjury, PsychologicalInjuries, Treatments, LifestyleImpact, FamilyHistory, ExpertDetails } from "@shared/schema";

export interface Suggestion {
  sectionId: string;
  field: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

// Severity levels:
// - info: Minor suggestions for improvements
// - warning: Important information might be missing
// - critical: Essential information is missing

/**
 * Analyzes a case and returns suggestions for improving documentation completeness
 */
export function analyzeCaseCompleteness(caseData: Case): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Only analyze if the case exists
  if (!caseData) return suggestions;
  
  // Check claimant details
  if (caseData.claimantDetails) {
    suggestions.push(...analyzeClaimantDetails(caseData.claimantDetails as ClaimantDetails));
  }
  
  // Check accident details
  if (caseData.accidentDetails) {
    suggestions.push(...analyzeAccidentDetails(caseData.accidentDetails as AccidentDetails));
  }
  
  // Check physical injury details
  if (caseData.physicalInjuryDetails) {
    suggestions.push(...analyzePhysicalInjury(caseData.physicalInjuryDetails as PhysicalInjury));
  }
  
  // Check psychological injuries
  if (caseData.psychologicalInjuries) {
    suggestions.push(...analyzePsychologicalInjuries(caseData.psychologicalInjuries as PsychologicalInjuries));
  }
  
  // Check treatments
  if (caseData.treatments) {
    suggestions.push(...analyzeTreatments(caseData.treatments as Treatments));
  }
  
  // Check lifestyle impact
  if (caseData.lifestyleImpact) {
    suggestions.push(...analyzeLifestyleImpact(caseData.lifestyleImpact as LifestyleImpact));
  }
  
  // Check family history
  if (caseData.familyHistory) {
    suggestions.push(...analyzeFamilyHistory(caseData.familyHistory as FamilyHistory));
  }
  
  // Check expert details
  if (caseData.expertDetails) {
    suggestions.push(...analyzeExpertDetails(caseData.expertDetails as ExpertDetails));
  }
  
  // Check for cross-section consistency
  suggestions.push(...analyzeConsistency(caseData));
  
  return suggestions;
}

// Specific section analyzers
function analyzeClaimantDetails(details: ClaimantDetails): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (!details.fullName || details.fullName.length < 3) {
    suggestions.push({
      sectionId: 'claimant',
      field: 'fullName',
      message: 'Claimant name is missing or too short. Full legal name is required for MedCo reports.',
      severity: 'critical'
    });
  }
  
  if (!details.dateOfBirth) {
    suggestions.push({
      sectionId: 'claimant',
      field: 'dateOfBirth',
      message: 'Date of birth is required for accurate medical assessment.',
      severity: 'critical'
    });
  }
  
  if (!details.address || details.address.length < 5) {
    suggestions.push({
      sectionId: 'claimant',
      field: 'address',
      message: 'Address is missing or incomplete. Full address is required for MedCo reports.',
      severity: 'warning'
    });
  }
  
  if (!details.occupation) {
    suggestions.push({
      sectionId: 'claimant',
      field: 'occupation',
      message: 'Occupation should be included to assess impact on work and daily activities.',
      severity: 'warning'
    });
  }
  
  return suggestions;
}

function analyzeAccidentDetails(details: AccidentDetails): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (!details.dateOfAccident) {
    suggestions.push({
      sectionId: 'accident',
      field: 'dateOfAccident',
      message: 'Date of accident is required for timeline assessment.',
      severity: 'critical'
    });
  }
  
  if (!details.descriptionOfAccident || details.descriptionOfAccident.length < 20) {
    suggestions.push({
      sectionId: 'accident',
      field: 'descriptionOfAccident',
      message: 'Accident description is missing or too brief. Detailed description helps establish causation.',
      severity: 'critical'
    });
  }
  
  if (!details.locationOfAccident) {
    suggestions.push({
      sectionId: 'accident',
      field: 'locationOfAccident',
      message: 'Location of accident should be specified.',
      severity: 'warning'
    });
  }
  
  return suggestions;
}

function analyzePhysicalInjury(details: PhysicalInjury): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Check if there are any complaints
  if (!(details.neckComplaint || 
       details.backComplaint || 
       details.shoulderComplaint || 
       details.kneeComplaint || 
       details.ankleComplaint || 
       details.wristComplaint || 
       details.hipComplaint || 
       details.psychologicalComplaint || 
       details.otherComplaint)) {
    suggestions.push({
      sectionId: 'physical',
      field: 'complaints',
      message: 'No physical injuries or complaints have been recorded. At least one injury area should be documented.',
      severity: 'critical'
    });
  }
  
  // If there are complaints, but no details provided
  if ((details.neckComplaint && !details.neckDetails) || 
      (details.backComplaint && !details.backDetails) || 
      (details.shoulderComplaint && !details.shoulderDetails) || 
      (details.kneeComplaint && !details.kneeDetails) || 
      (details.ankleComplaint && !details.ankleDetails) || 
      (details.wristComplaint && !details.wristDetails) || 
      (details.hipComplaint && !details.hipDetails) || 
      (details.psychologicalComplaint && !details.psychologicalDetails) || 
      (details.otherComplaint && !details.otherDetails)) {
    suggestions.push({
      sectionId: 'physical',
      field: 'injuryDetails',
      message: 'Some injuries are marked but missing detailed descriptions. Provide specific details for each complaint.',
      severity: 'warning'
    });
  }
  
  if (!details.gpDetails) {
    suggestions.push({
      sectionId: 'physical',
      field: 'gpDetails',
      message: 'GP details are missing. This information is important for medical continuity.',
      severity: 'warning'
    });
  }
  
  if (!details.previousMedicalHistory) {
    suggestions.push({
      sectionId: 'physical',
      field: 'previousMedicalHistory',
      message: 'Previous medical history is not documented. This is essential for a comprehensive assessment.',
      severity: 'warning'
    });
  }
  
  return suggestions;
}

function analyzePsychologicalInjuries(details: PsychologicalInjuries): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Check if psychological symptoms are reported but details are missing
  if (details.hasAnxiety && !details.anxietyDetails) {
    suggestions.push({
      sectionId: 'psychological',
      field: 'anxietyDetails',
      message: 'Anxiety is reported but details are missing. Provide specific symptoms and severity.',
      severity: 'warning'
    });
  }
  
  if (details.hasDepression && !details.depressionDetails) {
    suggestions.push({
      sectionId: 'psychological',
      field: 'depressionDetails',
      message: 'Depression is reported but details are missing. Provide specific symptoms and severity.',
      severity: 'warning'
    });
  }
  
  if (details.hasPTSD && !details.ptsdDetails) {
    suggestions.push({
      sectionId: 'psychological',
      field: 'ptsdDetails',
      message: 'PTSD is reported but details are missing. Provide specific symptoms and severity.',
      severity: 'warning'
    });
  }
  
  if (details.hasTravelAnxiety && !details.travelAnxietyDetails) {
    suggestions.push({
      sectionId: 'psychological',
      field: 'travelAnxietyDetails',
      message: 'Travel anxiety is reported but details are missing. Provide specific symptoms and severity.',
      severity: 'warning'
    });
  }
  
  if (details.hasOtherPsychological && !details.otherPsychologicalDetails) {
    suggestions.push({
      sectionId: 'psychological',
      field: 'otherPsychologicalDetails',
      message: 'Other psychological issues are reported but details are missing.',
      severity: 'warning'
    });
  }
  
  // If there's a psychological issue without treatment info
  if ((details.hasAnxiety || details.hasDepression || details.hasPTSD || 
       details.hasTravelAnxiety || details.hasOtherPsychological) && 
      !details.psychologicalTreatment) {
    suggestions.push({
      sectionId: 'psychological',
      field: 'psychologicalTreatment',
      message: 'Psychological issues are reported but treatment information is missing. Include any treatments received.',
      severity: 'info'
    });
  }
  
  return suggestions;
}

function analyzeTreatments(details: Treatments): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Check if treatment details are missing
  if (details.receivedTreatmentAtScene === true && 
      !(details.sceneFirstAid || details.sceneNeckCollar || details.sceneAmbulanceArrived || details.scenePoliceArrived)) {
    suggestions.push({
      sectionId: 'treatments',
      field: 'sceneDetails',
      message: 'Treatment at scene is indicated but specific details are missing.',
      severity: 'info'
    });
  }
  
  // Hospital attendance but details missing
  if (details.hospitalAttendance === true && 
      !(details.hospitalXRay || details.hospitalCTScan || details.hospitalMRIScan || 
        details.hospitalUltrasoundScan || details.hospitalMedication)) {
    suggestions.push({
      sectionId: 'treatments',
      field: 'hospitalDetails',
      message: 'Hospital attendance is indicated but details of examinations or treatments are missing.',
      severity: 'warning'
    });
  }
  
  // GP consultation but treatment details missing
  if (details.gpConsultation === true && 
      !(details.gpMedication || details.gpPhysiotherapy || details.gpReferredSpecialist)) {
    suggestions.push({
      sectionId: 'treatments',
      field: 'gpTreatmentDetails',
      message: 'GP consultation is indicated but treatment details are missing.',
      severity: 'info'
    });
  }
  
  if (!details.treatmentSummary) {
    suggestions.push({
      sectionId: 'treatments',
      field: 'treatmentSummary',
      message: 'Treatment summary is missing. A comprehensive overview of all treatments is valuable for the report.',
      severity: 'info'
    });
  }
  
  return suggestions;
}

function analyzeLifestyleImpact(details: LifestyleImpact): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Work impact details
  if (details.hasWorkImpact && !details.workImpactDetails) {
    suggestions.push({
      sectionId: 'lifestyle',
      field: 'workImpactDetails',
      message: 'Work impact is indicated but details are missing. Specific information helps establish claim validity.',
      severity: 'warning'
    });
  }
  
  // Days off work
  if (details.hasWorkImpact && !details.daysOffWork) {
    suggestions.push({
      sectionId: 'lifestyle',
      field: 'daysOffWork',
      message: 'Work impact is indicated but days off work are not specified. This is important for compensation assessment.',
      severity: 'warning'
    });
  }
  
  // Domestic impact
  if (details.hasDomesticImpact && !details.domesticImpactDetails) {
    suggestions.push({
      sectionId: 'lifestyle',
      field: 'domesticImpactDetails',
      message: 'Domestic impact is indicated but details are missing. Specifics help assess daily living challenges.',
      severity: 'info'
    });
  }
  
  // Sport/leisure impact
  if (details.hasSportLeisureImpact && !details.sportLeisureImpactDetails) {
    suggestions.push({
      sectionId: 'lifestyle',
      field: 'sportLeisureImpactDetails',
      message: 'Sport/leisure impact is indicated but details are missing. Specify activities affected.',
      severity: 'info'
    });
  }
  
  return suggestions;
}

function analyzeFamilyHistory(details: FamilyHistory): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Previous accidents with missing details
  if (details.hasPreviousAccidents && !details.previousAccidentsDetails) {
    suggestions.push({
      sectionId: 'family',
      field: 'previousAccidentsDetails',
      message: 'Previous accidents are indicated but details are missing. This is important for causation assessment.',
      severity: 'warning'
    });
  }
  
  // Previous claims with missing details
  if (details.hasPreviousClaims && !details.previousClaimsDetails) {
    suggestions.push({
      sectionId: 'family',
      field: 'previousClaimsDetails',
      message: 'Previous claims are indicated but details are missing. This information is required for proper assessment.',
      severity: 'warning'
    });
  }
  
  // Previous illness with missing details
  if (details.hasPreviousIllness && !details.previousIllnessDetails) {
    suggestions.push({
      sectionId: 'family',
      field: 'previousIllnessDetails',
      message: 'Previous illness is indicated but details are missing. This can be important for differential diagnosis.',
      severity: 'warning'
    });
  }
  
  return suggestions;
}

function analyzeExpertDetails(details: ExpertDetails): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (!details.examiner || details.examiner.length < 3) {
    suggestions.push({
      sectionId: 'expert',
      field: 'examiner',
      message: 'Medical examiner name is missing or incomplete. This is required for a valid MedCo report.',
      severity: 'critical'
    });
  }
  
  if (!details.credentials) {
    suggestions.push({
      sectionId: 'expert',
      field: 'credentials',
      message: 'Medical examiner credentials are missing. This is required to establish expertise.',
      severity: 'warning'
    });
  }
  
  if (!details.dateOfExamination) {
    suggestions.push({
      sectionId: 'expert',
      field: 'dateOfExamination',
      message: 'Date of examination is missing. This is a critical element of the medical report.',
      severity: 'critical'
    });
  }
  
  if (!details.placeOfExamination) {
    suggestions.push({
      sectionId: 'expert',
      field: 'placeOfExamination',
      message: 'Place of examination is missing. This should be included in the report.',
      severity: 'warning'
    });
  }
  
  if (!details.timeSpentWithClaimant) {
    suggestions.push({
      sectionId: 'expert',
      field: 'timeSpentWithClaimant',
      message: 'Time spent with claimant is missing. This is important for demonstrating thorough assessment.',
      severity: 'info'
    });
  }
  
  return suggestions;
}

// Cross-section consistency analysis
function analyzeConsistency(caseData: Case): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Check if accident date and examination date are consistent
  if (caseData.accidentDetails && caseData.expertDetails) {
    const accidentDetails = caseData.accidentDetails as AccidentDetails;
    const expertDetails = caseData.expertDetails as ExpertDetails;
    
    if (accidentDetails.dateOfAccident && expertDetails.dateOfExamination) {
      const accidentDate = new Date(accidentDetails.dateOfAccident);
      const examinationDate = new Date(expertDetails.dateOfExamination);
      
      if (accidentDate > examinationDate) {
        suggestions.push({
          sectionId: 'expert',
          field: 'dateOfExamination',
          message: 'Examination date is before the accident date. Please verify these dates.',
          severity: 'critical'
        });
      }
    }
  }
  
  // Check for consistency between physical and psychological complaints
  if (caseData.physicalInjuryDetails && caseData.psychologicalInjuries) {
    const physicalInjury = caseData.physicalInjuryDetails as PhysicalInjury;
    const psychologicalInjuries = caseData.psychologicalInjuries as PsychologicalInjuries;
    
    if (physicalInjury.psychologicalComplaint && 
        !(psychologicalInjuries.hasAnxiety || 
          psychologicalInjuries.hasDepression || 
          psychologicalInjuries.hasPTSD || 
          psychologicalInjuries.hasTravelAnxiety || 
          psychologicalInjuries.hasOtherPsychological)) {
      suggestions.push({
        sectionId: 'psychological',
        field: 'general',
        message: 'Psychological complaint mentioned in physical injuries but no specific psychological injuries selected.',
        severity: 'warning'
      });
    }
  }
  
  // Check for missing treatment information when injuries are reported
  if (caseData.physicalInjuryDetails && caseData.treatments) {
    const physicalInjury = caseData.physicalInjuryDetails as PhysicalInjury;
    const treatments = caseData.treatments as Treatments;
    
    const hasInjuries = physicalInjury.neckComplaint || 
                        physicalInjury.backComplaint || 
                        physicalInjury.shoulderComplaint || 
                        physicalInjury.kneeComplaint || 
                        physicalInjury.ankleComplaint || 
                        physicalInjury.wristComplaint || 
                        physicalInjury.hipComplaint || 
                        physicalInjury.otherComplaint;
    
    const hasTreatments = treatments.receivedTreatmentAtScene || 
                          treatments.hospitalAttendance || 
                          treatments.gpConsultation || 
                          treatments.physiotherapy || 
                          treatments.osteopathy || 
                          treatments.chiropractor || 
                          treatments.painManagement || 
                          treatments.otherTreatment;
    
    if (hasInjuries && !hasTreatments) {
      suggestions.push({
        sectionId: 'treatments',
        field: 'general',
        message: 'Physical injuries are reported but no treatments are documented. Review if treatment section is complete.',
        severity: 'warning'
      });
    }
  }
  
  return suggestions;
}