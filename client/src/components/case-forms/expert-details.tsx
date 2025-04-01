import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expertDetailsSchema, type ExpertDetails } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, SubSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExpertDetailsFormProps {
  caseId: number;
  initialData?: ExpertDetails;
  onSaved?: () => void;
}

export function ExpertDetailsForm({ caseId, initialData, onSaved }: ExpertDetailsFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<ExpertDetails>({
    resolver: zodResolver(expertDetailsSchema),
    defaultValues: initialData || {
      examiner: "Dr. Awais Iqbal",
      credentials: "MBBS, Direct Medical Expert",
      licensureState: "UK",
      licenseNumber: "",
      specialty: "Medico-legal practitioner",
      experienceYears: undefined,
      contactInformation: "Direct Medical Expert",
      signatureDate: new Date().toISOString().split('T')[0],
    },
  });
  
  // Check if required fields are filled
  const isComplete = !!form.watch("examiner") && !!form.watch("credentials");
  
  // Count missing required fields
  const getMissingFieldsCount = () => {
    let count = 0;
    if (!form.watch("examiner")) count++;
    if (!form.watch("credentials")) count++;
    return count;
  };
  
  const onSubmit = async (data: ExpertDetails) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/expert-details`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Expert details saved",
        description: "Medical expert details have been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving expert details:", error);
      toast({
        title: "Error saving expert details",
        description: "There was an error saving the medical expert details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Medical Expert Details" 
      isComplete={isComplete}
      missingFields={getMissingFieldsCount()}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="examiner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Examiner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Sarah Johnson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="credentials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credentials</FormLabel>
                    <FormControl>
                      <Input placeholder="MD, FAAOS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <FormControl>
                      <Input placeholder="Orthopedic Surgery" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="15"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value !== "" ? parseInt(e.target.value, 10) : undefined;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>
          
          <SubSection title="License Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="licensureState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Licensure State</FormLabel>
                    <FormControl>
                      <Input placeholder="Massachusetts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="MA12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>
          
          <SubSection title="Contact & Signature">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="contactInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Address, phone, email, etc."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="signatureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signature Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>
          
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Expert Details"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
