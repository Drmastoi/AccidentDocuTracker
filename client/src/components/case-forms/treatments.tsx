import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { treatmentsSchema, type Treatments } from "@shared/schema";
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
import { FormSection, SubSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
      // Accident scene treatment
      receivedTreatmentAtScene: false,
      sceneFirstAid: false,
      sceneNeckCollar: false,
      sceneAmbulanceArrived: false,
      scenePoliceArrived: false,
      sceneOtherTreatment: false,
      sceneOtherTreatmentDetails: "",
      
      // A&E (Hospital) treatment
      wentToHospital: false,
      hospitalName: "",
      hospitalNoTreatment: false,
      hospitalXRay: false,
      hospitalCTScan: false,
      hospitalBandage: false,
      hospitalNeckCollar: false,
      hospitalOtherTreatment: false,
      hospitalOtherTreatmentDetails: "",
      
      // GP/Walk-in center
      wentToGPWalkIn: false,
      daysToGPWalkIn: "",
      
      // Current medications
      takingParacetamol: false,
      takingIbuprofen: false,
      takingCodeine: false,
      takingOtherMedication: false,
      otherMedicationDetails: "",
      
      // Physiotherapy
      physiotherapySessions: "",
      
      // Summary
      treatmentSummary: "The claimant received treatment at the scene of the accident. The claimant attended A&E at the hospital. The claimant visited their GP/Walk-in center some days after the accident. The claimant has not attended any physiotherapy sessions."
    },
  });
  
  // Watch values for conditional fields
  const receivedTreatmentAtScene = form.watch("receivedTreatmentAtScene");
  const wentToHospital = form.watch("wentToHospital");
  const wentToGPWalkIn = form.watch("wentToGPWalkIn");
  const takingOtherMedication = form.watch("takingOtherMedication");
  const sceneOtherTreatment = form.watch("sceneOtherTreatment");
  const hospitalOtherTreatment = form.watch("hospitalOtherTreatment");
  
  // Generate treatment summary
  React.useEffect(() => {
    let summary = "";
    
    // Scene treatment summary
    if (receivedTreatmentAtScene) {
      summary += "The claimant received treatment at the scene of the accident. ";
    } else {
      summary += "The claimant did not receive any treatment at the scene of the accident. ";
    }
    
    // Hospital summary
    if (wentToHospital) {
      const hospitalName = form.watch("hospitalName");
      if (hospitalName) {
        summary += `The claimant attended A&E at ${hospitalName}. `;
      } else {
        summary += "The claimant attended A&E at the hospital. ";
      }
    } else {
      summary += "The claimant did not attend A&E after the accident. ";
    }
    
    // GP/Walk-in summary
    if (wentToGPWalkIn) {
      const days = form.watch("daysToGPWalkIn");
      if (days) {
        summary += `The claimant visited their GP/Walk-in center ${days} days after the accident. `;
      } else {
        summary += "The claimant visited their GP/Walk-in center after the accident. ";
      }
    } else {
      summary += "The claimant did not visit their GP/Walk-in center after the accident. ";
    }
    
    // Physiotherapy summary
    const physioSessions = form.watch("physiotherapySessions");
    if (physioSessions && parseInt(physioSessions) > 0) {
      summary += `The claimant has attended ${physioSessions} physiotherapy sessions.`;
    } else {
      summary += "The claimant has not attended any physiotherapy sessions.";
    }
    
    form.setValue("treatmentSummary", summary);
  }, [
    receivedTreatmentAtScene, 
    wentToHospital, 
    wentToGPWalkIn, 
    form.watch("hospitalName"), 
    form.watch("daysToGPWalkIn"), 
    form.watch("physiotherapySessions"),
    form
  ]);
  
  // Check if form has been modified
  const isComplete = receivedTreatmentAtScene || wentToHospital || wentToGPWalkIn;
  
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
      title="Treatment Information" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Scene of Accident Treatment */}
          <SubSection title="Treatment at the Scene">
            <FormField
              control={form.control}
              name="receivedTreatmentAtScene"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Did you receive any treatment at the scene of accident?</FormLabel>
                  <div className="flex items-center space-x-2 mt-2">
                    <FormControl>
                      <RadioGroup 
                        onValueChange={(value) => field.onChange(value === "true")} 
                        value={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {receivedTreatmentAtScene && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2">
                <FormLabel className="block mb-3">What treatment did you receive?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="sceneFirstAid"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">First Aid</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sceneNeckCollar"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Neck Collar</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sceneAmbulanceArrived"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Ambulance Arrived</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scenePoliceArrived"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Police Arrived</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sceneOtherTreatment"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                {sceneOtherTreatment && (
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="sceneOtherTreatmentDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Please specify other treatment received"
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
            )}
          </SubSection>
          
          {/* Hospital (A&E) Treatment */}
          <SubSection title="Hospital (A&E) Treatment">
            <FormField
              control={form.control}
              name="wentToHospital"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Did you go to A&E after accident?</FormLabel>
                  <div className="flex items-center space-x-2 mt-2">
                    <FormControl>
                      <RadioGroup 
                        onValueChange={(value) => field.onChange(value === "true")} 
                        value={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {wentToHospital && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2">
                <FormField
                  control={form.control}
                  name="hospitalName"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Which hospital A&E did you go to?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter hospital name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormLabel className="block mb-3">What treatment did you receive at the hospital?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="hospitalNoTreatment"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">None</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hospitalXRay"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">X-ray</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hospitalCTScan"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">CT Scan</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hospitalBandage"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Bandage</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hospitalNeckCollar"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Neck Collar</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hospitalOtherTreatment"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                {hospitalOtherTreatment && (
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="hospitalOtherTreatmentDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Please specify other hospital treatment received"
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
            )}
          </SubSection>
          
          {/* GP/Walk-in Centre */}
          <SubSection title="GP/Walk-in Centre">
            <FormField
              control={form.control}
              name="wentToGPWalkIn"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Did you go to Walk-in centre/GP after accident?</FormLabel>
                  <div className="flex items-center space-x-2 mt-2">
                    <FormControl>
                      <RadioGroup 
                        onValueChange={(value) => field.onChange(value === "true")} 
                        value={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {wentToGPWalkIn && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2">
                <FormField
                  control={form.control}
                  name="daysToGPWalkIn"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>How many days after the accident did you consult Walk-in/centre/GP?</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Enter number of days"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </SubSection>
          
          {/* Current Medications */}
          <SubSection title="Current Medications">
            <FormLabel className="block mb-3">What is your Current Treatment (Pain killers)?</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="takingParacetamol"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Paracetamol</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="takingIbuprofen"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Ibuprofen, Naproxen</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="takingCodeine"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Codeine</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="takingOtherMedication"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Others prescribed medicines</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            {takingOtherMedication && (
              <div className="mt-2">
                <FormField
                  control={form.control}
                  name="otherMedicationDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Please specify other medications"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </SubSection>
          
          {/* Physiotherapy */}
          <SubSection title="Physiotherapy">
            <FormField
              control={form.control}
              name="physiotherapySessions"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>How many sessions of Physiotherapy have you had so far?</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="Enter number of sessions"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          {/* Treatment Summary */}
          <SubSection title="Treatment Summary">
            <FormField
              control={form.control}
              name="treatmentSummary"
              render={({ field }) => (
                <FormItem>
                  <div className="p-4 border rounded-md bg-muted/30">
                    <p className="text-sm leading-relaxed">{field.value}</p>
                  </div>
                  <FormDescription className="text-xs mt-2">
                    This summary is generated automatically based on your responses.
                  </FormDescription>
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