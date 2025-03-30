import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { treatmentsSchema, type Treatments } from "@shared/schema";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TreatmentsFormProps {
  caseId: number;
  initialData?: Treatments;
  onSaved?: () => void;
}

export function TreatmentsForm({ caseId, initialData, onSaved }: TreatmentsFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<Treatments>({
    resolver: zodResolver(treatmentsSchema),
    defaultValues: initialData || {
      emergencyTreatment: "",
      hospitalizations: [],
      ongoingTreatments: [],
      medications: [],
      additionalNotes: "",
    },
  });
  
  // Setup field arrays
  const hospitalizations = useFieldArray({
    control: form.control,
    name: "hospitalizations",
  });
  
  const ongoingTreatments = useFieldArray({
    control: form.control,
    name: "ongoingTreatments",
  });
  
  const medications = useFieldArray({
    control: form.control,
    name: "medications",
  });
  
  // Check if form has been modified
  const isComplete = !!form.watch("emergencyTreatment") || 
                     form.watch("hospitalizations")?.length > 0 || 
                     form.watch("ongoingTreatments")?.length > 0 ||
                     form.watch("medications")?.length > 0;
  
  const onSubmit = async (data: Treatments) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/treatments`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Treatments saved",
        description: "Treatment information has been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving treatments:", error);
      toast({
        title: "Error saving treatments",
        description: "There was an error saving the treatment information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Treatments" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection>
            <FormField
              control={form.control}
              name="emergencyTreatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Treatment</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any emergency treatment received immediately after the accident"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          <SubSection title="Hospitalizations">
            {hospitalizations.fields.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-md mb-4">
                <p className="text-sm text-gray-500">No hospitalizations recorded. Add hospitalizations using the button below.</p>
              </div>
            ) : (
              hospitalizations.fields.map((field, index) => (
                <div key={field.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-medium text-[#4A5568]">Hospitalization #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => hospitalizations.remove(index)}
                      className="text-sm text-red-600 hover:text-red-800 h-auto p-0"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`hospitalizations.${index}.facility`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility</FormLabel>
                          <FormControl>
                            <Input placeholder="Boston Medical Center" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`hospitalizations.${index}.reason`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Input placeholder="Head injury assessment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`hospitalizations.${index}.admissionDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`hospitalizations.${index}.dischargeDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discharge Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => hospitalizations.append({ 
                facility: "", 
                admissionDate: "", 
                dischargeDate: "", 
                reason: "" 
              })}
              className="flex items-center text-sm font-medium text-[#0E7C7B] hover:text-teal-900"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Hospitalization
            </Button>
          </SubSection>
          
          <SubSection title="Ongoing Treatments">
            {ongoingTreatments.fields.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-md mb-4">
                <p className="text-sm text-gray-500">No ongoing treatments recorded. Add treatments using the button below.</p>
              </div>
            ) : (
              ongoingTreatments.fields.map((field, index) => (
                <div key={field.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-medium text-[#4A5568]">Treatment #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => ongoingTreatments.remove(index)}
                      className="text-sm text-red-600 hover:text-red-800 h-auto p-0"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`ongoingTreatments.${index}.treatmentType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Physical Therapy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`ongoingTreatments.${index}.provider`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
                          <FormControl>
                            <Input placeholder="Boston Rehab Center" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`ongoingTreatments.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <Input placeholder="Twice weekly" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`ongoingTreatments.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`ongoingTreatments.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (if applicable)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ongoingTreatments.append({ 
                treatmentType: "", 
                provider: "", 
                frequency: "", 
                startDate: "", 
                endDate: "" 
              })}
              className="flex items-center text-sm font-medium text-[#0E7C7B] hover:text-teal-900"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Treatment
            </Button>
          </SubSection>
          
          <SubSection title="Medications">
            {medications.fields.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-md mb-4">
                <p className="text-sm text-gray-500">No medications recorded. Add medications using the button below.</p>
              </div>
            ) : (
              medications.fields.map((field, index) => (
                <div key={field.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-medium text-[#4A5568]">Medication #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => medications.remove(index)}
                      className="text-sm text-red-600 hover:text-red-800 h-auto p-0"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`medications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ibuprofen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`medications.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="800mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`medications.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <Input placeholder="3 times daily" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`medications.${index}.prescribedBy`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prescribed By</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Michael Johnson" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => medications.append({ 
                name: "", 
                dosage: "", 
                frequency: "", 
                prescribedBy: "" 
              })}
              className="flex items-center text-sm font-medium text-[#0E7C7B] hover:text-teal-900"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Medication
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
                      placeholder="Any additional notes regarding treatment"
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
              {saving ? "Saving..." : "Save Treatment Information"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
