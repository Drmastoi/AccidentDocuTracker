import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workHistorySchema, type WorkHistory } from "@shared/schema";
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

interface WorkHistoryFormProps {
  caseId: number;
  initialData?: WorkHistory;
  onSaved?: () => void;
}

export function WorkHistoryForm({ caseId, initialData, onSaved }: WorkHistoryFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<WorkHistory>({
    resolver: zodResolver(workHistorySchema),
    defaultValues: initialData || {
      currentEmployment: {
        employer: "",
        position: "",
        startDate: "",
        duties: "",
      },
      previousEmployment: [],
      timeOffWork: "",
      workAccommodations: "",
      additionalNotes: "",
    },
  });
  
  // Setup field array for previous employment
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "previousEmployment",
  });
  
  // Check if form has been modified
  const isComplete = !!form.watch("currentEmployment.employer") || 
                     fields.length > 0 || 
                     !!form.watch("timeOffWork");
  
  const onSubmit = async (data: WorkHistory) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/work-history`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Work history saved",
        description: "Work history information has been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving work history:", error);
      toast({
        title: "Error saving work history",
        description: "There was an error saving the work history information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Work History" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection title="Current Employment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentEmployment.employer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer</FormLabel>
                    <FormControl>
                      <Input placeholder="Current employer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentEmployment.position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentEmployment.startDate"
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
            </div>
            
            <div className="mt-4">
              <FormField
                control={form.control}
                name="currentEmployment.duties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Duties</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe job duties and responsibilities"
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
          
          <SubSection title="Previous Employment">
            {fields.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-md mb-4">
                <p className="text-sm text-gray-500">No previous employment recorded. Add previous employment using the button below.</p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div key={field.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-medium text-[#4A5568]">Previous Employment #{index + 1}</h4>
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
                      name={`previousEmployment.${index}.employer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer</FormLabel>
                          <FormControl>
                            <Input placeholder="Previous employer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`previousEmployment.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="Job title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`previousEmployment.${index}.startDate`}
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
                      name={`previousEmployment.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
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
                        name={`previousEmployment.${index}.duties`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Duties</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe job duties and responsibilities"
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
              ))
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ 
                employer: "", 
                position: "", 
                startDate: "", 
                endDate: "", 
                duties: "" 
              })}
              className="flex items-center text-sm font-medium text-[#0E7C7B] hover:text-teal-900"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Previous Employment
            </Button>
          </SubSection>
          
          <SubSection title="Time Off & Accommodations">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="timeOffWork"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Off Work</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any time taken off work due to the accident and injuries"
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
                name="workAccommodations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Accommodations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any work accommodations required or provided"
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
                      placeholder="Any additional notes regarding work history"
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
              {saving ? "Saving..." : "Save Work History"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
