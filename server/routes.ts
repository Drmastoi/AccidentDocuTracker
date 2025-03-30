import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertCaseSchema,
  updateCaseSchema,
  claimantDetailsSchema,
  accidentDetailsSchema,
  physicalInjurySchema,
  psychologicalInjuriesSchema,
  treatmentsSchema,
  lifestyleImpactSchema,
  familyHistorySchema,
  workHistorySchema,
  prognosisSchema,
  expertDetailsSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");
  
  // Case routes
  app.get("/api/cases", async (req: Request, res: Response) => {
    try {
      // TODO: In a real app we'd get the user ID from the session
      const userId = 1; // Hardcoded for demo
      const cases = await storage.getCases(userId);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });
  
  app.get("/api/cases/:id", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      const caseData = await storage.getCase(caseId);
      
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      res.json(caseData);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });
  
  app.post("/api/cases", async (req: Request, res: Response) => {
    try {
      // Parse and validate the request body
      const parseResult = insertCaseSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid case data",
          errors: validationError.details
        });
      }
      
      // Generate a unique case number
      const caseNumber = await storage.generateCaseNumber();
      
      // Create the case
      const newCase = await storage.createCase({
        ...parseResult.data,
        caseNumber,
      });
      
      res.status(201).json(newCase);
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });
  
  app.put("/api/cases/:id", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = updateCaseSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid case data",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, parseResult.data);
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating case:", error);
      res.status(500).json({ message: "Failed to update case" });
    }
  });
  
  app.delete("/api/cases/:id", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Delete the case
      const deleted = await storage.deleteCase(caseId);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete case" });
      }
    } catch (error) {
      console.error("Error deleting case:", error);
      res.status(500).json({ message: "Failed to delete case" });
    }
  });
  
  // Section-specific update routes
  app.put("/api/cases/:id/claimant-details", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = claimantDetailsSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid claimant details",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        claimantDetails: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating claimant details:", error);
      res.status(500).json({ message: "Failed to update claimant details" });
    }
  });
  
  app.put("/api/cases/:id/accident-details", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = accidentDetailsSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid accident details",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        accidentDetails: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating accident details:", error);
      res.status(500).json({ message: "Failed to update accident details" });
    }
  });
  
  app.put("/api/cases/:id/physical-injury", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = physicalInjurySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid physical injury details",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        physicalInjuryDetails: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating physical injury details:", error);
      res.status(500).json({ message: "Failed to update physical injury details" });
    }
  });
  
  app.put("/api/cases/:id/psychological-injuries", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = psychologicalInjuriesSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid psychological injuries data",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        psychologicalInjuries: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating psychological injuries:", error);
      res.status(500).json({ message: "Failed to update psychological injuries" });
    }
  });
  
  app.put("/api/cases/:id/treatments", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = treatmentsSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid treatments data",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        treatments: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating treatments:", error);
      res.status(500).json({ message: "Failed to update treatments" });
    }
  });
  
  app.put("/api/cases/:id/lifestyle-impact", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = lifestyleImpactSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid lifestyle impact data",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        lifestyleImpact: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating lifestyle impact:", error);
      res.status(500).json({ message: "Failed to update lifestyle impact" });
    }
  });
  
  app.put("/api/cases/:id/family-history", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = familyHistorySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid family history data",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        familyHistory: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating family history:", error);
      res.status(500).json({ message: "Failed to update family history" });
    }
  });
  
  app.put("/api/cases/:id/work-history", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = workHistorySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid work history data",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        workHistory: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating work history:", error);
      res.status(500).json({ message: "Failed to update work history" });
    }
  });
  
  app.put("/api/cases/:id/prognosis", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = prognosisSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid prognosis data",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        prognosis: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating prognosis:", error);
      res.status(500).json({ message: "Failed to update prognosis" });
    }
  });
  
  app.put("/api/cases/:id/expert-details", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Parse and validate the request body
      const parseResult = expertDetailsSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Invalid expert details",
          errors: validationError.details
        });
      }
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        expertDetails: parseResult.data,
      });
      
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating expert details:", error);
      res.status(500).json({ message: "Failed to update expert details" });
    }
  });
  
  // Calculate and update completion percentage
  app.post("/api/cases/:id/calculate-completion", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Count completed sections
      let completedSections = 0;
      const totalSections = 10; // Total number of case sections
      
      if (existingCase.claimantDetails) completedSections++;
      if (existingCase.accidentDetails) completedSections++;
      if (existingCase.physicalInjuryDetails) completedSections++;
      if (existingCase.psychologicalInjuries) completedSections++;
      if (existingCase.treatments) completedSections++;
      if (existingCase.lifestyleImpact) completedSections++;
      if (existingCase.familyHistory) completedSections++;
      if (existingCase.workHistory) completedSections++;
      if (existingCase.prognosis) completedSections++;
      if (existingCase.expertDetails) completedSections++;
      
      const completionPercentage = Math.round((completedSections / totalSections) * 100);
      
      // Update the case
      const updatedCase = await storage.updateCase(caseId, {
        completionPercentage,
      });
      
      res.json({ completionPercentage });
    } catch (error) {
      console.error("Error calculating completion:", error);
      res.status(500).json({ message: "Failed to calculate completion percentage" });
    }
  });
  
  // PDF generation endpoint (server-side rendering of PDF)
  app.get("/api/cases/:id/pdf", async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      
      // Check if the case exists
      const existingCase = await storage.getCase(caseId);
      if (!existingCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // In a real application, we would generate the PDF here
      // For this demo, we'll just return the case data with a PDF generation message
      res.json({
        message: "PDF generation would happen here in a real application",
        caseData: existingCase
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
