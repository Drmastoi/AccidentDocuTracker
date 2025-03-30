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
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, SubSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Predefined list of common pre-existing conditions
const commonPreExistingConditions = [
  "Arthritis", "Back Problems", "Neck Issues", "Headaches/Migraines", "Anxiety", 
  "Depression", "High Blood Pressure", "Diabetes", "Heart Disease", "Asthma",
  "Previous Injuries", "Previous Surgeries", "Previous Car Accidents",
  "Previous Workers' Compensation Claims"
];

interface FamilyHistoryFormProps {
  caseId: number;
  initialData?: FamilyHistory;
  onSaved?: () => void;
}

export function FamilyHistoryForm({ caseId, initialData, onSaved }: FamilyHistoryFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [otherCondition, setOtherCondition] = React.useState("");
  
  // Set up form with validation schema
  const form = useForm<FamilyHistory>({
    resolver: zodResolver(familyHistorySchema),
    defaultValues: initialData || {
      relevantFamilyHistory: "",
      preExistingConditions: [],
      familySupport: "",
      additionalNotes: "",
    },
  });
  
  // Check if form has been modified
  const isComplete = !!form.watch("relevantFamilyHistory") || 
                     (form.watch("preExistingConditions")?.length > 0) || 
                     !!form.watch("familySupport");
  
  const addOtherCondition = () => {
    if (otherCondition.trim() === "") return;
    
    const currentConditions = form.getValues("preExistingConditions") || [];
    form.setValue("preExistingConditions", [...currentConditions, otherCondition.trim()]);
    setOtherCondition("");
  };
  
  const removeCondition = (condition: string) => {
    const currentConditions = form.getValues("preExistingConditions") || [];
    form.setValue(
      "preExistingConditions",
      currentConditions.filter(c => c !== condition)
    );
  };
  
  const onSubmit = async (data: FamilyHistory) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/family-history`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Family history saved",
        description: "Family history information has been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving family history:", error);
      toast({
        title: "Error saving family history",
        description: "There was an error saving the family history information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Family History" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection>
            <FormField
              control={form.control}
              name="relevantFamilyHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevant Family History</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any relevant family medical history that may impact the case"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          <SubSection title="Pre-existing Conditions">
            <FormField
              control={form.control}
              name="preExistingConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pre-existing Conditions</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonPreExistingConditions.map((condition) => (
                      <FormItem
                        key={condition}
                        className="flex flex-row items-center space-x-2 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(condition)}
                            onCheckedChange={(checked) => {
                              const updatedConditions = checked
                                ? [...(field.value || []), condition]
                                : (field.value || []).filter(
                                    (val) => val !== condition
                                  );
                              field.onChange(updatedConditions);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {condition}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mt-4">
              <FormLabel>Other Pre-existing Condition</FormLabel>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={otherCondition}
                  onChange={(e) => setOtherCondition(e.target.value)}
                  placeholder="Enter other condition"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addOtherCondition}
                  disabled={!otherCondition.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {form.watch("preExistingConditions")?.length > 0 && (
              <div className="mt-4">
                <FormLabel>Selected Conditions</FormLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.watch("preExistingConditions")?.map((condition) => (
                    <div
                      key={condition}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeCondition(condition)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SubSection>
          
          <SubSection title="Family Support">
            <FormField
              control={form.control}
              name="familySupport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Support</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the level of family support available to the claimant during recovery"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      placeholder="Any additional notes regarding family history"
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
              {saving ? "Saving..." : "Save Family History"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
