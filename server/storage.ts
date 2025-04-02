import { 
  users, 
  cases, 
  type User, 
  type InsertUser, 
  type Case, 
  type InsertCase,
  type UpdateCase
} from "@shared/schema";
import { db } from './db';
import { eq, desc, like, sql, and } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Case operations
  getCase(id: number): Promise<Case | undefined>;
  getCaseByNumber(caseNumber: string): Promise<Case | undefined>;
  getCases(userId?: number): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, caseData: Partial<UpdateCase>): Promise<Case>;
  deleteCase(id: number): Promise<boolean>;
  
  // Generate a unique case number
  generateCaseNumber(): Promise<string>;
}

// PostgreSQL database implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Case operations
  async getCase(id: number): Promise<Case | undefined> {
    const [foundCase] = await db.select().from(cases).where(eq(cases.id, id));
    return foundCase;
  }
  
  async getCaseByNumber(caseNumber: string): Promise<Case | undefined> {
    const [foundCase] = await db.select().from(cases).where(eq(cases.caseNumber, caseNumber));
    return foundCase;
  }
  
  async getCases(userId?: number): Promise<Case[]> {
    if (userId) {
      return await db.select().from(cases).where(eq(cases.userId, userId));
    }
    return await db.select().from(cases).orderBy(desc(cases.updatedAt));
  }
  
  async createCase(caseData: InsertCase): Promise<Case> {
    const now = new Date();
    
    const newCaseData = {
      ...caseData,
      createdAt: now,
      updatedAt: now,
    };
    
    const [newCase] = await db.insert(cases).values(newCaseData).returning();
    return newCase;
  }
  
  async updateCase(id: number, caseData: Partial<UpdateCase>): Promise<Case> {
    const [updatedCase] = await db
      .update(cases)
      .set({
        ...caseData,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, id))
      .returning();
    
    if (!updatedCase) {
      throw new Error(`Case with ID ${id} not found`);
    }
    
    return updatedCase;
  }
  
  async deleteCase(id: number): Promise<boolean> {
    const result = await db.delete(cases).where(eq(cases.id, id)).returning({ id: cases.id });
    return result.length > 0;
  }
  
  // Generate a unique case number in the format MED-YYYY-XXX
  async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const yearStr = year.toString();
    
    // Get the cases with the current year prefix
    const existingCases = await db
      .select()
      .from(cases)
      .where(like(cases.caseNumber, `MED-${yearStr}-%`));
    
    let highestNumber = 0;
    
    if (existingCases.length > 0) {
      existingCases.forEach(c => {
        const parts = c.caseNumber.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > highestNumber) {
            highestNumber = num;
          }
        }
      });
    }
    
    const nextNumber = highestNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    return `MED-${yearStr}-${formattedNumber}`;
  }
}

// Create an instance of the database storage - now using PostgreSQL
export const storage = new DatabaseStorage();

// Memory storage implementation kept for reference only
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cases: Map<number, Case>;
  private userCurrentId: number;
  private caseCurrentId: number;
  
  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.userCurrentId = 1;
    this.caseCurrentId = 1;
    
    // Initialize with a default user
    this.createUser({
      username: "doctor",
      password: "password123",
      fullName: "Dr. Sarah Johnson",
      role: "doctor"
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'user'  // Ensure role is never undefined
    };
    this.users.set(id, user);
    return user;
  }
  
  // Case operations
  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }
  
  async getCaseByNumber(caseNumber: string): Promise<Case | undefined> {
    return Array.from(this.cases.values()).find(
      (c) => c.caseNumber === caseNumber,
    );
  }
  
  async getCases(userId?: number): Promise<Case[]> {
    if (userId) {
      return Array.from(this.cases.values()).filter(c => c.userId === userId);
    }
    return Array.from(this.cases.values());
  }
  
  async createCase(caseData: InsertCase): Promise<Case> {
    const id = this.caseCurrentId++;
    const now = new Date();
    
    const newCase: Case = {
      ...caseData,
      id,
      createdAt: now,
      updatedAt: now,
      status: caseData.status || 'in_progress',
      claimantDetails: caseData.claimantDetails || {},
      accidentDetails: caseData.accidentDetails || {},
      physicalInjuryDetails: caseData.physicalInjuryDetails || {},
      psychologicalInjuries: caseData.psychologicalInjuries || {},
      treatments: caseData.treatments || {},
      lifestyleImpact: caseData.lifestyleImpact || {},
      familyHistory: caseData.familyHistory || {},
      workHistory: caseData.workHistory || {},
      prognosis: caseData.prognosis || {},
      expertDetails: caseData.expertDetails || {},
      completionPercentage: caseData.completionPercentage || 0
    };
    
    this.cases.set(id, newCase);
    return newCase;
  }
  
  async updateCase(id: number, caseData: Partial<UpdateCase>): Promise<Case> {
    const existingCase = await this.getCase(id);
    
    if (!existingCase) {
      throw new Error(`Case with ID ${id} not found`);
    }
    
    const updatedCase: Case = {
      ...existingCase,
      ...caseData,
      updatedAt: new Date(),
    };
    
    this.cases.set(id, updatedCase);
    return updatedCase;
  }
  
  async deleteCase(id: number): Promise<boolean> {
    return this.cases.delete(id);
  }
  
  // Generate a unique case number in the format MED-YYYY-XXX
  async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    
    // Get the highest case number for the current year
    const existingCases = Array.from(this.cases.values())
      .filter(c => c.caseNumber.includes(`MED-${year}`));
      
    let highestNumber = 0;
    
    if (existingCases.length > 0) {
      existingCases.forEach(c => {
        const parts = c.caseNumber.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > highestNumber) {
            highestNumber = num;
          }
        }
      });
    }
    
    const nextNumber = highestNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    return `MED-${year}-${formattedNumber}`;
  }
}
