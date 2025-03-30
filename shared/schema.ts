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
  address: z.string().optional(),
  postCode: z.string().optional(),
  accidentDate: z.string().optional(),
  identification: z.object({
    type: z.enum(["Passport", "Driving Licence", "Other"]).default("Passport"),
  }).optional(),
  accompaniedBy: z.enum(["Alone", "Spouse", "Father", "Mother", "Other"]).default("Alone"),
  dateOfReport: z.string().optional(),
  dateOfExamination: z.string().optional(),
  timeSpent: z.string().default("15 min"),
  helpWithCommunication: z.boolean().default(false),
  placeOfExamination: z.enum([
    "Face to Face at Meeting Room, North, Ibis, Garstang Rd, Preston PR3 5JE",
    "Regus Office, Centenary Way, Salford M50 1RF"
  ]).default("Face to Face at Meeting Room, North, Ibis, Garstang Rd, Preston PR3 5JE"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  occupation: z.string().optional(),
});

export const accidentDetailsSchema = z.object({
  accidentDate: z.string().min(1, "Accident date is required"),
  accidentTime: z.string().optional(),
  timeOfDay: z.enum(["Morning", "Afternoon", "Evening", "Night"]).optional(),
  accidentLocation: z.string().min(1, "Accident location is required"),
  vehicleLocation: z.enum(["Main Road", "Minor Road", "Motorway", "Roundabout", "Other"]).optional(),
  weatherConditions: z.string().optional(),
  accidentType: z.string().min(1, "Accident type is required"),
  vehicleType: z.enum(["Car", "Bus", "Van", "Motorcycle", "Truck", "Other"]).optional(),
  claimantPosition: z.enum(["Driver", "Front Passenger", "Rear Passenger", "Other"]).optional(),
  speed: z.enum(["Slow", "Medium", "High"]).optional(),
  thirdPartyVehicle: z.enum(["Car", "Van", "Bus", "Truck", "Motorcycle", "Other"]).optional(),
  impactLocation: z.enum(["Rear", "Front", "Left Side", "Right Side", "Multiple"]).optional(),
  vehicleMovement: z.enum(["Stationary", "Moving", "Parked", "Other"]).optional(),
  damageSeverity: z.enum(["Mild", "Moderate", "Severe", "Written Off"]).optional(),
  seatBeltWorn: z.boolean().default(true),
  headRestFitted: z.boolean().default(true),
  airBagDeployed: z.boolean().default(false),
  collisionImpact: z.enum(["Forward/Backward", "Sideways", "Multiple Directions", "None"]).optional(),
  accidentDescription: z.string().optional(),
});

export const physicalInjurySchema = z.object({
  initialComplaints: z.string().optional(),
  initialTreatment: z.string().optional(),
  diagnoses: z.array(
    z.object({
      diagnosis: z.string().optional(),
      diagnosisDate: z.string().optional(),
      diagnosingPhysician: z.string().optional(),
    })
  ).optional(),
  injuryLocations: z.array(z.string()).optional(),
  painScale: z.number().min(0).max(10).optional(),
  symptoms: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

export const psychologicalInjuriesSchema = z.object({
  psychologicalSymptoms: z.array(z.string()).optional(),
  mentalHealthDiagnoses: z.array(
    z.object({
      diagnosis: z.string().optional(),
      diagnosisDate: z.string().optional(),
      diagnosingProvider: z.string().optional(),
    })
  ).optional(),
  traumaAssessment: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const treatmentsSchema = z.object({
  emergencyTreatment: z.string().optional(),
  hospitalizations: z.array(
    z.object({
      facility: z.string().optional(),
      admissionDate: z.string().optional(),
      dischargeDate: z.string().optional(),
      reason: z.string().optional(),
    })
  ).optional(),
  ongoingTreatments: z.array(
    z.object({
      treatmentType: z.string().optional(),
      provider: z.string().optional(),
      frequency: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  ).optional(),
  medications: z.array(
    z.object({
      name: z.string().optional(),
      dosage: z.string().optional(),
      frequency: z.string().optional(),
      prescribedBy: z.string().optional(),
    })
  ).optional(),
  additionalNotes: z.string().optional(),
});

export const lifestyleImpactSchema = z.object({
  adl: z.string().optional(), // Activities of Daily Living
  workImpact: z.string().optional(),
  recreationalImpact: z.string().optional(),
  socialImpact: z.string().optional(),
  sleepImpact: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const familyHistorySchema = z.object({
  relevantFamilyHistory: z.string().optional(),
  preExistingConditions: z.array(z.string()).optional(),
  familySupport: z.string().optional(),
  additionalNotes: z.string().optional(),
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
