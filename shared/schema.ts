import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

// Case model for storing medical-legal reports
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  status: text("status").notNull().default("in_progress"), // in_progress, completed, archived
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
  
  // Claimant Details
  claimantDetails: jsonb("claimant_details"),
  
  // Accident Details
  accidentDetails: jsonb("accident_details"),
  
  // Physical Injury Details
  physicalInjuryDetails: jsonb("physical_injury_details"),
  
  // Psychological Injuries
  psychologicalInjuries: jsonb("psychological_injuries"),
  
  // Treatments
  treatments: jsonb("treatments"),
  
  // Impact on Lifestyle
  lifestyleImpact: jsonb("lifestyle_impact"),
  
  // Family History
  familyHistory: jsonb("family_history"),
  
  // Work History
  workHistory: jsonb("work_history"),
  
  // Prognosis
  prognosis: jsonb("prognosis"),
  
  // Medical Expert Details
  expertDetails: jsonb("expert_details"),
  
  // Completion status
  completionPercentage: integer("completion_percentage").notNull().default(0),
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCaseSchema = createInsertSchema(cases).omit({
  id: true,
  caseNumber: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

// Define the nested schemas for each section
export const claimantDetailsSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  age: z.number().optional(),
  gender: z.enum(["Male", "Female", "Not specified"]).default("Not specified"),
  address: z.string().optional(),
  identification: z.object({
    type: z.enum(["Passport", "Driving Licence", "Other"]).default("Passport"),
  }).optional(),
  accompaniedBy: z.enum(["Alone", "Spouse", "Father", "Mother", "Other"]).default("Alone"),
  // Default date of report to today's date
  dateOfReport: z.string().default(() => new Date().toISOString().split('T')[0]),
  dateOfExamination: z.string().optional(),
  timeSpent: z.string().default("15 min"),
  helpWithCommunication: z.boolean().default(false),
  interpreterName: z.string().optional(),
  interpreterRelationship: z.string().optional(),
  placeOfExamination: z.enum([
    "Face to Face at Meeting Room, North, Ibis, Garstang Rd, Preston PR3 5JE",
    "Regus Office, Centenary Way, Salford M50 1RF"
  ]).default("Face to Face at Meeting Room, North, Ibis, Garstang Rd, Preston PR3 5JE"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  // Added new fields
  instructingParty: z.string().optional(),
  instructingPartyRef: z.string().optional(),
  solicitorName: z.string().optional(),
  referenceNumber: z.string().optional(),
  medcoRefNumber: z.string().optional(),
});

export const accidentDetailsSchema = z.object({
  accidentDate: z.string().min(1, "Accident date is required"),
  timeOfDay: z.enum(["Morning", "Afternoon", "Evening", "Night"]).optional(),
  vehicleLocation: z.enum(["Main Road", "Minor Road", "Motorway", "Roundabout", "Other"]).optional(),
  weatherConditions: z.string().optional(),
  accidentType: z.string().min(1, "Accident type is required"),
  vehicleType: z.enum(["Car", "Bus", "Van", "Motorcycle", "Truck", "Other"]).optional(),
  claimantPosition: z.enum(["Driver", "Front Passenger", "Rear Passenger", "Other"]).optional(),
  speed: z.enum(["Slow", "Medium", "High"]).optional(),
  thirdPartyVehicle: z.enum(["Car", "Van", "Bus", "Truck", "Motorcycle", "Other"]).optional(),
  impactLocation: z.enum(["Rear", "Front", "Left Side", "Right Side", "Multiple"]).optional(),
  vehicleMovement: z.enum(["Stationary", "Moving", "Parked", "Other"]).optional(),
  damageSeverity: z.enum(["Mildly Damaged", "Moderately Damaged", "Severely Damaged", "Written Off"]).optional(),
  seatBeltWorn: z.boolean().default(true),
  headRestFitted: z.boolean().default(true),
  airBagDeployed: z.boolean().default(false),
  collisionImpact: z.enum(["Forward/Backward", "Backward/Forward", "Sideways", "Multiple Directions", "None"]).optional(),
  accidentDescription: z.string().optional(),
});

export const physicalInjurySchema = z.object({
  injuries: z.array(
    z.object({
      type: z.enum(["Neck", "Upper Back / Shoulders", "Lower Back", "Bruising", "Headaches", "Other"]),
      description: z.string().optional(), // For "Other" injuries
      onsetTime: z.enum(["Same Day", "Next Day", "Few Days Later"]),
      initialSeverity: z.enum(["Mild", "Moderate", "Severe"]),
      currentSeverity: z.enum(["Mild", "Moderate", "Severe", "Resolved"]),
      resolutionDays: z.string().optional(), // If resolved, how many days it took
      mechanism: z.string(), // Auto-populated based on injury type
      classification: z.string() // Auto-populated based on injury type
    })
  ).optional(),
  otherInjuriesDescription: z.string().optional(),
  additionalNotes: z.string().optional(),
  physicalInjurySummary: z.string().optional(), // Summary of all physical injuries
});

export const psychologicalInjuriesSchema = z.object({
  travelAnxietySymptoms: z.array(z.string()).optional(),
  travelAnxietyOnset: z.enum(["Same Day", "Next Day", "Few Days Later"]).optional(),
  travelAnxietyInitialSeverity: z.enum(["Mild", "Moderate", "Severe"]).optional(),
  travelAnxietyCurrentSeverity: z.enum(["Mild", "Moderate", "Severe", "Resolved"]).optional(),
  travelAnxietyResolutionDays: z.string().optional()
});

export const treatmentsSchema = z.object({
  // Accident scene treatment
  receivedTreatmentAtScene: z.boolean().optional(),
  sceneFirstAid: z.boolean().optional(),
  sceneNeckCollar: z.boolean().optional(),
  sceneAmbulanceArrived: z.boolean().optional(),
  scenePoliceArrived: z.boolean().optional(),
  sceneOtherTreatment: z.boolean().optional(),
  sceneOtherTreatmentDetails: z.string().optional(),
  
  // A&E (Hospital) treatment
  wentToHospital: z.boolean().optional(),
  hospitalName: z.string().optional(),
  hospitalNoTreatment: z.boolean().optional(),
  hospitalXRay: z.boolean().optional(),
  hospitalCTScan: z.boolean().optional(),
  hospitalBandage: z.boolean().optional(),
  hospitalNeckCollar: z.boolean().optional(),
  hospitalOtherTreatment: z.boolean().optional(),
  hospitalOtherTreatmentDetails: z.string().optional(),
  
  // GP/Walk-in center
  wentToGPWalkIn: z.boolean().optional(),
  daysToGPWalkIn: z.string().optional(),
  
  // Current medications
  takingParacetamol: z.boolean().optional(),
  takingIbuprofen: z.boolean().optional(),
  takingCodeine: z.boolean().optional(),
  takingOtherMedication: z.boolean().optional(),
  otherMedicationDetails: z.string().optional(),
  
  // Physiotherapy
  physiotherapySessions: z.string().optional(),
  
  // Summary
  treatmentSummary: z.string().optional(),
  
  // Extended treatment fields for PDF
  emergencyTreatment: z.string().optional(),
  gpVisits: z.string().optional(),
  gpTreatmentDetails: z.string().optional(),
  hospitalTreatment: z.string().optional(),
  physiotherapy: z.string().optional(),
  physiotherapyDetails: z.string().optional(),
  otherTreatments: z.string().optional(),
  currentMedication: z.string().optional(),
});

export const lifestyleImpactSchema = z.object({
  // Job details
  currentJobTitle: z.string().optional(),
  workStatus: z.enum(["Full-time", "Part-time", "Retired", "Student", "Other"]).optional(),
  secondJob: z.string().optional(),
  
  // Work impact
  daysOffWork: z.string().optional(),
  daysLightDuties: z.string().optional(),
  workDifficulties: z.array(z.string()).optional(),
  workOtherDetails: z.string().optional(),
  
  // Sleep disturbances
  hasSleepDisturbance: z.boolean().optional(),
  sleepDisturbances: z.array(z.string()).optional(),
  sleepOtherDetails: z.string().optional(),
  
  // Domestic living
  hasDomesticImpact: z.boolean().optional(),
  domesticActivities: z.array(z.string()).optional(),
  domesticOtherDetails: z.string().optional(),
  livesWithWho: z.enum(["Wife", "Parents", "Partner", "Alone", "Other"]).optional(),
  livesWithOther: z.string().optional(),
  numberOfChildren: z.enum(["0", "1", "2", "3", "4", "5", "6", "7", "Other"]).optional(),
  numberOfChildrenOther: z.string().optional(),
  
  // Sport & leisure
  hasSportLeisureImpact: z.boolean().optional(),
  sportLeisureActivities: z.array(z.string()).optional(),
  sportLeisureOtherDetails: z.string().optional(),
  
  // Social life
  hasSocialImpact: z.boolean().optional(),
  socialActivities: z.array(z.string()).optional(),
  socialOtherDetails: z.string().optional(),
  
  // Summary
  lifestyleSummary: z.string().optional(),
  
  // Extended lifestyle impact fields for PDF
  impactSummary: z.string().optional(),
  domesticImpact: z.string().optional(),
  workImpact: z.string().optional(),
  socialImpact: z.string().optional(),
  sleepImpact: z.string().optional(),
  relationshipImpact: z.string().optional(),
  hobbiesImpact: z.string().optional(),
});

export const familyHistorySchema = z.object({
  // Previous road traffic accidents
  hasPreviousAccident: z.boolean().optional(),
  previousAccidentYear: z.string().optional(),
  previousAccidentRecovery: z.enum(["Complete", "Partial"]).optional(),
  
  // Previous medical conditions
  hasPreviousMedicalCondition: z.boolean().optional(),
  previousMedicalConditionDetails: z.string().optional(),
  
  // Exceptional severity claim
  hasExceptionalSeverity: z.boolean().optional(),
  hasExceptionalCircumstances: z.boolean().optional(),
  
  // Physiotherapy preference
  physiotherapyPreference: z.enum(["Yes", "No", "Already ongoing", "Already recovered"]).optional(),
  
  // Additional notes
  additionalNotes: z.string().optional(),
  
  // Summary
  medicalHistorySummary: z.string().optional(),
  
  // Extended family history fields
  historySummary: z.string().optional(),
  previousAccidents: z.string().optional(),
  previousInjuries: z.string().optional(),
  preExistingConditions: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  generalHealth: z.string().optional(),
  medicationHistory: z.string().optional(),
});

export const workHistorySchema = z.object({
  currentEmployment: z.object({
    employer: z.string().optional(),
    position: z.string().optional(),
    startDate: z.string().optional(),
    duties: z.string().optional(),
  }).optional(),
  previousEmployment: z.array(
    z.object({
      employer: z.string().optional(),
      position: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      duties: z.string().optional(),
    })
  ).optional(),
  timeOffWork: z.string().optional(),
  workAccommodations: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const prognosisSchema = z.object({
  overallPrognosis: z.string().optional(),
  expectedRecoveryTime: z.string().optional(),
  permanentImpairment: z.string().optional(),
  futureCarePlans: z.string().optional(),
  treatmentRecommendations: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

export const expertDetailsSchema = z.object({
  examiner: z.string().min(1, "Examiner name is required"),
  credentials: z.string().min(1, "Credentials are required"),
  licensureState: z.string().optional(),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  experienceYears: z.number().optional(),
  contactInformation: z.string().optional(),
  signatureDate: z.string().optional(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type UpdateCase = z.infer<typeof updateCaseSchema>;
export type Case = typeof cases.$inferSelect;

export type ClaimantDetails = z.infer<typeof claimantDetailsSchema>;
export type AccidentDetails = z.infer<typeof accidentDetailsSchema>;
export type PhysicalInjury = z.infer<typeof physicalInjurySchema>;
export type PsychologicalInjuries = z.infer<typeof psychologicalInjuriesSchema>;
export type Treatments = z.infer<typeof treatmentsSchema>;
export type LifestyleImpact = z.infer<typeof lifestyleImpactSchema>;
export type FamilyHistory = z.infer<typeof familyHistorySchema>;
export type WorkHistory = z.infer<typeof workHistorySchema>;
export type Prognosis = z.infer<typeof prognosisSchema>;
export type ExpertDetails = z.infer<typeof expertDetailsSchema>;
