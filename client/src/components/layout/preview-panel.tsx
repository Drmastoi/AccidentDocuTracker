import React from "react";
import { FileText, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateCompletionPercentage } from "@/lib/sections";
import { Case } from "@shared/schema";

interface PreviewPanelProps {
  caseData: Case | null;
  onGeneratePdf: () => void;
}

// Helper for date formatting in GB format
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export function PreviewPanel({ caseData, onGeneratePdf }: PreviewPanelProps) {
  const completionPercentage = caseData ? calculateCompletionPercentage(caseData) : 0;
  
  return (
    <aside className="w-96 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#4A5568]">MedCo Report Preview</h2>
        <button
          className="text-sm text-[#0E7C7B] font-medium hover:text-teal-900 flex items-center"
          onClick={onGeneratePdf}
        >
          <FileText className="h-4 w-4 mr-1" />
          Download PDF
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Placeholder content for PDF preview */}
        {!caseData && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileQuestion className="w-16 h-16 mb-4" />
            <h3 className="text-lg font-medium">No case data to preview</h3>
            <p className="text-center max-w-md mt-2">
              Complete the case sections to see a preview of the report
            </p>
          </div>
        )}
        
        {caseData && (
          <div className="p-6">
            <div className="bg-[#0E7C7B] text-white p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold text-center">MedCo-Compliant Medical Report</h2>
              <p className="text-center text-white/80 text-sm">Road Traffic Accident Assessment</p>
            </div>
            
            <div className="border border-t-0 rounded-b-lg p-6 bg-white">
              {/* Cover Page Preview */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#0E7C7B] border-b pb-2 mb-4">Cover Page</h3>
                
                {/* Claimant Details */}
                {caseData.claimantDetails && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-[#0E7C7B] mb-2">CLAIMANT DETAILS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p><span className="font-medium">Name:</span> {caseData.claimantDetails.fullName}</p>
                      <p><span className="font-medium">Accident Date:</span> {formatDate(caseData.claimantDetails.accidentDate)}</p>
                      <p><span className="font-medium">Date of Birth:</span> {formatDate(caseData.claimantDetails.dateOfBirth)}</p>
                      <p><span className="font-medium">Report Date:</span> {formatDate(caseData.claimantDetails.dateOfReport)}</p>
                      <p><span className="font-medium">Address:</span> {caseData.claimantDetails.address || "N/A"}</p>
                      <p><span className="font-medium">Examination Date:</span> {formatDate(caseData.claimantDetails.dateOfExamination)}</p>
                      <p><span className="font-medium">Post Code:</span> {caseData.claimantDetails.postCode || "N/A"}</p>
                      <p><span className="font-medium">Place of Examination:</span> {caseData.claimantDetails.placeOfExamination || "N/A"}</p>
                    </div>
                  </div>
                )}
                
                {/* Agency & Solicitor Information */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-[#0E7C7B] mb-2">AGENCY & SOLICITOR INFORMATION</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Referring Agency:</span> [Agency Name]</p>
                    <p><span className="font-medium">Solicitor Name:</span> [Solicitor Name]</p>
                    <p><span className="font-medium">Agency Reference:</span> [Reference Number]</p>
                    <p><span className="font-medium">Solicitor Reference:</span> [Reference Number]</p>
                  </div>
                </div>
                
                {/* MedCo & Expert Information */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-[#0E7C7B] mb-2">MEDCO & EXPERT INFORMATION</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">MedCo Number:</span> [MedCo Number]</p>
                    <p><span className="font-medium">Medical Expert:</span> {caseData.expertDetails?.examiner || "[Expert Name]"}</p>
                    <div></div>
                    <p><span className="font-medium">Credentials:</span> {caseData.expertDetails?.credentials || "[Credentials]"}</p>
                  </div>
                </div>
                
                <p className="text-center mt-4 text-sm font-medium text-gray-600">
                  Case Number: {caseData.caseNumber} | Report Generated: {formatDate(new Date().toISOString())}
                </p>
              </div>
              
              {/* Injury Table Preview */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#0E7C7B] border-b pb-2 mb-4">Injury Summary Table</h3>
                
                {caseData.physicalInjuryDetails?.injuries && caseData.physicalInjuryDetails.injuries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border-spacing-0">
                      <thead>
                        <tr className="bg-[#0E7C7B] text-white">
                          <th className="px-4 py-2 text-left text-sm">Injury</th>
                          <th className="px-4 py-2 text-left text-sm">Current Condition</th>
                          <th className="px-4 py-2 text-left text-sm">Prognosis</th>
                          <th className="px-4 py-2 text-left text-sm">Treatment</th>
                          <th className="px-4 py-2 text-left text-sm">Classification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caseData.physicalInjuryDetails.injuries.map((injury, i) => {
                          // Get prognosis text
                          let prognosisText = "";
                          if (injury.currentSeverity === "Resolved") {
                            prognosisText = `Resolved after ${injury.resolutionDays || "unknown"} days`;
                          } else {
                            prognosisText = caseData.prognosis?.overallPrognosis || "Ongoing";
                          }
                          
                          // Get treatment recommendation
                          const treatmentRecommendations = caseData.prognosis?.treatmentRecommendations || [];
                          const treatment = treatmentRecommendations.length > 0 ? 
                            treatmentRecommendations[0] : "Standard care advised";
                          
                          return (
                            <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                              <td className="border px-4 py-2 text-sm">{injury.type}</td>
                              <td className="border px-4 py-2 text-sm">{injury.currentSeverity}</td>
                              <td className="border px-4 py-2 text-sm">{prognosisText}</td>
                              <td className="border px-4 py-2 text-sm">{treatment}</td>
                              <td className="border px-4 py-2 text-sm">{injury.classification}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No injury data available for table.</p>
                )}
              </div>
              
              {/* Details Sections Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Accident Details */}
                <div>
                  <h4 className="font-medium text-[#0E7C7B] border-b pb-2 mb-2">ACCIDENT DETAILS</h4>
                  {caseData.accidentDetails ? (
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Date:</span> {formatDate(caseData.accidentDetails.accidentDate)}</p>
                      <p><span className="font-medium">Time:</span> {caseData.accidentDetails.accidentTime || "Unknown"}</p>
                      <p><span className="font-medium">Location:</span> {caseData.accidentDetails.accidentLocation || "Unknown"}</p>
                      {caseData.accidentDetails.accidentDescription && (
                        <p className="mt-2 text-xs italic line-clamp-3">{caseData.accidentDetails.accidentDescription}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No accident details available.</p>
                  )}
                </div>
                
                {/* Injury Details */}
                <div>
                  <h4 className="font-medium text-[#0E7C7B] border-b pb-2 mb-2">INJURY DETAILS</h4>
                  {caseData.physicalInjuryDetails?.physicalInjurySummary ? (
                    <p className="text-sm text-gray-700 line-clamp-6">{caseData.physicalInjuryDetails.physicalInjurySummary}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No injury summary available.</p>
                  )}
                </div>
                
                {/* Treatment Details */}
                <div>
                  <h4 className="font-medium text-[#0E7C7B] border-b pb-2 mb-2">TREATMENT DETAILS</h4>
                  {caseData.treatments ? (
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Treatment at Scene:</span> {caseData.treatments.receivedTreatmentAtScene ? "Yes" : "No"}</p>
                      <p><span className="font-medium">Hospital Attendance:</span> {caseData.treatments.wentToHospital ? "Yes" : "No"}</p>
                      <p><span className="font-medium">GP/Walk-in Visit:</span> {caseData.treatments.wentToGPWalkIn ? "Yes" : "No"}</p>
                      {caseData.treatments.physiotherapySessions && (
                        <p><span className="font-medium">Physiotherapy:</span> {caseData.treatments.physiotherapySessions} sessions</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No treatment details available.</p>
                  )}
                </div>
                
                {/* Lifestyle Impact */}
                <div>
                  <h4 className="font-medium text-[#0E7C7B] border-b pb-2 mb-2">IMPACT ON LIFESTYLE</h4>
                  {caseData.lifestyleImpact ? (
                    <div className="text-sm space-y-1">
                      {caseData.lifestyleImpact.currentJobTitle && (
                        <p><span className="font-medium">Job:</span> {caseData.lifestyleImpact.currentJobTitle} ({caseData.lifestyleImpact.workStatus || "Unknown"})</p>
                      )}
                      {caseData.lifestyleImpact.daysOffWork && (
                        <p><span className="font-medium">Days Off Work:</span> {caseData.lifestyleImpact.daysOffWork}</p>
                      )}
                      {caseData.lifestyleImpact.lifestyleSummary && (
                        <p className="text-xs italic line-clamp-3 mt-1">{caseData.lifestyleImpact.lifestyleSummary}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No lifestyle impact details available.</p>
                  )}
                </div>
              </div>
              
              {/* Attached Statements Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#0E7C7B] border-b pb-2 mb-4">Attached Statements</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Previous Medical History */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#0E7C7B] mb-2">PREVIOUS MEDICAL HISTORY</h4>
                    {caseData.familyHistory ? (
                      <div className="text-sm">
                        <p><span className="font-medium">Previous Accident:</span> {caseData.familyHistory.hasPreviousAccident ? "Yes" : "No"}</p>
                        <p><span className="font-medium">Pre-existing Conditions:</span> {caseData.familyHistory.hasPreviousMedicalCondition ? "Yes" : "No"}</p>
                        {caseData.familyHistory.medicalHistorySummary && (
                          <p className="mt-2 text-xs italic line-clamp-2">{caseData.familyHistory.medicalHistorySummary}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No previous medical history available.</p>
                    )}
                  </div>
                  
                  {/* Prognosis & Recommendations */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#0E7C7B] mb-2">PROGNOSIS & RECOMMENDATIONS</h4>
                    {caseData.prognosis ? (
                      <div className="text-sm">
                        <p><span className="font-medium">Overall Prognosis:</span> {caseData.prognosis.overallPrognosis || "N/A"}</p>
                        <p><span className="font-medium">Expected Recovery:</span> {caseData.prognosis.expectedRecoveryTime || "N/A"}</p>
                        {caseData.prognosis.treatmentRecommendations && caseData.prognosis.treatmentRecommendations.length > 0 && (
                          <p><span className="font-medium">Recommendations:</span> {caseData.prognosis.treatmentRecommendations.join(", ")}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No prognosis information available.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <Button 
                  className="w-60 bg-[#0E7C7B] hover:bg-[#0A6463]" 
                  onClick={onGeneratePdf}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Full PDF Report
                </Button>
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                This preview shows a simplified version of the PDF report. The generated PDF will include all details in a professionally formatted document.
              </p>
            </div>
          </div>
        )}
        
        {/* Remaining sections placeholder */}
        <div className="text-center p-4">
          <p className="text-sm text-slate-500">Complete more sections to enhance the report</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <Progress value={completionPercentage} className="h-2" />
          </div>
          <p className="text-xs text-slate-400 mt-1">{completionPercentage}% complete</p>
        </div>
      </div>
    </aside>
  );
}
