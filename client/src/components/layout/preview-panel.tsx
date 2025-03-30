import React from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateCompletionPercentage, sections } from "@/lib/sections";
import { Case } from "@shared/schema";

interface PreviewPanelProps {
  caseData: Case | null;
  onGeneratePdf: () => void;
}

export function PreviewPanel({ caseData, onGeneratePdf }: PreviewPanelProps) {
  const completionPercentage = caseData ? calculateCompletionPercentage(caseData) : 0;
  
  return (
    <aside className="w-80 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#4A5568]">Report Preview</h2>
        <button
          className="text-sm text-[#0E7C7B] font-medium hover:text-teal-900 flex items-center"
          onClick={onGeneratePdf}
        >
          <FileText className="h-4 w-4 mr-1" />
          Download PDF
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {caseData ? (
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold text-slate-900 mb-1">MEDICAL-LEGAL REPORT</h1>
              <p className="text-sm text-slate-600">Road Traffic Accident Case Assessment</p>
            </div>
            
            {/* Claimant Details Section */}
            {caseData.claimantDetails && (
              <div className="mb-4">
                <h2 className="text-md font-semibold text-[#4A5568] border-b border-gray-200 pb-1 mb-2">1. CLAIMANT DETAILS</h2>
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="py-1 text-slate-600 w-1/3">Name:</td>
                      <td className="py-1 font-medium text-slate-900">{caseData.claimantDetails.fullName || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Date of Birth:</td>
                      <td className="py-1 font-medium text-slate-900">
                        {caseData.claimantDetails.dateOfBirth
                          ? new Date(caseData.claimantDetails.dateOfBirth).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Address:</td>
                      <td className="py-1 font-medium text-slate-900">
                        {caseData.claimantDetails.address
                          ? `${caseData.claimantDetails.address}, ${caseData.claimantDetails.city || ""} ${caseData.claimantDetails.state || ""} ${caseData.claimantDetails.zipCode || ""}`
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Occupation:</td>
                      <td className="py-1 font-medium text-slate-900">{caseData.claimantDetails.occupation || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Accident Details Section */}
            {caseData.accidentDetails && (
              <div className="mb-4">
                <h2 className="text-md font-semibold text-[#4A5568] border-b border-gray-200 pb-1 mb-2">2. ACCIDENT DETAILS</h2>
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="py-1 text-slate-600 w-1/3">Date and Time:</td>
                      <td className="py-1 font-medium text-slate-900">
                        {caseData.accidentDetails.accidentDate
                          ? `${new Date(caseData.accidentDetails.accidentDate).toLocaleDateString()} ${caseData.accidentDetails.accidentTime || ""}`
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Location:</td>
                      <td className="py-1 font-medium text-slate-900">{caseData.accidentDetails.accidentLocation || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-600">Type of Accident:</td>
                      <td className="py-1 font-medium text-slate-900">{caseData.accidentDetails.accidentType || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
                {caseData.accidentDetails.accidentDescription && (
                  <p className="text-xs mt-2 text-slate-900">{caseData.accidentDetails.accidentDescription}</p>
                )}
              </div>
            )}
            
            {/* Physical Injury Details Section */}
            <div>
              <h2 className="text-md font-semibold text-[#4A5568] border-b border-gray-200 pb-1 mb-2">3. PHYSICAL INJURY DETAILS</h2>
              {caseData.physicalInjuryDetails ? (
                <table className="w-full text-xs">
                  <tbody>
                    {caseData.physicalInjuryDetails.initialComplaints && (
                      <tr>
                        <td className="py-1 text-slate-600 w-1/3">Initial Complaints:</td>
                        <td className="py-1 font-medium text-slate-900">{caseData.physicalInjuryDetails.initialComplaints}</td>
                      </tr>
                    )}
                    {caseData.physicalInjuryDetails.painScale !== undefined && (
                      <tr>
                        <td className="py-1 text-slate-600">Pain Scale:</td>
                        <td className="py-1 font-medium text-slate-900">{caseData.physicalInjuryDetails.painScale}/10</td>
                      </tr>
                    )}
                    {caseData.physicalInjuryDetails.symptoms && caseData.physicalInjuryDetails.symptoms.length > 0 && (
                      <tr>
                        <td className="py-1 text-slate-600">Symptoms:</td>
                        <td className="py-1 font-medium text-slate-900">{caseData.physicalInjuryDetails.symptoms.join(", ")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-500 italic">Section not yet complete</p>
              )}
            </div>
            
            {/* Additional sections would continue here */}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-slate-500">No case data available for preview</p>
          </div>
        )}
        
        {/* Remaining sections placeholder */}
        <div className="text-center p-4">
          <p className="text-sm text-slate-500">Complete more sections to preview the full report</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          className="w-full flex items-center justify-center"
          onClick={onGeneratePdf}
        >
          <FileText className="h-4 w-4 mr-1" />
          Generate Final Report
        </Button>
      </div>
    </aside>
  );
}
