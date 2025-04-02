import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Case } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SuggestionPanel } from "@/components/suggestions/suggestion-panel";
import { ClaimantDetailsForm } from "@/components/case-forms/claimant-details";
import { AccidentDetailsForm } from "@/components/case-forms/accident-details";
import { PhysicalInjuryForm } from "@/components/case-forms/physical-injury";
import { PsychologicalInjuriesForm } from "@/components/case-forms/psychological-injuries";
import { TreatmentsForm } from "@/components/case-forms/treatments";
import { LifestyleImpactForm } from "@/components/case-forms/lifestyle-impact";
import { FamilyHistoryForm } from "@/components/case-forms/family-history";
import { WorkHistoryForm } from "@/components/case-forms/work-history";

import { ExpertDetailsForm } from "@/components/case-forms/expert-details";
import { useToast } from "@/hooks/use-toast";
import { SectionId, sections } from "@/lib/sections";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { PDFCustomizationOptions } from "@/lib/pdf-generator";
import { generateMedcoPDF } from "@/lib/medco-pdf-generator";
import { generateCustomMedcoPDF } from "@/lib/custom-medco-pdf";

export default function CaseEditor() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<SectionId>("claimant");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Check if this is a new case or editing an existing one
  const isNewCase = params.id === "new";
  const caseId = isNewCase ? 0 : parseInt(params.id, 10);
  
  // Fetch case data if editing an existing case
  const { data: caseData, isLoading: isLoadingCase, error: caseError } = useQuery({
    queryKey: [isNewCase ? null : `/api/cases/${caseId}`],
    enabled: !isNewCase,
  });
  
  // Create a new case if this is a new case
  const createCaseMutation = useMutation({
    mutationFn: async () => {
      // Create a new case with default values
      const response = await apiRequest("POST", "/api/cases", {
        caseNumber: "",  // Will be generated on server
        status: "in_progress",
        userId: 1, // Default user (would be set from auth context in a real app)
        completionPercentage: 0,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to the newly created case
      setLocation(`/cases/${data.id}`);
      
      toast({
        title: "Case created",
        description: `New case ${data.caseNumber} created successfully`,
      });
      
      // Invalidate the cases list query
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
    },
    onError: (error) => {
      console.error("Error creating case:", error);
      toast({
        title: "Error creating case",
        description: "There was an error creating the case. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // If this is a new case, create it when the component mounts
  useEffect(() => {
    if (isNewCase) {
      createCaseMutation.mutate();
    }
  }, [isNewCase]);
  
  const handleSave = async () => {
    try {
      // No specific save needed as individual sections handle their own saving
      // This could be enhanced to save all modified sections at once
      return Promise.resolve();
    } catch (error) {
      console.error("Error saving case:", error);
      toast({
        title: "Error saving case",
        description: "There was an error saving the case. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };
  
  const handleGeneratePdf = (options?: PDFCustomizationOptions) => {
    if (!caseData) {
      toast({
        title: "Cannot generate PDF",
        description: "Please save the case details first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Generate PDF using our custom teal green themed format
      const pdfDataUri = generateCustomMedcoPDF(caseData as Case);
      
      // Open the PDF in a new window
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <iframe width="100%" height="100%" src="${pdfDataUri}"></iframe>
        `);
      } else {
        // If popup blocked, provide a link to download
        setPdfUrl(pdfDataUri);
        toast({
          title: "PDF Generated",
          description: "Your PDF has been generated. Click the download button to save it.",
        });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating PDF",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to navigate to the next section
  const navigateToNextSection = () => {
    // Get the current section index from our defined sections
    const currentSectionIndex = sections.findIndex(section => section.id === activeSection);
    
    // If there's a next section, navigate to it
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1].id;
      setActiveSection(nextSection);
    }
  };
  
  // Show loading state while fetching case data
  if (!isNewCase && isLoadingCase) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="ml-2 h-6 w-64" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-gray-200 bg-white">
            <Skeleton className="h-full" />
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-[#F7FAFC]">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state if case data could not be fetched
  if (!isNewCase && caseError) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F7FAFC]">
        <Card className="max-w-md p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Case</h2>
          <p className="text-[#4A5568] mb-6">
            There was an error loading the case data. Please try again or return to the case list.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => setLocation("/cases")}>Return to Case List</Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col">
      <Header 
        caseNumber={caseData?.caseNumber}
        onSave={handleSave}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          caseData={caseData as Case | null}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        <main className="flex-1 overflow-y-auto content-scroll p-6 bg-[#F7FAFC] compact-form">
          {/* PDF Generation Options */}
          {caseData && (
            <div className="flex justify-end mb-4">
              <Button 
                className="bg-[#0E7C7B] hover:bg-[#0A6463] mr-2" 
                onClick={() => handleGeneratePdf()}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF Report
              </Button>
            </div>
          )}
          
          {/* AI Suggestions Panel removed as requested */}
          
          {activeSection === "claimant" && (
            <ClaimantDetailsForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.claimantDetails}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                navigateToNextSection();
              }}
            />
          )}
          
          {activeSection === "accident" && (
            <AccidentDetailsForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.accidentDetails}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                navigateToNextSection();
              }}
            />
          )}
          
          {activeSection === "physical" && (
            <PhysicalInjuryForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.physicalInjuryDetails}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                navigateToNextSection();
              }}
            />
          )}
          
          {activeSection === "psychological" && (
            <PsychologicalInjuriesForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.psychologicalInjuries}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                navigateToNextSection();
              }}
            />
          )}
          
          {activeSection === "treatments" && (
            <TreatmentsForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.treatments}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                navigateToNextSection();
              }}
            />
          )}
          
          {activeSection === "lifestyle" && (
            <LifestyleImpactForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.lifestyleImpact}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                navigateToNextSection();
              }}
            />
          )}
          
          {activeSection === "family" && (
            <FamilyHistoryForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.familyHistory}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                navigateToNextSection();
              }}
            />
          )}
          
          {/* Work History section is not in our main sections but we'll render it conditionally */}
          {activeSection === "family" && caseData?.familyHistory && (
            <WorkHistoryForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.workHistory}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                navigateToNextSection();
              }}
            />
          )}
          
          {/* Prognosis section removed as requested */}
          
          {activeSection === "expert" && (
            <ExpertDetailsForm
              caseId={caseData?.id ?? 0}
              initialData={caseData?.expertDetails}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseData?.id}`] });
                toast({
                  title: "Expert details saved",
                  description: "All sections have been completed. You can now generate the PDF report.",
                });
              }}
            />
          )}
          
          {pdfUrl && (
            <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Your PDF is ready!</p>
              <Button 
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = pdfUrl;
                  a.download = `${caseData?.caseNumber || "case"}-report.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  setPdfUrl(null);
                }}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
