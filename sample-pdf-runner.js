import fs from 'fs';
import path from 'path';

// Sample case data for generating PDF (same as in sample-pdf-generator.ts)
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

// Custom implementation of simplified PDF generation for the demo
function generatePDF(caseData) {
  // In a real implementation, this would generate the PDF
  // For this demo, we'll create an HTML representation instead
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Medical Report - ${caseData.caseNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #0E7C7B;
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
    .section {
      background-color: #f9f9f9;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .section-title {
      background-color: #0E7C7B;
      color: white;
      padding: 10px;
      margin: -15px -15px 15px -15px;
      border-radius: 5px 5px 0 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MEDICAL REPORT</h1>
    <p>Road Traffic Accident Assessment</p>
    <p>Case Number: ${caseData.caseNumber}</p>
  </div>

  <div class="section">
    <h2 class="section-title">CLAIMANT DETAILS</h2>
    <p><strong>Name:</strong> ${caseData.claimantDetails.fullName}</p>
    <p><strong>Date of Birth:</strong> ${caseData.claimantDetails.dateOfBirth}</p>
    <p><strong>Address:</strong> ${caseData.claimantDetails.address}</p>
    <p><strong>Post Code:</strong> ${caseData.claimantDetails.postCode}</p>
    <p><strong>Accident Date:</strong> ${caseData.claimantDetails.accidentDate}</p>
    <p><strong>Date of Examination:</strong> ${caseData.claimantDetails.dateOfExamination}</p>
    <p><strong>Place of Examination:</strong> ${caseData.claimantDetails.placeOfExamination}</p>
  </div>

  <div class="section">
    <h2 class="section-title">EXPERT DETAILS</h2>
    <p><strong>Examiner:</strong> ${caseData.expertDetails.examiner}</p>
    <p><strong>Credentials:</strong> ${caseData.expertDetails.credentials}</p>
    <p><strong>Specialty:</strong> ${caseData.expertDetails.specialty}</p>
    <p><strong>License:</strong> ${caseData.expertDetails.licenseNumber} (${caseData.expertDetails.licensureState})</p>
    <p><strong>Years of Experience:</strong> ${caseData.expertDetails.experienceYears}</p>
  </div>

  <div class="section">
    <h2 class="section-title">ACCIDENT DETAILS</h2>
    <p><strong>Date:</strong> ${caseData.accidentDetails.accidentDate}</p>
    <p><strong>Time:</strong> ${caseData.accidentDetails.accidentTime}</p>
    <p><strong>Location:</strong> ${caseData.accidentDetails.accidentLocation}</p>
    <p><strong>Vehicle Type:</strong> ${caseData.accidentDetails.vehicleType}</p>
    <p><strong>Claimant Position:</strong> ${caseData.accidentDetails.claimantPosition}</p>
    <p><strong>Impact Location:</strong> ${caseData.accidentDetails.impactLocation}</p>
    <p><strong>Description:</strong> ${caseData.accidentDetails.accidentDescription}</p>
  </div>

  <div class="section">
    <h2 class="section-title">INJURY SUMMARY</h2>
    <table>
      <tr>
        <th>Injury</th>
        <th>Onset</th>
        <th>Current Severity</th>
        <th>Classification</th>
      </tr>
      ${caseData.physicalInjuryDetails.injuries.map(injury => `
      <tr>
        <td>${injury.type}</td>
        <td>${injury.onset}</td>
        <td>${injury.currentSeverity}</td>
        <td>${injury.classification}</td>
      </tr>
      `).join('')}
    </table>
    <p><strong>Summary:</strong> ${caseData.physicalInjuryDetails.physicalInjurySummary}</p>
  </div>

  <div class="section">
    <h2 class="section-title">TREATMENT DETAILS</h2>
    <p><strong>Hospital Attendance:</strong> ${caseData.treatments.wentToHospital ? 'Yes - ' + caseData.treatments.hospitalName : 'No'}</p>
    <p><strong>Investigations:</strong> ${caseData.treatments.hospitalXRay ? 'X-Ray' : 'None'}</p>
    <p><strong>Physiotherapy:</strong> ${caseData.treatments.physiotherapySessions} sessions</p>
    <p><strong>Summary:</strong> ${caseData.treatments.treatmentSummary}</p>
  </div>

  <div class="section">
    <h2 class="section-title">PROGNOSIS</h2>
    <p><strong>Overall Prognosis:</strong> ${caseData.prognosis.overallPrognosis}</p>
    <p><strong>Expected Recovery Time:</strong> ${caseData.prognosis.expectedRecoveryTime}</p>
    <p><strong>Permanent Impairment:</strong> ${caseData.prognosis.permanentImpairment}</p>
    <p><strong>Treatment Recommendations:</strong></p>
    <ul>
      ${caseData.prognosis.treatmentRecommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2 class="section-title">DECLARATION</h2>
    <p>I, ${caseData.expertDetails.examiner}, confirm that the information in this report is accurate to the best of my knowledge and belief. This report has been prepared in accordance with my duty to the court.</p>
    <p>Signature: ________________________</p>
    <p>Date: ${new Date().toISOString().split('T')[0]}</p>
  </div>
</body>
</html>
  `;
  
  // Save the HTML to a file
  fs.writeFileSync('sample-report.html', html);
  
  return 'data:text/html;base64,' + Buffer.from(html).toString('base64');
}

// Generate sample PDF (HTML for this demo)
const pdfDataUrl = generatePDF(sampleCaseData);

// Update the viewer HTML to include the actual data
const viewerHtml = fs.readFileSync('sample-pdf-viewer.html', 'utf8');
const updatedViewerHtml = viewerHtml.replace(
  `<div id="pdf-container">
      <p>Loading PDF preview...</p>
    </div>`,
  `<div id="pdf-container">
      <iframe src="sample-report.html" class="pdf-embed"></iframe>
    </div>`
);

fs.writeFileSync('sample-pdf-viewer.html', updatedViewerHtml);

console.log("Sample report generated! Open sample-pdf-viewer.html in your browser to view it.");
console.log("HTML version saved to sample-report.html for direct viewing.");