import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { physicalInjurySchema, type PhysicalInjury } from "@shared/schema";
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
import { Slider } from "@/components/ui/slider";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Predefined lists for common injuries and symptoms
const commonInjuryLocations = [
  "Neck", "Back", "Shoulder", "Arm", "Elbow", "Wrist", "Hand", "Hip", "Knee", "Ankle", "Foot", "Head"
];

const commonSymptoms = [
  "Pain", "Swelling", "Bruising", "Limited Range of Motion", "Numbness", "Tingling", 
  "Headache", "Dizziness", "Nausea", "Fatigue", "Blurred Vision", "Memory Issues"
];

interface PhysicalInjuryFormProps {
  caseId: number;
  initialData?: PhysicalInjury;
  onSaved?: () => void;
}

export function PhysicalInjuryForm({ caseId, initialData, onSaved }: PhysicalInjuryFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<PhysicalInjury>({
    resolver: zodResolver(physicalInjurySchema),
    defaultValues: initialData || {
      initialComplaints: "",
      initialTreatment: "",
      diagnoses: [{ diagnosis: "", diagnosisDate: "", diagnosingPhysician: "" }],
      injuryLocations: [],
      painScale: 0,
      symptoms: [],
      additionalNotes: "",
    },
  });
  
  // Setup field array for diagnoses
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "diagnoses",
  });
  
  // Check if form has been modified
  const isComplete = !!form.watch("initialComplaints") || 
                     (form.watch("diagnoses")?.length > 0 && !!form.watch("diagnoses")[0].diagnosis);
  
  const onSubmit = async (data: PhysicalInjury) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/physical-injury`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Physical injury details saved",
        description: "Physical injury details have been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving physical injury details:", error);
      toast({
        title: "Error saving physical injury details",
        description: "There was an error saving the physical injury details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Physical Injury Details" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="initialComplaints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Complaints</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the initial complaints reported by the claimant"
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
                name="initialTreatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Treatment</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the initial treatment received"
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
          
          <SubSection title="Pain & Symptoms">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="painScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Scale (0-10)</FormLabel>
                    <div className="pt-2">
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            defaultValue={[field.value || 0]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>No Pain (0)</span>
                            <span>Moderate (5)</span>
                            <span>Severe (10)</span>
                          </div>
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="injuryLocations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Injury Locations</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonInjuryLocations.map((location) => (
                        <FormItem
                          key={location}
                          className="flex flex-row items-center space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(location)}
                              onCheckedChange={(checked) => {
                                const updatedLocations = checked
                                  ? [...(field.value || []), location]
                                  : (field.value || []).filter(
                                      (val) => val !== location
                                    );
                                field.onChange(updatedLocations);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {location}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonSymptoms.map((symptom) => (
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
            </div>
          </SubSection>
          
          <SubSection title="Diagnoses">
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
                    name={`diagnoses.${index}.diagnosis`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cervical Strain" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`diagnoses.${index}.diagnosisDate`}
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
                      name={`diagnoses.${index}.diagnosingPhysician`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosing Physician</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Jane Smith" {...field} />
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
              onClick={() => append({ diagnosis: "", diagnosisDate: "", diagnosingPhysician: "" })}
              className="flex items-center text-sm font-medium text-[#0E7C7B] hover:text-teal-900"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Diagnosis
            </Button>
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
                      placeholder="Any additional notes regarding physical injuries"
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
              {saving ? "Saving..." : "Save Physical Injury Details"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
