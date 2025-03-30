import React, { useState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { physicalInjurySchema, type PhysicalInjury } from "@shared/schema";
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
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

// Injury types the user can select
const injuryTypes = [
  "Neck", 
  "Upper Back / Shoulders", 
  "Lower Back", 
  "Bruising", 
  "Headaches",
  "Other"
];

interface PhysicalInjuryFormProps {
  caseId: number;
  initialData?: PhysicalInjury;
  onSaved?: () => void;
}

export function PhysicalInjuryForm({ caseId, initialData, onSaved }: PhysicalInjuryFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showOtherInjuryField, setShowOtherInjuryField] = useState(false);
  
  // Set up form with validation schema
  const form = useForm<PhysicalInjury>({
    resolver: zodResolver(physicalInjurySchema),
    defaultValues: initialData || {
      injuries: [],
      otherInjuriesDescription: "",
      additionalNotes: "",
    },
  });
  
  // Setup field array for injuries
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "injuries",
  });
  
  // Check if at least one injury is selected
  const isComplete = (form.watch("injuries")?.length > 0);
  
  // Get missing fields count
  const getMissingFieldsCount = () => {
    return form.watch("injuries")?.length > 0 ? 0 : 1;
  };

  // Handle adding a new injury when a checkbox is checked
  const handleInjurySelection = (injuryType: string, isChecked: boolean) => {
    if (isChecked) {
      // Set mechanism and classification based on injury type
      let mechanism = "";
      let classification = "";
      
      if (injuryType === "Neck" || injuryType === "Upper Back / Shoulders" || injuryType === "Lower Back") {
        mechanism = "Due to sudden jolt during the accident";
        classification = "Whiplash injury";
      } else if (injuryType === "Bruising") {
        mechanism = "Due to seat belt";
        classification = "Soft tissue injury";
      } else if (injuryType === "Headaches") {
        mechanism = "Due to sudden jolt during the accident";
        classification = "Whiplash associated injury";
      } else {
        mechanism = ""; // Will be filled by user for "Other" injuries
        classification = "Soft tissue injury";
      }
      
      // Add a new injury to the form
      append({
        type: injuryType as any,
        description: "",
        onsetTime: "Same Day",
        initialSeverity: "Mild",
        currentSeverity: "Mild",
        resolutionDays: "",
        mechanism,
        classification
      });
      
      // Show the "Other" description field if "Other" is selected
      if (injuryType === "Other") {
        setShowOtherInjuryField(true);
      }
    } else {
      // Remove the injury when unchecked
      const indexToRemove = form.getValues().injuries?.findIndex(injury => injury.type === injuryType);
      if (indexToRemove !== undefined && indexToRemove !== -1) {
        remove(indexToRemove);
      }
      
      // Hide the "Other" description field if "Other" is unchecked
      if (injuryType === "Other") {
        setShowOtherInjuryField(false);
      }
    }
  };
  
  // Update mechanism field when "Other" injury description changes
  useEffect(() => {
    const otherInjuryIndex = form.getValues().injuries?.findIndex(injury => injury.type === "Other");
    if (otherInjuryIndex !== undefined && otherInjuryIndex !== -1) {
      const otherDesc = form.getValues().otherInjuriesDescription;
      if (otherDesc) {
        const updatedInjury = {...form.getValues().injuries[otherInjuryIndex]};
        updatedInjury.mechanism = otherDesc;
        update(otherInjuryIndex, updatedInjury);
      }
    }
  }, [form.watch("otherInjuriesDescription")]);
  
  // Handle showing resolution days field when an injury is "Resolved"
  const handleSeverityChange = (index: number, value: string) => {
    if (value === "Resolved") {
      // Focus on the resolution days field
      setTimeout(() => {
        const resolutionField = document.getElementById(`resolution-days-${index}`);
        if (resolutionField) {
          resolutionField.focus();
        }
      }, 100);
    }
  };

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
      missingFields={getMissingFieldsCount()}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection title="Injuries Sustained from the Accident">
            <FormDescription className="mb-4">
              Select all injuries that were sustained from the accident
            </FormDescription>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {injuryTypes.map((injuryType) => (
                <div key={injuryType} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`injury-${injuryType}`}
                    checked={form.getValues().injuries?.some(injury => injury.type === injuryType)}
                    onCheckedChange={(checked) => handleInjurySelection(injuryType, !!checked)}
                    className="mt-1"
                  />
                  <div>
                    <label 
                      htmlFor={`injury-${injuryType}`} 
                      className="font-medium cursor-pointer"
                    >
                      {injuryType}
                    </label>
                    {injuryType === "Other" && showOtherInjuryField && (
                      <FormField
                        control={form.control}
                        name="otherInjuriesDescription"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe other injuries" 
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SubSection>
          
          {fields.length > 0 && (
            <SubSection title="Injury Details">
              {fields.map((field, index) => (
                <Card key={field.id} className="mb-6 shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-[#0E7C7B]">
                      {field.type} {field.type === "Other" && form.watch("otherInjuriesDescription") ? `- ${form.watch("otherInjuriesDescription")}` : ""}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name={`injuries.${index}.onsetTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>When did this injury start?</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select onset time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Same Day">Same Day</SelectItem>
                                <SelectItem value="Next Day">Next Day</SelectItem>
                                <SelectItem value="Few Days Later">Few Days Later</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`injuries.${index}.initialSeverity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Severity</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select initial severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mild">Mild</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Severe">Severe</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`injuries.${index}.currentSeverity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Severity</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleSeverityChange(index, value);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select current severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mild">Mild</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Severe">Severe</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch(`injuries.${index}.currentSeverity`) === "Resolved" && (
                        <FormField
                          control={form.control}
                          name={`injuries.${index}.resolutionDays`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Days to Resolution</FormLabel>
                              <FormControl>
                                <Input 
                                  id={`resolution-days-${index}`}
                                  placeholder="How many days did it take to resolve?" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-2">
                      <FormField
                        control={form.control}
                        name={`injuries.${index}.mechanism`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mechanism</FormLabel>
                            <FormControl>
                              <Input 
                                readOnly={field.type !== "Other"}
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {field.type === "Other" ? "Please describe the mechanism of injury" : "This field is automatically generated based on the injury type"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`injuries.${index}.classification`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classification</FormLabel>
                            <FormControl>
                              <Input readOnly value={field.value} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              This field is automatically generated based on the injury type
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </SubSection>
          )}
          
          <SubSection>
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes regarding the physical injuries"
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
