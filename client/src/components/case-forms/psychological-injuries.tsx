import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Predefined list for common psychological symptoms
const commonPsychologicalSymptoms = [
  "Anxiety", "Depression", "PTSD", "Insomnia", "Flashbacks", "Nightmares", 
  "Irritability", "Difficulty Concentrating", "Social Withdrawal", "Mood Swings",
  "Panic Attacks", "Fear of Driving", "Emotional Distress"
];

// Predefined list for travel anxiety symptoms
const travelAnxietySymptoms = [
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
      psychologicalSymptoms: [],
      mentalHealthDiagnoses: [{ diagnosis: "", diagnosisDate: "", diagnosingProvider: "" }],
      traumaAssessment: "",
      travelAnxietySymptoms: [],
      travelAnxietyOnset: undefined,
      travelAnxietyInitialSeverity: undefined,
      travelAnxietyCurrentSeverity: undefined,
      travelAnxietyResolutionDays: "",
      additionalNotes: "",
    },
  });
  
  // Setup field array for diagnoses
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "mentalHealthDiagnoses",
  });
  
  // Check if form has been modified
  const isComplete = (form.watch("psychologicalSymptoms")?.length > 0) || 
                     (form.watch("mentalHealthDiagnoses")?.length > 0 && !!form.watch("mentalHealthDiagnoses")[0]?.diagnosis) || 
                     !!form.watch("traumaAssessment") ||
                     (form.watch("travelAnxietySymptoms")?.length > 0);
  
  const onSubmit = async (data: PsychologicalInjuries) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/psychological-injuries`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Psychological injuries saved",
        description: "Psychological injuries have been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving psychological injuries:", error);
      toast({
        title: "Error saving psychological injuries",
        description: "There was an error saving the psychological injuries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Psychological Injuries" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection title="Psychological Symptoms">
            <FormField
              control={form.control}
              name="psychologicalSymptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reported Symptoms</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonPsychologicalSymptoms.map((symptom) => (
                      <FormItem
                        key={symptom}
                        className="flex flex-row items-center space-x-2 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(symptom)}
                            onCheckedChange={(checked) => {
                              const updatedSymptoms = checked
                                ? [...(field.value || []), symptom]
                                : (field.value || []).filter(
                                    (val) => val !== symptom
                                  );
                              field.onChange(updatedSymptoms);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {symptom}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          <SubSection title="Mental Health Diagnoses">
            {fields.map((field, index) => (
              <div key={field.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-medium text-[#4A5568]">Diagnosis #{index + 1}</h4>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-sm text-red-600 hover:text-red-800 h-auto p-0"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`mentalHealthDiagnoses.${index}.diagnosis`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Post-Traumatic Stress Disorder" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`mentalHealthDiagnoses.${index}.diagnosisDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`mentalHealthDiagnoses.${index}.diagnosingProvider`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosing Provider</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. John Smith, Clinical Psychologist" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ diagnosis: "", diagnosisDate: "", diagnosingProvider: "" })}
              className="flex items-center text-sm font-medium text-[#0E7C7B] hover:text-teal-900"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Diagnosis
            </Button>
          </SubSection>
          
          <SubSection title="Trauma Assessment">
            <FormField
              control={form.control}
              name="traumaAssessment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trauma Assessment</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed assessment of psychological trauma related to the accident"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          <SubSection title="Travel Anxiety Symptoms">
            <FormField
              control={form.control}
              name="travelAnxietySymptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel Anxiety Symptoms</FormLabel>
                  <div className="flex flex-col gap-2 mt-2">
                    {travelAnxietySymptoms.map((symptom) => (
                      <FormItem
                        key={symptom}
                        className="flex flex-row items-center space-x-2 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(symptom)}
                            onCheckedChange={(checked) => {
                              const updatedSymptoms = checked
                                ? [...(field.value || []), symptom]
                                : (field.value || []).filter(
                                    (val) => val !== symptom
                                  );
                              field.onChange(updatedSymptoms);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {symptom}
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
                      placeholder="Any additional notes regarding psychological injuries"
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
              {saving ? "Saving..." : "Save Psychological Injuries"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
