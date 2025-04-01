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
      physicalInjurySummary: "",
    },
  });
  
  // Setup field array for injuries
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "injuries",
  });
  
  // Check if at least one injury is selected
  const isComplete = ((form.watch("injuries") || []).length > 0);
  
  // Get missing fields count
  const getMissingFieldsCount = () => {
    return (form.watch("injuries") || []).length > 0 ? 0 : 1;
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
      const injuries = form.getValues().injuries || [];
      const indexToRemove = injuries.findIndex(injury => injury.type === injuryType);
      if (indexToRemove !== -1) {
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
    const injuries = form.getValues().injuries || [];
    const otherInjuryIndex = injuries.findIndex(injury => injury.type === "Other");
    if (otherInjuryIndex !== -1) {
      const otherDesc = form.getValues().otherInjuriesDescription || "";
      const updatedInjury = {...injuries[otherInjuryIndex]};
      updatedInjury.mechanism = otherDesc;
      update(otherInjuryIndex, updatedInjury);
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
  
  // Generate a summary of all physical injuries
  const generateSummary = () => {
    const injuries = form.watch("injuries") || [];
    if (injuries.length === 0) {
      return "No physical injuries have been recorded.";
    }
    
    // Count injuries by current severity
    const severityCounts = {
      Mild: 0,
      Moderate: 0,
      Severe: 0,
      Resolved: 0
    };
    
    // Group by injury type
    const injuryTypes: Record<string, any[]> = {};
    
    injuries.forEach(injury => {
      // Add to severity counts
      severityCounts[injury.currentSeverity as keyof typeof severityCounts]++;
      
      // Add to injury types
      if (!injuryTypes[injury.type]) {
        injuryTypes[injury.type] = [];
      }
      injuryTypes[injury.type].push(injury);
    });
    
    // Create summary text
    let summary = `The claimant has reported ${injuries.length} physical ${injuries.length === 1 ? 'injury' : 'injuries'} from the accident. `;
    
    // Add summary of injury types
    const typesList = Object.keys(injuryTypes).map(type => {
      const count = injuryTypes[type].length;
      return count > 1 ? `${count} ${type.toLowerCase()} injuries` : `${type.toLowerCase()} injury`;
    }).join(", ");
    
    summary += `These include ${typesList}. `;
    
    // Add onset timing information
    const sameDay = injuries.filter(i => i.onsetTime === "Same Day").length;
    const nextDay = injuries.filter(i => i.onsetTime === "Next Day").length;
    const fewDaysLater = injuries.filter(i => i.onsetTime === "Few Days Later").length;
    
    if (sameDay > 0) {
      summary += `${sameDay} ${sameDay === 1 ? 'injury' : 'injuries'} developed on the same day of the accident. `;
    }
    
    if (nextDay > 0) {
      summary += `${nextDay} ${nextDay === 1 ? 'injury' : 'injuries'} developed the day after the accident. `;
    }
    
    if (fewDaysLater > 0) {
      summary += `${fewDaysLater} ${fewDaysLater === 1 ? 'injury' : 'injuries'} developed a few days after the accident. `;
    }
    
    // Add severity information
    if (severityCounts.Resolved > 0) {
      summary += `${severityCounts.Resolved} ${severityCounts.Resolved === 1 ? 'injury has' : 'injuries have'} completely resolved. `;
    }
    
    const ongoingInjuries = severityCounts.Mild + severityCounts.Moderate + severityCounts.Severe;
    if (ongoingInjuries > 0) {
      summary += `The claimant continues to experience ${ongoingInjuries} ${ongoingInjuries === 1 ? 'injury' : 'injuries'} `;
      
      const severityDescriptions = [];
      if (severityCounts.Mild > 0) {
        severityDescriptions.push(`${severityCounts.Mild} mild`);
      }
      if (severityCounts.Moderate > 0) {
        severityDescriptions.push(`${severityCounts.Moderate} moderate`);
      }
      if (severityCounts.Severe > 0) {
        severityDescriptions.push(`${severityCounts.Severe} severe`);
      }
      
      summary += `(${severityDescriptions.join(", ")}). `;
    }
    
    // Update form with generated summary
    setTimeout(() => {
      form.setValue("physicalInjurySummary", summary);
    }, 0);
    
    return summary;
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
                    checked={(form.getValues().injuries || []).some(injury => injury.type === injuryType)}
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
                        render={({ field }) => {
                          const injuryType = form.getValues().injuries?.[index]?.type;
                          return (
                            <FormItem>
                              <FormLabel>Mechanism</FormLabel>
                              <FormControl>
                                <Input 
                                  readOnly={injuryType !== "Other"}
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                {injuryType === "Other" ? "Please describe the mechanism of injury" : "This field is automatically generated based on the injury type"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
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
          
          {fields.length > 0 && (
            <SubSection title="Summary">
              <FormField
                control={form.control}
                name="physicalInjurySummary"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-end mb-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const summary = generateSummary();
                          field.onChange(summary);
                        }}
                      >
                        Regenerate Summary
                      </Button>
                    </div>
                    <div className="p-4 border rounded-md bg-muted/30">
                      <p className="text-sm leading-relaxed">{field.value || generateSummary()}</p>
                    </div>
                    <FormDescription className="text-xs mt-2">
                      This physical injury summary is generated automatically based on your selections. You can click the button above to regenerate it at any time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SubSection>
          )}
          
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
