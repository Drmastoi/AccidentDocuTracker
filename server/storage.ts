import { 
  users, 
  cases, 
  type User, 
  type InsertUser, 
  type Case, 
  type InsertCase,
  type UpdateCase
} from "@shared/schema";

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
    const user: User = { ...insertUser, id };
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

export const storage = new MemStorage();
