import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { familyHistorySchema, type FamilyHistory } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, SubSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FamilyHistoryFormProps {
  caseId: number;
  initialData?: FamilyHistory;
  onSaved?: () => void;
}

export function FamilyHistoryForm({ caseId, initialData, onSaved }: FamilyHistoryFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<FamilyHistory>({
    resolver: zodResolver(familyHistorySchema),
    defaultValues: initialData || {
      // Previous road traffic accidents
      hasPreviousAccident: false,
      previousAccidentYear: "",
      previousAccidentRecovery: undefined,
      
      // Previous medical conditions
      hasPreviousMedicalCondition: false,
      previousMedicalConditionDetails: "",
      
      // Exceptional severity claim
      hasExceptionalSeverity: false,
      
      // Physiotherapy preference
      physiotherapyPreference: undefined,
      
      // Additional notes
      additionalNotes: "",
      
      // Summary
      medicalHistorySummary: "The claimant reports no previous road traffic accidents. The claimant has not reported any pre-existing medical conditions that have been exacerbated by this accident. The claimant does not report any exceptionally severe physical or psychological injuries."
    },
  });
  
  // Watch values for conditional fields
  const hasPreviousAccident = form.watch("hasPreviousAccident");
  const hasPreviousMedicalCondition = form.watch("hasPreviousMedicalCondition");
  
  // Generate medical history summary
  React.useEffect(() => {
    let summary = "";
    
    // Previous road traffic accidents
    if (hasPreviousAccident) {
      const year = form.watch("previousAccidentYear");
      const recovery = form.watch("previousAccidentRecovery");
      
      summary += `The claimant reports a previous road traffic accident in ${year || "a previous year"}`;
      if (recovery) {
        summary += ` with ${recovery.toLowerCase()} recovery`;
      }
      summary += ". ";
    } else {
      summary += "The claimant reports no previous road traffic accidents. ";
    }
    
    // Previous medical conditions
    if (hasPreviousMedicalCondition) {
      const condition = form.watch("previousMedicalConditionDetails");
      if (condition) {
        summary += `The claimant reports pre-existing medical conditions (${condition}) that have been exacerbated by this accident. `;
      } else {
        summary += "The claimant reports pre-existing medical conditions that have been exacerbated by this accident. ";
      }
    } else {
      summary += "The claimant has not reported any pre-existing medical conditions that have been exacerbated by this accident. ";
    }
    
    // Exceptional severity
    const hasExceptionalSeverity = form.watch("hasExceptionalSeverity");
    if (hasExceptionalSeverity) {
      summary += "The claimant reports exceptionally severe physical or psychological injuries. ";
    } else {
      summary += "The claimant does not report any exceptionally severe physical or psychological injuries. ";
    }
    
    // Physiotherapy preference
    const physiotherapyPreference = form.watch("physiotherapyPreference");
    if (physiotherapyPreference) {
      switch(physiotherapyPreference) {
        case "Yes":
          summary += "The claimant would prefer to have physiotherapy if offered.";
          break;
        case "No":
          summary += "The claimant would not prefer to have physiotherapy if offered.";
          break;
        case "Already ongoing":
          summary += "The claimant is already undergoing physiotherapy.";
          break;
        case "Already recovered":
          summary += "The claimant has already recovered and does not require physiotherapy.";
          break;
      }
    }
    
    form.setValue("medicalHistorySummary", summary);
  }, [
    hasPreviousAccident, 
    form.watch("previousAccidentYear"),
    form.watch("previousAccidentRecovery"),
    hasPreviousMedicalCondition,
    form.watch("previousMedicalConditionDetails"),
    form.watch("hasExceptionalSeverity"),
    form.watch("physiotherapyPreference"),
    form
  ]);
  
  // Check if form has been modified
  const isComplete = hasPreviousAccident !== undefined || 
                     hasPreviousMedicalCondition !== undefined || 
                     form.watch("hasExceptionalSeverity") !== undefined ||
                     form.watch("physiotherapyPreference") !== undefined;
  
  const onSubmit = async (data: FamilyHistory) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/family-history`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Medical history saved",
        description: "Past medical history information has been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving medical history:", error);
      toast({
        title: "Error saving medical history",
        description: "There was an error saving the medical history information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Past History of Accidents or Illness" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection title="Past Medical History">
            <FormDescription className="text-sm mb-4">
              Please provide information about any previous medical conditions or incidents
            </FormDescription>
            
            {/* Previous Road Traffic Accidents */}
            <FormField
              control={form.control}
              name="hasPreviousAccident"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Previous road traffic accident?</FormLabel>
                  <div className="flex items-center space-x-2 mt-2">
                    <FormControl>
                      <RadioGroup 
                        onValueChange={(value) => field.onChange(value === "true")} 
                        value={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {hasPreviousAccident && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2 space-y-4">
                <FormField
                  control={form.control}
                  name="previousAccidentYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What year?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter year of previous accident"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="previousAccidentRecovery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Did you recover completely/partially?</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value}
                          className="flex space-x-4 mt-2"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Complete" />
                            </FormControl>
                            <FormLabel className="font-normal">Complete</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Partial" />
                            </FormControl>
                            <FormLabel className="font-normal">Partial</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Previous Medical Conditions */}
            <FormField
              control={form.control}
              name="hasPreviousMedicalCondition"
              render={({ field }) => (
                <FormItem className="mt-6 mb-4">
                  <FormLabel>Any Previous medical conditions worsened by this accident?</FormLabel>
                  <div className="flex items-center space-x-2 mt-2">
                    <FormControl>
                      <RadioGroup 
                        onValueChange={(value) => field.onChange(value === "true")} 
                        value={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {hasPreviousMedicalCondition && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2">
                <FormField
                  control={form.control}
                  name="previousMedicalConditionDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter details if yes, what condition</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the pre-existing condition and how it's been affected"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Exceptional Severity */}
            <FormField
              control={form.control}
              name="hasExceptionalSeverity"
              render={({ field }) => (
                <FormItem className="mt-6 mb-4">
                  <FormLabel>Do you want to claim that your physical or psychological injuries are Exceptionally severe?</FormLabel>
                  <div className="flex items-center space-x-2 mt-2">
                    <FormControl>
                      <RadioGroup 
                        onValueChange={(value) => field.onChange(value === "true")} 
                        value={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Physiotherapy Preference */}
            <FormField
              control={form.control}
              name="physiotherapyPreference"
              render={({ field }) => (
                <FormItem className="mt-6 mb-4">
                  <FormLabel>Would you prefer to have physiotherapy if offered?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      value={field.value}
                      className="flex flex-col space-y-2 mt-2"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="No" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Already ongoing" />
                        </FormControl>
                        <FormLabel className="font-normal">Already ongoing</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Already recovered" />
                        </FormControl>
                        <FormLabel className="font-normal">Already recovered</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>Is there anything else you want to add?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional information you'd like to include"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          {/* Medical History Summary */}
          <SubSection title="Summary">
            <FormField
              control={form.control}
              name="medicalHistorySummary"
              render={({ field }) => (
                <FormItem>
                  <div className="p-4 border rounded-md bg-muted/30">
                    <p className="text-sm leading-relaxed">{field.value}</p>
                  </div>
                  <FormDescription className="text-xs mt-2">
                    This medical history summary is generated automatically based on your responses.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Medical History"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}