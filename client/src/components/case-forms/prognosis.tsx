import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prognosisSchema, type Prognosis } from "@shared/schema";
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
import { Plus, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Common treatment recommendations
const commonTreatmentRecommendations = [
  "Physical Therapy", "Occupational Therapy", "Chiropractic Care", 
  "Pain Management", "Orthopedic Consultation", "Neurological Evaluation",
  "Psychological Counseling", "Medication Management", "Surgery",
  "Injections", "Home Exercise Program", "Ergonomic Modifications"
];

interface PrognosisFormProps {
  caseId: number;
  initialData?: Prognosis;
  onSaved?: () => void;
}

export function PrognosisForm({ caseId, initialData, onSaved }: PrognosisFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [otherRecommendation, setOtherRecommendation] = React.useState("");
  
  // Set up form with validation schema
  const form = useForm<Prognosis>({
    resolver: zodResolver(prognosisSchema),
    defaultValues: initialData || {
      overallPrognosis: "",
      expectedRecoveryTime: "",
      permanentImpairment: "",
      futureCarePlans: "",
      treatmentRecommendations: [],
      additionalNotes: "",
    },
  });
  
  // Check if form has been modified
  const isComplete = !!form.watch("overallPrognosis") || 
                     !!form.watch("expectedRecoveryTime") || 
                     !!form.watch("permanentImpairment") || 
                     !!form.watch("futureCarePlans") ||
                     (form.watch("treatmentRecommendations")?.length > 0);
  
  const addOtherRecommendation = () => {
    if (otherRecommendation.trim() === "") return;
    
    const currentRecommendations = form.getValues("treatmentRecommendations") || [];
    form.setValue("treatmentRecommendations", [...currentRecommendations, otherRecommendation.trim()]);
    setOtherRecommendation("");
  };
  
  const removeRecommendation = (recommendation: string) => {
    const currentRecommendations = form.getValues("treatmentRecommendations") || [];
    form.setValue(
      "treatmentRecommendations",
      currentRecommendations.filter(r => r !== recommendation)
    );
  };
  
  const onSubmit = async (data: Prognosis) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/prognosis`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Prognosis saved",
        description: "Prognosis information has been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving prognosis:", error);
      toast({
        title: "Error saving prognosis",
        description: "There was an error saving the prognosis information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Prognosis" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SubSection title="Overall Prognosis">
            <FormField
              control={form.control}
              name="overallPrognosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Prognosis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide an assessment of the claimant's overall prognosis"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          <SubSection title="Recovery & Impairment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="expectedRecoveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Recovery Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 6-8 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="permanentImpairment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permanent Impairment</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any permanent impairment or disability expected"
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
                name="futureCarePlans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Future Care Plans</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any future care plans or long-term treatment needs"
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
          
          <SubSection title="Treatment Recommendations">
            <FormField
              control={form.control}
              name="treatmentRecommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommended Treatments</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonTreatmentRecommendations.map((recommendation) => (
                      <FormItem
                        key={recommendation}
                        className="flex flex-row items-center space-x-2 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(recommendation)}
                            onCheckedChange={(checked) => {
                              const updatedRecommendations = checked
                                ? [...(field.value || []), recommendation]
                                : (field.value || []).filter(
                                    (val) => val !== recommendation
                                  );
                              field.onChange(updatedRecommendations);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {recommendation}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mt-4">
              <FormLabel>Other Recommendation</FormLabel>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={otherRecommendation}
                  onChange={(e) => setOtherRecommendation(e.target.value)}
                  placeholder="Enter other recommendation"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addOtherRecommendation}
                  disabled={!otherRecommendation.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {form.watch("treatmentRecommendations")?.length > 0 && (
              <div className="mt-4">
                <FormLabel>Selected Recommendations</FormLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.watch("treatmentRecommendations")?.map((recommendation) => (
                    <div
                      key={recommendation}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {recommendation}
                      <button
                        type="button"
                        onClick={() => removeRecommendation(recommendation)}
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
          
          <SubSection>
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes regarding prognosis or recommendations"
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
              {saving ? "Saving..." : "Save Prognosis"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}
