import { 
  FileText, 
  AlertTriangle, 
  Heart, 
  Brain, 
  Stethoscope, 
  Users, 
  UserCircle, 
  Briefcase,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

export type SectionId = 
  | "claimant" 
  | "accident" 
  | "physical" 
  | "psychological" 
  | "treatments" 
  | "lifestyle" 
  | "family" 
  | "expert";

export interface Section {
  id: SectionId;
  name: string;
  icon: any;
  apiPath: string;
  getCompletionStatus: (caseData: any) => boolean;
}

export const sections: Section[] = [
  {
    id: "claimant",
    name: "Claimant Details",
    icon: UserCircle,
    apiPath: "claimant-details",
    getCompletionStatus: (caseData) => 
      caseData?.claimantDetails?.fullName && 
      caseData?.claimantDetails?.dateOfBirth
  },
  {
    id: "accident",
    name: "Accident Details",
    icon: AlertTriangle,
    apiPath: "accident-details",
    getCompletionStatus: (caseData) => 
      caseData?.accidentDetails?.accidentDate && 
      caseData?.accidentDetails?.accidentLocation &&
      caseData?.accidentDetails?.accidentType
  },
  {
    id: "physical",
    name: "Physical Injury Details",
    icon: Heart,
    apiPath: "physical-injury",
    getCompletionStatus: (caseData) => 
      !!caseData?.physicalInjuryDetails
  },
  {
    id: "psychological",
    name: "Travel Anxiety",
    icon: Brain,
    apiPath: "psychological-injuries",
    getCompletionStatus: (caseData) => 
      caseData?.psychologicalInjuries?.travelAnxietySymptoms?.length > 0
  },
  {
    id: "treatments",
    name: "Treatments",
    icon: Stethoscope,
    apiPath: "treatments",
    getCompletionStatus: (caseData) => 
      !!caseData?.treatments
  },
  {
    id: "lifestyle",
    name: "Impact on Lifestyle",
    icon: Users,
    apiPath: "lifestyle-impact",
    getCompletionStatus: (caseData) => 
      !!caseData?.lifestyleImpact
  },
  {
    id: "family",
    name: "Past History of Accidents or Illness",
    icon: Users,
    apiPath: "family-history",
    getCompletionStatus: (caseData) => 
      !!caseData?.familyHistory
  },

  {
    id: "expert",
    name: "Medical Expert Details",
    icon: GraduationCap,
    apiPath: "expert-details",
    getCompletionStatus: (caseData) => 
      caseData?.expertDetails?.examiner && 
      caseData?.expertDetails?.credentials
  }
];

export const getSectionById = (id: SectionId): Section | undefined => {
  return sections.find(section => section.id === id);
};

export const calculateCompletionPercentage = (caseData: any): number => {
  if (!caseData) return 0;
  
  const completedSections = sections.filter(section => 
    section.getCompletionStatus(caseData)
  );
  
  return Math.round((completedSections.length / sections.length) * 100);
};
