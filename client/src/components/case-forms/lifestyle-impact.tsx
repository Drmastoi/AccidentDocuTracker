import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lifestyleImpactSchema, type LifestyleImpact } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, SubSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LifestyleImpactFormProps {
  caseId: number;
  initialData?: LifestyleImpact;
  onSaved?: () => void;
}

export function LifestyleImpactForm({ caseId, initialData, onSaved }: LifestyleImpactFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<LifestyleImpact>({
    resolver: zodResolver(lifestyleImpactSchema),
    defaultValues: initialData || {
      adl: "",
      workImpact: "",
      recreationalImpact: "",
      socialImpact: "",
      sleepImpact: "",
      additionalNotes: "",
    },
  });
  
  // Check if form has been modified
  const isComplete = !!form.watch("adl") || 
                     !!form.watch("workImpact") || 
                     !!form.watch("recreationalImpact") || 
                     !!form.watch("socialImpact") || 
                     !!form.watch("sleepImpact");
  
  const onSubmit = async (data: LifestyleImpact) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/lifestyle-impact`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Lifestyle impact saved",
        description: "Lifestyle impact information has been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving lifestyle impact:", error);
      toast({
        title: "Error saving lifestyle impact",
        description: "There was an error saving the lifestyle impact information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Impact on Lifestyle" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection>
            <FormField
              control={form.control}
              name="adl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activities of Daily Living (ADL)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how the accident has affected the claimant's ability to perform activities of daily living (bathing, dressing, eating, etc.)"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          <SubSection title="Work & Social Impact">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="workImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact on Work</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how the accident has affected the claimant's ability to work, including time off, reduced hours, limitations, etc."
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
                name="socialImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact on Social Life</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how the accident has affected the claimant's social life and interactions"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>
          
          <SubSection title="Recreational & Sleep Impact">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="recreationalImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact on Recreational Activities</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how the accident has affected the claimant's ability to participate in hobbies, sports, and recreational activities"
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
                name="sleepImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact on Sleep</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how the accident has affected the claimant's sleep patterns and quality"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>
          
          <SubSection>
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes regarding the impact of the accident on the claimant's lifestyle"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Lifestyle Impact"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
