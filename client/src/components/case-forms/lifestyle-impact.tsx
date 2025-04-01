import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lifestyleImpactSchema, type LifestyleImpact } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the options for each category
const workDifficultiesOptions = [
  "Sitting for long periods",
  "Standing for long periods",
  "Lifting heavy objects",
  "Bending or twisting",
  "Typing/Computer work",
  "Concentration",
  "Driving",
  "Other"
];

const sleepDisturbanceOptions = [
  "Difficulty falling asleep",
  "Difficulty staying asleep",
  "Early morning waking",
  "Nightmares",
  "Pain disturbs sleep",
  "Restlessness",
  "Other"
];

const domesticActivitiesOptions = [
  "House cleaning",
  "Cooking meals",
  "Doing laundry",
  "Grocery shopping",
  "Childcare duties",
  "Gardening/yard work",
  "Pet care",
  "Other"
];

const sportLeisureActivitiesOptions = [
  "Going to the gym",
  "Running/Jogging",
  "Swimming",
  "Cycling",
  "Team sports",
  "Hiking",
  "Yoga/Stretching",
  "Other"
];

const socialActivitiesOptions = [
  "Meeting friends",
  "Family gatherings",
  "Dining out",
  "Attending parties",
  "Concerts/Events",
  "Traveling",
  "Group hobbies",
  "Other"
];

interface LifestyleImpactFormProps {
  caseId: number;
  initialData?: LifestyleImpact;
  onSaved?: () => void;
}

