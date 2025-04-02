import React, { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Info, X, ChevronRight, ChevronDown } from "lucide-react";
import { Case } from "@shared/schema";
import { analyzeCaseCompleteness, Suggestion } from "@/lib/suggestion-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { sections, SectionId } from "@/lib/sections";

interface SuggestionPanelProps {
  caseData: Case | null;
  onSectionNavigate: (sectionId: SectionId) => void;
}

export function SuggestionPanel({ caseData, onSectionNavigate }: SuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  
  // Group suggestions by section
  const suggestionsBySection: {[key: string]: Suggestion[]} = {};
  suggestions.forEach(suggestion => {
    if (!suggestionsBySection[suggestion.sectionId]) {
      suggestionsBySection[suggestion.sectionId] = [];
    }
    suggestionsBySection[suggestion.sectionId].push(suggestion);
  });
  
  // Count severity levels
  const criticalCount = suggestions.filter(s => s.severity === 'critical').length;
  const warningCount = suggestions.filter(s => s.severity === 'warning').length;
  const infoCount = suggestions.filter(s => s.severity === 'info').length;
  
  // Refresh suggestions when case data changes
  useEffect(() => {
    if (caseData) {
      const newSuggestions = analyzeCaseCompleteness(caseData);
      setSuggestions(newSuggestions);
      
      // Default to expanding sections with critical issues
      const newExpandedSections: {[key: string]: boolean} = {};
      if (newSuggestions.some(s => s.severity === 'critical')) {
        newSuggestions.forEach(s => {
          if (s.severity === 'critical') {
            newExpandedSections[s.sectionId] = true;
          }
        });
        setExpandedSections(newExpandedSections);
      }
    } else {
      setSuggestions([]);
    }
  }, [caseData]);
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getSectionName = (sectionId: string): string => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : sectionId;
  };
  
  const getSeverityIcon = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  if (!caseData) {
    return null;
  }
  
  if (suggestions.length === 0) {
    return (
      <div className="px-4 py-3 bg-green-50 border-green-100 rounded-md">
        <div className="flex items-center">
          <span className="flex-shrink-0 mr-2">
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
          <p className="text-sm font-medium text-green-800">
            No suggestions found. Your case documentation looks complete!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700">AI Documentation Suggestions</h3>
          <div className="flex ml-3 space-x-1">
            {criticalCount > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                {warningCount} Warning
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {infoCount} Info
              </Badge>
            )}
          </div>
        </div>
        <button 
          className="rounded-full p-1 hover:bg-gray-200 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </button>
      </div>
      
      {isOpen && (
        <div className="p-3 divide-y divide-gray-100">
          {Object.keys(suggestionsBySection).map(sectionId => (
            <div key={sectionId} className="py-2 first:pt-0 last:pb-0">
              <Collapsible 
                open={expandedSections[sectionId]} 
                onOpenChange={() => toggleSection(sectionId)}
              >
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 w-full justify-between">
                      <div className="flex items-center">
                        {expandedSections[sectionId] ? 
                          <ChevronDown className="h-4 w-4 mr-1" /> : 
                          <ChevronRight className="h-4 w-4 mr-1" />
                        }
                        <span>{getSectionName(sectionId)}</span>
                      </div>
                      <div className="flex space-x-1">
                        {suggestionsBySection[sectionId].some(s => s.severity === 'critical') && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {!suggestionsBySection[sectionId].some(s => s.severity === 'critical') && 
                          suggestionsBySection[sectionId].some(s => s.severity === 'warning') && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        {!suggestionsBySection[sectionId].some(s => s.severity === 'critical') && 
                          !suggestionsBySection[sectionId].some(s => s.severity === 'warning') && (
                          <Info className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                  <div className="mt-2 pl-6 space-y-2">
                    {suggestionsBySection[sectionId].map((suggestion, idx) => (
                      <div 
                        key={`${sectionId}-${idx}`} 
                        className={`p-2 rounded text-sm border ${getSeverityColor(suggestion.severity)}`}
                      >
                        <div className="flex items-start">
                          <span className="flex-shrink-0 mr-2 mt-0.5">
                            {getSeverityIcon(suggestion.severity)}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{suggestion.message}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => onSectionNavigate(sectionId as SectionId)}
                          >
                            Fix in {getSectionName(sectionId)}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}