import React, { useState } from "react";
import { FileText, FileQuestion, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateCompletionPercentage } from "@/lib/sections";
import { Case } from "@shared/schema";
import { PDFCustomizationOptions } from "@/lib/pdf-generator";
import { PDFOptionsPanel } from "./pdf-options-panel";

interface PreviewPanelProps {
  caseData: Case | null;
  onGeneratePdf: (options?: PDFCustomizationOptions) => void;
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
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<PDFCustomizationOptions>({
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
  });
  
  const handleGeneratePdf = () => {
    onGeneratePdf(pdfOptions);
  };
  
  const handleApplyOptions = () => {
    setShowPdfOptions(false);
    // Preview will update with the new options automatically
  };
  
  return (
    <aside className="w-96 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#4A5568]">MedCo Report Preview</h2>
        <div className="flex items-center space-x-2">
          <button
            className="text-sm text-[#4A5568] font-medium hover:text-slate-800 flex items-center"
            onClick={() => setShowPdfOptions(!showPdfOptions)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Options
          </button>
          <button
            className="text-sm text-[#0E7C7B] font-medium hover:text-teal-900 flex items-center"
            onClick={(e) => { e.preventDefault(); handleGeneratePdf(); }}
          >
            <FileText className="h-4 w-4 mr-1" />
            Download PDF
          </button>
        </div>
      </div>
      
      {showPdfOptions && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <PDFOptionsPanel 
            options={pdfOptions}
            onChange={setPdfOptions}
            onClose={() => setShowPdfOptions(false)}
            onApply={handleApplyOptions}
          />
        </div>
      )}
      
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
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#0E7C7B] mb-2">Case: {caseData.caseNumber}</h2>
              <p className="text-gray-600 mb-6">
                {(() => {
                  const claimantDetails = caseData.claimantDetails as any; // Type assertion
                  return claimantDetails && claimantDetails.fullName
                    ? `Patient: ${claimantDetails.fullName}`
                    : 'Fill claimant details to see patient name';
                })()}
              </p>
              
              <div className="w-20 h-20 bg-[#0E7C7B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-[#0E7C7B]" />
              </div>
              
              <Button 
                className="w-60 bg-[#0E7C7B] hover:bg-[#0A6463] mb-3" 
                onClick={(e) => { e.preventDefault(); handleGeneratePdf(); }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF Report
              </Button>
              
              <button 
                className="block w-full text-sm text-[#0E7C7B] hover:text-teal-800 mt-2"
                onClick={() => setShowPdfOptions(true)}
              >
                Customize PDF settings
              </button>
              
              <div className="mt-8 w-full">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Completion Progress</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
