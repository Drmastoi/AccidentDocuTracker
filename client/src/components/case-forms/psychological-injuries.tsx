import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { psychologicalInjuriesSchema, type PsychologicalInjuries } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Predefined list for travel anxiety symptoms
const travelAnxietySymptomOptions = [
  "Being a more cautious driver",
  "Looking in the mirror more frequently / checking over shoulders",
  "Avoiding the road where the accident happened",
  "Avoiding being a passenger in a car",
  "Avoiding driving a car",
  "Getting panic attacks when in a car",
  "Anxiety when traveling as a passenger",
  "Anxiety on busy roads or highways",
  "Prevented from driving for leisure or work",
  "Other"
];

interface PsychologicalInjuriesFormProps {
  caseId: number;
  initialData?: PsychologicalInjuries;
  onSaved?: () => void;
}

export function PsychologicalInjuriesForm({ caseId, initialData, onSaved }: PsychologicalInjuriesFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<PsychologicalInjuries>({
    resolver: zodResolver(psychologicalInjuriesSchema),
    defaultValues: initialData || {
      travelAnxietySymptoms: [],
      travelAnxietyOnset: undefined,
      travelAnxietyInitialSeverity: undefined,
      travelAnxietyCurrentSeverity: undefined,
      travelAnxietyResolutionDays: "",
      additionalNotes: "",
    },
  });
  
  // Check if form has been modified
  const symptoms = form.watch("travelAnxietySymptoms");
  const isComplete = Array.isArray(symptoms) && symptoms.length > 0;
  
  const onSubmit = async (data: PsychologicalInjuries) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/psychological-injuries`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Travel anxiety details saved",
        description: "Travel anxiety details have been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving travel anxiety details:", error);
      toast({
        title: "Error saving travel anxiety details",
        description: "There was an error saving the travel anxiety details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Travel Anxiety" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          
          <SubSection title="Travel Anxiety Symptoms">
            <FormField
              control={form.control}
              name="travelAnxietySymptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel Anxiety Symptoms</FormLabel>
                  <div className="flex flex-col gap-2 mt-2">
                    {travelAnxietySymptomOptions.map((option) => (
                      <FormItem
                        key={option}
                        className="flex flex-row items-center space-x-2 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              const updatedValues = checked
                                ? [...currentValues, option]
                                : currentValues.filter(val => val !== option);
                              field.onChange(updatedValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <FormField
                  control={form.control}
                  name="travelAnxietyOnset"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>When did your travel anxiety start?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Same Day" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Same day
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Next Day" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Next Day
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Few Days Later" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Few days Later
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="travelAnxietyInitialSeverity"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Initial Severity of travel anxiety</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Mild" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Mild
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Moderate" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Moderate
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Severe" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Severe
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="travelAnxietyCurrentSeverity"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Current Severity of travel anxiety</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Mild" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Mild
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Moderate" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Moderate
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Severe" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Severe
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Resolved" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Resolved
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {form.watch("travelAnxietyCurrentSeverity") === "Resolved" && (
                <div>
                  <FormField
                    control={form.control}
                    name="travelAnxietyResolutionDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days until resolution</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
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
                      placeholder="Any additional notes regarding travel anxiety"
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
              {saving ? "Saving..." : "Save Travel Anxiety Details"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
