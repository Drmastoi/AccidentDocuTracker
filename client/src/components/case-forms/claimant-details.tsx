import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClaimantDetails, claimantDetailsSchema } from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FormSection, SubSection } from "@/components/ui/form-section";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Define the props for the form component
interface ClaimantDetailsFormProps {
  caseId: number;
  initialData?: ClaimantDetails;
  onSaved?: () => void;
}

/**
 * Form component for editing claimant details
 */
export function ClaimantDetailsForm({ caseId, initialData, onSaved }: ClaimantDetailsFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<ClaimantDetails>({
    resolver: zodResolver(claimantDetailsSchema),
    defaultValues: initialData || {
      fullName: "",
      dateOfBirth: "",
      age: undefined,
      gender: "Not specified",
      address: "",
      postCode: "",
      identification: {
        type: "Passport",
      },
      accompaniedBy: "Alone",
      // Default date of report to today's date as requested
      dateOfReport: new Date().toISOString().split('T')[0],
      dateOfExamination: "",
      timeSpent: "15 min",
      helpWithCommunication: false,
      placeOfExamination: "Face to Face at Meeting Room, North, Ibis, Garstang Rd, Preston PR3 5JE",
      phone: "",
      email: "",
      // New fields added
      instructingParty: "",
      instructingPartyRef: "",
      solicitorName: "",
      referenceNumber: "",
      medcoRefNumber: "",
    },
  });
  
  // Check if required fields are filled
  const isComplete = !!form.watch("fullName") && !!form.watch("dateOfBirth");
  
  // Count missing required fields
  const getMissingFieldsCount = () => {
    let count = 0;
    if (!form.watch("fullName")) count++;
    if (!form.watch("dateOfBirth")) count++;
    return count;
  };
  
  const onSubmit = async (data: ClaimantDetails) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/claimant-details`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Claimant details saved",
        description: "Claimant details have been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving claimant details:", error);
      toast({
        title: "Error saving claimant details",
        description: "There was an error saving the claimant details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Claimant Details" 
      isComplete={isComplete}
      missingFields={getMissingFieldsCount()}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Not specified">Not specified</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="35" 
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Accident Date field removed - moved to Accident Details section only */}
            </div>

            <div className="grid grid-cols-1 gap-6 mt-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="123 High Street"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormField
                control={form.control}
                name="postCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Code</FormLabel>
                    <FormControl>
                      <Input placeholder="PR3 5JE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="07700 900000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.smith@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Occupation field removed as requested */}
            </div>
          </SubSection>
          
          <SubSection title="Identification">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="identification.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identification Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="Driving Licence">Driving Licence</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>

          <SubSection title="Legal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="instructingParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Instructing Party</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Legal Services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instructingPartyRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference of IP</FormLabel>
                    <FormControl>
                      <Input placeholder="IP123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="solicitorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Solicitor</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="REF123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="medcoRefNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MedCo Ref Number</FormLabel>
                    <FormControl>
                      <Input placeholder="MEDCO123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>

          <SubSection title="Examination Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dateOfExamination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Examination</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateOfReport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Report</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accompaniedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accompanied By</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select who accompanied" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Alone">Alone</SelectItem>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeSpent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Spent</FormLabel>
                    <FormControl>
                      <Input placeholder="15 min" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>Default: 15 min</FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="helpWithCommunication"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Help with Communication</FormLabel>
                      <FormDescription>Does the claimant need help with communication?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="placeOfExamination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Examination</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-20">
                          <SelectValue placeholder="Select examination location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Face to Face at Meeting Room, North, Ibis, Garstang Rd, Preston PR3 5JE">
                          Face to Face at Meeting Room, North, Ibis, Garstang Rd, Preston PR3 5JE
                        </SelectItem>
                        <SelectItem value="Regus Office, Centenary Way, Salford M50 1RF">
                          Regus Office, Centenary Way, Salford M50 1RF
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>
          
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Claimant Details"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}