export function LifestyleImpactForm({ caseId, initialData, onSaved }: LifestyleImpactFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  // Set up form with validation schema
  const form = useForm<LifestyleImpact>({
    resolver: zodResolver(lifestyleImpactSchema),
    defaultValues: initialData || {
      // Job details
      currentJobTitle: "",
      workStatus: undefined,
      secondJob: "",
      
      // Work impact
      daysOffWork: "",
      daysLightDuties: "",
      workDifficulties: [],
      workOtherDetails: "",
      
      // Sleep disturbances
      hasSleepDisturbance: false,
      sleepDisturbances: [],
      sleepOtherDetails: "",
      
      // Domestic living
      hasDomesticImpact: false,
      domesticActivities: [],
      domesticOtherDetails: "",
      
      // Sport & leisure
      hasSportLeisureImpact: false,
      sportLeisureActivities: [],
      sportLeisureOtherDetails: "",
      
      // Social life
      hasSocialImpact: false,
      socialActivities: [],
      socialOtherDetails: "",
      
      // Summary
      lifestyleSummary: "The claimant did not take any days off work. The claimant is experiencing sleep disturbances. Their injuries have affected their domestic activities. Their injuries have affected their sport and leisure activities. Their injuries have affected their social life."
    },
  });
  
  // Watch values for conditional fields
  const workDifficulties = form.watch("workDifficulties") || [];
  const hasWorkOther = workDifficulties.includes("Other");
  
  const hasSleepDisturbance = form.watch("hasSleepDisturbance");
  const sleepDisturbances = form.watch("sleepDisturbances") || [];
  const hasSleepOther = sleepDisturbances.includes("Other");
  
  const hasDomesticImpact = form.watch("hasDomesticImpact");
  const domesticActivities = form.watch("domesticActivities") || [];
  const hasDomesticOther = domesticActivities.includes("Other");
  
  const hasSportLeisureImpact = form.watch("hasSportLeisureImpact");
  const sportLeisureActivities = form.watch("sportLeisureActivities") || [];
  const hasSportLeisureOther = sportLeisureActivities.includes("Other");
  
  const hasSocialImpact = form.watch("hasSocialImpact");
  const socialActivities = form.watch("socialActivities") || [];
  const hasSocialOther = socialActivities.includes("Other");
  
  // Generate lifestyle summary
  React.useEffect(() => {
    let summary = "";
    
    // Work impact
    const daysOffWork = form.watch("daysOffWork");
    const daysLightDuties = form.watch("daysLightDuties");
    
    if (daysOffWork && parseInt(daysOffWork) > 0) {
      summary += `The claimant took ${daysOffWork} days off work due to the accident. `;
    } else {
      summary += "The claimant did not take any days off work. ";
    }
    
    if (daysLightDuties && parseInt(daysLightDuties) > 0) {
      summary += `The claimant had ${daysLightDuties} days of light duties or reduced hours. `;
    }
    
    // Sleep impact
    if (hasSleepDisturbance && sleepDisturbances.length > 0) {
      summary += "The claimant is experiencing sleep disturbances";
      if (sleepDisturbances.length > 0) {
        summary += " including ";
        summary += sleepDisturbances.map((d, i) => {
          if (i === 0) return d.toLowerCase();
          if (i === sleepDisturbances.length - 1) return ` and ${d.toLowerCase()}`;
          return `, ${d.toLowerCase()}`;
        }).join("");
      }
      summary += ". ";
    } else {
      summary += "The claimant is not experiencing any sleep disturbances. ";
    }
    
    // Domestic impact
    if (hasDomesticImpact && domesticActivities.length > 0) {
      summary += "Their injuries have affected their domestic activities";
      if (domesticActivities.length > 0) {
        summary += " such as ";
        summary += domesticActivities.map((d, i) => {
          if (i === 0) return d.toLowerCase();
          if (i === domesticActivities.length - 1) return ` and ${d.toLowerCase()}`;
          return `, ${d.toLowerCase()}`;
        }).join("");
      }
      summary += ". ";
    } else {
      summary += "Their injuries have not affected their domestic activities. ";
    }
    
    // Sport & leisure impact
    if (hasSportLeisureImpact && sportLeisureActivities.length > 0) {
      summary += "Their injuries have affected their sport and leisure activities";
      if (sportLeisureActivities.length > 0) {
        summary += " such as ";
        summary += sportLeisureActivities.map((d, i) => {
          if (i === 0) return d.toLowerCase();
          if (i === sportLeisureActivities.length - 1) return ` and ${d.toLowerCase()}`;
          return `, ${d.toLowerCase()}`;
        }).join("");
      }
      summary += ". ";
    } else {
      summary += "Their injuries have not affected their sport and leisure activities. ";
    }
    
    // Social impact
    if (hasSocialImpact && socialActivities.length > 0) {
      summary += "Their injuries have affected their social life";
      if (socialActivities.length > 0) {
        summary += " including ";
        summary += socialActivities.map((d, i) => {
          if (i === 0) return d.toLowerCase();
          if (i === socialActivities.length - 1) return ` and ${d.toLowerCase()}`;
          return `, ${d.toLowerCase()}`;
        }).join("");
      }
      summary += ". ";
    } else {
      summary += "Their injuries have not affected their social life. ";
    }
    
    form.setValue("lifestyleSummary", summary);
  }, [
    form.watch("daysOffWork"),
    form.watch("daysLightDuties"),
    hasSleepDisturbance,
    sleepDisturbances,
    hasDomesticImpact,
    domesticActivities,
    hasSportLeisureImpact,
    sportLeisureActivities,
    hasSocialImpact,
    socialActivities,
    form
  ]);
  
  // Check if form has been modified
  const isComplete = (!!form.watch("daysOffWork") || !!form.watch("daysLightDuties")) && 
                     (hasSleepDisturbance || hasDomesticImpact || hasSportLeisureImpact || hasSocialImpact);
  
  const onSubmit = async (data: LifestyleImpact) => {
    try {
      setSaving(true);
      
      await apiRequest("PUT", `/api/cases/${caseId}/lifestyle-impact`, data);
      
      // Calculate completion percentage
      await apiRequest("POST", `/api/cases/${caseId}/calculate-completion`);
      
      toast({
        title: "Lifestyle impact saved",
        description: "Lifestyle impact information has been saved successfully.",
      });
      
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving lifestyle impact:", error);
      toast({
        title: "Error saving lifestyle impact",
        description: "There was an error saving the lifestyle impact information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FormSection 
      title="Impact on Daily Life" 
      isComplete={isComplete}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Job Details */}
          <SubSection title="Job Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <FormField
                control={form.control}
                name="currentJobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Job Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter job title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondJob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Job (if any)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter second job details"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="workStatus"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Work Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SubSection>
          
          {/* Work Impact */}
          <SubSection title="Work Impact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="daysOffWork"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How many days did you Take Off Work because of the accident?</FormLabel>
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
              
              <FormField
                control={form.control}
                name="daysLightDuties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How many Days of Light Duties or reduced hours did you take?</FormLabel>
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
            
            <div className="mt-6">
              <FormLabel className="block mb-3">What things are hard to do at work?</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="workDifficulties"
                  render={({ field }) => (
                    <>
                      {workDifficultiesOptions.map((option) => (
                        <FormItem
                          key={option}
                          className="flex items-start space-x-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                const updatedValues = checked
                                  ? [...currentValues, option]
                                  : currentValues.filter(val => val !== option);
                                field.onChange(updatedValues);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </>
                  )}
                />
              </div>
              
              {hasWorkOther && (
                <div className="mt-3">
                  <FormField
                    control={form.control}
                    name="workOtherDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please specify other work difficulties</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter other work difficulties"
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
          
          {/* Sleep Disturbances */}
          <SubSection title="Sleep Disturbances">
            <FormField
              control={form.control}
              name="hasSleepDisturbance"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Do you have Sleep Disturbance?</FormLabel>
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
            
            {hasSleepDisturbance && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2">
                <FormLabel className="block mb-3">What type of sleep disturbances do you experience?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="sleepDisturbances"
                    render={({ field }) => (
                      <>
                        {sleepDisturbanceOptions.map((option) => (
                          <FormItem
                            key={option}
                            className="flex items-start space-x-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  const updatedValues = checked
                                    ? [...currentValues, option]
                                    : currentValues.filter(val => val !== option);
                                  field.onChange(updatedValues);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </>
                    )}
                  />
                </div>
                
                {hasSleepOther && (
                  <div className="mt-3">
                    <FormField
                      control={form.control}
                      name="sleepOtherDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify other sleep disturbances</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter other sleep disturbances"
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
          
          {/* Domestic Living */}
          <SubSection title="Domestic Living">
            <FormField
              control={form.control}
              name="hasDomesticImpact"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Do you have Effect on Domestic Living?</FormLabel>
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
            
            {hasDomesticImpact && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2">
                <FormLabel className="block mb-3">What domestic activities are affected?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="domesticActivities"
                    render={({ field }) => (
                      <>
                        {domesticActivitiesOptions.map((option) => (
                          <FormItem
                            key={option}
                            className="flex items-start space-x-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  const updatedValues = checked
                                    ? [...currentValues, option]
                                    : currentValues.filter(val => val !== option);
                                  field.onChange(updatedValues);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </>
                    )}
                  />
                </div>
                
                {hasDomesticOther && (
                  <div className="mt-3">
                    <FormField
                      control={form.control}
                      name="domesticOtherDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify other domestic activities</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter other domestic activities"
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
          
          {/* Sport & Leisure */}
          <SubSection title="Sport & Leisure">
            <FormField
              control={form.control}
              name="hasSportLeisureImpact"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Do you have Effect on Sport & Leisure activity?</FormLabel>
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
            
            {hasSportLeisureImpact && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2">
                <FormLabel className="block mb-3">What sport & leisure activities are affected?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="sportLeisureActivities"
                    render={({ field }) => (
                      <>
                        {sportLeisureActivitiesOptions.map((option) => (
                          <FormItem
                            key={option}
                            className="flex items-start space-x-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  const updatedValues = checked
                                    ? [...currentValues, option]
                                    : currentValues.filter(val => val !== option);
                                  field.onChange(updatedValues);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </>
                    )}
                  />
                </div>
                
                {hasSportLeisureOther && (
                  <div className="mt-3">
                    <FormField
                      control={form.control}
                      name="sportLeisureOtherDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify other sport & leisure activities</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter other sport & leisure activities"
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
          
          {/* Social Life */}
          <SubSection title="Social Life">
            <FormField
              control={form.control}
              name="hasSocialImpact"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Do you have Effect on Social life?</FormLabel>
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
            
            {hasSocialImpact && (
              <div className="ml-6 border-l-2 border-gray-200 pl-4 pb-2">
                <FormLabel className="block mb-3">What social activities are affected?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="socialActivities"
                    render={({ field }) => (
                      <>
                        {socialActivitiesOptions.map((option) => (
                          <FormItem
                            key={option}
                            className="flex items-start space-x-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  const updatedValues = checked
                                    ? [...currentValues, option]
                                    : currentValues.filter(val => val !== option);
                                  field.onChange(updatedValues);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </>
                    )}
                  />
                </div>
                
                {hasSocialOther && (
                  <div className="mt-3">
                    <FormField
                      control={form.control}
                      name="socialOtherDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify other social activities</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter other social activities"
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
          
          {/* Impact Summary */}
          <SubSection title="Impact Summary">
            <FormField
              control={form.control}
              name="lifestyleSummary"
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
              {saving ? "Saving..." : "Save Impact on Daily Life"}
            </Button>
          </div>
        </form>
      </Form>
    </FormSection>
  );
}