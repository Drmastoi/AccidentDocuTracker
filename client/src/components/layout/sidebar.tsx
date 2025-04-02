import React from "react";
import { sections, SectionId, calculateCompletionPercentage } from "@/lib/sections";
import { Progress } from "@/components/ui/progress";
import { Case } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SidebarProps {
  caseData: Case | null;
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
}

export function Sidebar({ caseData, activeSection, onSectionChange }: SidebarProps) {
  const completionPercentage = caseData ? calculateCompletionPercentage(caseData) : 0;
  
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[#4A5568]">
            {caseData?.caseNumber || "New Case"}
          </h2>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        </div>
        {caseData?.claimantDetails?.fullName && (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="ml-2 text-sm text-[#4A5568]">{caseData.claimantDetails.fullName}</span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto sidebar-scroll">
        <ul className="py-2">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const isComplete = section.getCompletionStatus(caseData);
            
            return (
              <li key={section.id} data-section={section.id}>
                <a
                  href={`#${section.id}`}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm",
                    isActive
                      ? "text-[#0E7C7B] font-medium bg-teal-50 border-l-4 border-[#0E7C7B]"
                      : "text-[#4A5568] hover:bg-gray-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    onSectionChange(section.id);
                  }}
                >
                  <section.icon className={cn(
                    "h-5 w-5 mr-3",
                    isActive ? "text-[#0E7C7B]" : "text-gray-400"
                  )} />
                  {section.name}
                  {isComplete && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-auto text-teal-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Completion</span>
            <span className="text-xs font-medium text-teal-600">{completionPercentage}%</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>
        {/* Preview button removed as requested */}
      </div>
    </aside>
  );
}
