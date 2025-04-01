import { generatePDF } from './client/src/lib/pdf-generator';

// Sample case data for generating PDF
const sampleCaseData = {
  id: 1,
  userId: 1,
  caseNumber: 'MED-2025-001',
  title: 'Sample Medical Report',
  status: 'Active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  claimantDetails: {
    fullName: 'John Doe',
    dateOfBirth: '1980-05-15',
    address: '123 Main Street, Anytown',
    postCode: 'AB12 3CD',
    phoneNumber: '07012345678',
    email: 'john.doe@example.com',
    accidentDate: '2024-02-10',
    dateOfReport: '2025-03-25',
    dateOfExamination: '2025-03-15',
    placeOfExamination: 'Medical Center, London',
    accompaniedBy: 'Spouse',
    timeSpent: 60,
    communicationHelp: false
  },
  
  accidentDetails: {
    accidentDate: '2024-02-10',
    accidentTime: '14:30',
    accidentLocation: 'Junction of High Street and Park Road, London',
    vehicleType: 'Car',
    claimantPosition: 'Driver',
    impactLocation: 'Rear',
    wearingSeatbelt: true,
    headRestraint: true,
    vehicleDriveable: false,
    accidentDescription: 'The claimant was stationary at traffic lights when another vehicle collided with the rear of their car. The impact was described as moderate, pushing the vehicle forward approximately one meter. The airbags did not deploy, but the claimant reports being jolted forward and then backward during the impact.'
  },
  
  physicalInjuryDetails: {
    injuries: [
      {
        type: 'Neck Pain (Whiplash)',
        onset: 'Immediate',
        initialSeverity: 'Moderate',
        currentSeverity: 'Mild',
        resolutionDays: null,
        classification: 'WAD II',
        details: 'Pain and stiffness in the neck, worse on movement'
      },
      {
        type: 'Lower Back Pain',
        onset: '24 hours',
        initialSeverity: 'Moderate',
        currentSeverity: 'Mild',
        resolutionDays: null,
        classification: 'Soft Tissue',
        details: 'Dull aching pain across lower back, worse when sitting for long periods'
      },
      {
        type: 'Shoulder Pain (Right)',
        onset: 'Immediate',
        initialSeverity: 'Mild',
        currentSeverity: 'Resolved',
        resolutionDays: 45,
        classification: 'Soft Tissue',
        details: 'Pain and restricted movement in right shoulder'
      },
      {
        type: 'Headaches',
        onset: '24 hours',
        initialSeverity: 'Moderate',
        currentSeverity: 'Mild',
        resolutionDays: null,
        classification: 'Post-traumatic',
        details: 'Tension-type headaches, originating from the neck'
      }
    ],
    physicalInjurySummary: 'The claimant sustained typical acceleration-deceleration injuries consistent with a rear-end collision. The primary complaint is of neck pain with associated headaches and lower back pain. The right shoulder pain has now resolved. Clinical examination shows restricted range of motion in the neck with palpable muscle spasm and tenderness over the cervical paraspinal muscles.',
    additionalNotes: 'No radiological investigations have been performed. There is no evidence of neurological deficit or radicular symptoms. The pattern of injuries is consistent with the described mechanism of the accident.'
  },
  
  psychologicalInjuries: {
    hasTravelAnxiety: true,
    anxietyLevel: 'Moderate',
    avoidanceBehaviors: ['Avoids driving on busy roads', 'Increased alertness at junctions'],
    flashbacks: true,
    sleepDisturbance: true,
    otherSymptoms: 'Increased irritability, especially when as a passenger',
    psychologicalInjurySummary: 'The claimant has developed mild to moderate travel anxiety following the accident, particularly when driving or as a passenger on busy roads. They report heightened vigilance at junctions and when vehicles approach from behind. These symptoms are gradually improving but continue to affect their confidence when driving.'
  },
  
  treatments: {
    receivedTreatmentAtScene: true,
    sceneFirstAid: true,
    sceneNeckCollar: false,
    sceneAmbulanceArrived: true,
    scenePoliceArrived: true,
    sceneOtherTreatment: false,
    wentToHospital: true,
    hospitalName: 'Royal London Hospital',
    daysInHospital: 0,
    hospitalXRay: true,
    hospitalCTScan: false,
    hospitalBandage: false,
    hospitalNeckCollar: true,
    hospitalOtherTreatment: false,
    hospitalNoTreatment: false,
    wentToGPWalkIn: true,
    daysToGPWalkIn: 3,
    takingParacetamol: true,
    takingIbuprofen: true,
    takingCodeine: false,
    takingOtherMedication: false,
    physiotherapySessions: 6,
    needsMorePhysiotherapy: true,
    treatmentSummary: 'The claimant received initial first aid at the scene and was assessed at the Royal London Hospital on the same day. X-rays showed no fractures, and they were discharged with a soft collar and advice. They consulted their GP three days later and were prescribed analgesics. They have since completed six sessions of physiotherapy, which has been beneficial in reducing their symptoms, particularly for the neck pain. Their physiotherapist has recommended a further course of 4-6 sessions to address ongoing issues.'
  },
  
  lifestyleImpact: {
    currentJobTitle: 'Office Administrator',
    workStatus: 'Full-time',
    secondJob: null,
    daysOffWork: 10,
    workDifficulties: ['Difficulty sitting for long periods', 'Pain when using computer'],
    hasSleepDisturbance: true,
    sleepDisturbances: ['Difficulty finding comfortable position', 'Waking due to pain'],
    hasDomesticImpact: true,
    domesticActivities: ['Difficulty with household cleaning', 'Unable to lift heavy items'],
    hasSportLeisureImpact: true,
    sportLeisureActivities: ['Unable to participate in tennis', 'Reduced capacity for gym workouts'],
    hasSocialImpact: true,
    socialActivities: ['Avoids long social gatherings due to discomfort', 'Reduced participation in evening activities due to increased pain later in day'],
    lifestyleSummary: 'The injuries have had a moderate impact on the claimant\'s daily activities. They had 10 days off work initially and continue to experience difficulties with prolonged sitting and computer use, which are essential parts of their job. Domestic activities requiring lifting or stretching are limited. Their recreational activities have been significantly affected, particularly their regular tennis matches and gym workouts. Sleep disturbance due to pain exacerbates fatigue, which further impacts their daily functioning and mood.'
  },
  
  familyHistory: {
    hasPreviousAccident: false,
    previousAccidentYear: null,
    previousAccidentRecovery: null,
    hasPreviousMedicalCondition: true,
    previousMedicalConditionDetails: 'Mild asthma, well-controlled with inhaler',
    hasExceptionalSeverity: false,
    physiotherapyPreference: 'Local clinic referral',
    medicalHistorySummary: 'The claimant has no history of previous accidents or injuries. Their only pre-existing medical condition is mild asthma, which is well-controlled with a salbutamol inhaler used as needed. This condition is unrelated to and has not been affected by the current injuries. There is no history of previous neck or back problems.'
  },
  
  prognosis: {
    overallPrognosis: 'Good',
    expectedRecoveryTime: '6-9 months from date of accident',
    permanentImpairment: 'None expected',
    futureCarePlans: 'Complete recommended physiotherapy course',
    treatmentRecommendations: [
      'Complete 4-6 additional physiotherapy sessions',
      'Continue prescribed pain management regimen',
      'Gradually increase physical activity as symptoms allow',
      'Consider ergonomic assessment at workplace'
    ],
    additionalNotes: 'The claimant is expected to make a full recovery with appropriate treatment and self-management. Their symptoms have already shown significant improvement, particularly the resolution of shoulder pain. The neck and back pain are expected to gradually resolve over the coming months with continued appropriate management.'
  },
  
  expertDetails: {
    examiner: 'Dr. Sarah Johnson',
    credentials: 'MBBS, FRCP, Dip Sports Med',
    specialty: 'Consultant in Rehabilitation Medicine',
    licensureState: 'GMC',
    licenseNumber: '1234567',
    experienceYears: 15,
    contactInformation: 'Medical Expert Services, 45 Harley Street, London, W1G 8QR'
  }
};

// Generate PDF data URL
const pdfDataUrl = generatePDF(sampleCaseData);

// Output to console for demonstration
console.log("PDF Data URL generated:", pdfDataUrl.substring(0, 100) + "... (truncated)");