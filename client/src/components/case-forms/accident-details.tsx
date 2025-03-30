import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accidentDetailsSchema, type AccidentDetails } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, SubSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AccidentDetailsFormProps {
  caseId: number;
  initialData?: AccidentDetails;
  onSaved?: () => void;
}

export function AccidentDetailsForm({ caseId, initialData, onSaved }: AccidentDetailsFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<AccidentDetails>({
    resolver: zodResolver(accidentDetailsSchema),
    defaultValues: initialData || {
      accidentDate: "",
      accidentTime: "",
      accidentLocation: "",
      weatherConditions: "clear",
      accidentType: "",
      accidentDescription: "",
      policeReportFiled: false,
      reportNumber: "",
      reportingOfficer: "",
      witnesses: [{ name: "", phone: "", statement: "" }],
    },
  });
  
  // Setup field array for witnesses
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "witnesses",
  });
  
  // Check if required fields are filled
  const isComplete = !!form.watch("accidentDate") && 
                    !!form.watch("accidentLocation") && 
                    !!form.watch("accidentType");
  
  // Count missing required fields
  const getMissingFieldsCount = () => {
    let count = 0;
    if (!form.watch("accidentDate")) count++;
    if (!form.watch("accidentLocation")) count++;
    if (!form.watch("accidentType")) count++;
    return count;
  };
  
  const onSubmit = async (data: AccidentDetails) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/accident-details`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Accident details saved",
        description: "Accident details have been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving accident details:", error);
      toast({
        title: "Error saving accident details",
        description: "There was an error saving the accident details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Accident Details" 
      isComplete={isComplete}
      missingFields={getMissingFieldsCount()}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="accidentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Accident</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accidentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Accident</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accidentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Intersection of Main St & Park Ave" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weatherConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weather Conditions</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || "clear"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weather conditions" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="clear">Clear</SelectItem>
                        <SelectItem value="rainy">Rainy</SelectItem>
                        <SelectItem value="snowy">Snowy</SelectItem>
                        <SelectItem value="foggy">Foggy</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>
          
          <SubSection title="Incident Details">
            <div className="mb-4">
              <FormField
                control={form.control}
                name="accidentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Accident</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select accident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vehicleCollision">Vehicle Collision</SelectItem>
                        <SelectItem value="pedestrianAccident">Pedestrian Accident</SelectItem>
                        <SelectItem value="motorcycleAccident">Motorcycle Accident</SelectItem>
                        <SelectItem value="cyclingAccident">Cycling Accident</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mb-4">
              <FormField
                control={form.control}
                name="accidentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of Accident</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the accident in detail"
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mb-4">
              <FormLabel>Vehicle Position at Time of Impact</FormLabel>
              <div className="border border-gray-300 rounded-md p-6 bg-gray-50">
                {/* Placeholder for diagram - would implement with Canvas in production */}
                <div className="flex items-center justify-center h-40 bg-white border border-dashed border-gray-400 rounded">
                  <span className="text-sm text-gray-500">Vehicle collision diagram would be displayed here</span>
                </div>
                <div className="mt-2 text-right">
                  <Button variant="link" className="text-sm text-[#0E7C7B] font-medium hover:text-teal-900 h-auto p-0">
                    Edit Diagram
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mb-4 border-t border-gray-200 pt-4">
              <FormField
                control={form.control}
                name="policeReportFiled"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Police Report Filed?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "yes")}
                        defaultValue={field.value ? "yes" : "no"}
                        className="flex items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {form.watch("policeReportFiled") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="reportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Police Report Number</FormLabel>
                      <FormControl>
                        <Input placeholder="BPD-2023-45678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reportingOfficer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Officer</FormLabel>
                      <FormControl>
                        <Input placeholder="Officer J. Martinez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </SubSection>
          
          <SubSection title="Witness Information">
            {fields.map((field, index) => (
              <div key={field.id} className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-medium text-[#4A5568]">Witness #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-sm text-red-600 hover:text-red-800 h-auto p-0"
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`witnesses.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Sarah Johnson" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`witnesses.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`witnesses.${index}.statement`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statement</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Witness statement"
                              rows={2}
                              {...field} 
                            />
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
              onClick={() => append({ name: "", phone: "", statement: "" })}
              className="flex items-center text-sm font-medium text-[#0E7C7B] hover:text-teal-900"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Witness
            </Button>
          </SubSection>
          
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Accident Details"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
