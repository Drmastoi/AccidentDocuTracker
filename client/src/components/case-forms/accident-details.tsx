import React from "react";
import { useForm } from "react-hook-form";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDateToUK = (dateString: string): string => {
  if (!dateString) return dateString;
  
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  
  return `${day}/${month}/${year}`;
};

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
      timeOfDay: "Morning",
      vehicleLocation: "Main Road",
      weatherConditions: "clear",
      accidentType: "vehicleCollision",
      vehicleType: "Car",
      claimantPosition: "Driver",
      speed: "Medium",
      thirdPartyVehicle: "Car",
      impactLocation: "Rear",
      vehicleMovement: "Moving",
      damageSeverity: "Mildly Damaged",
      seatBeltWorn: true,
      headRestFitted: true,
      airBagDeployed: false,
      collisionImpact: "Forward/Backward",
      accidentDescription: "",
    },
  });
  
  // Check if required fields are filled
  const accidentDate = form.watch("accidentDate");
  const accidentType = form.watch("accidentType");
  const isComplete = !!accidentDate && !!accidentType;
  
  // Count missing required fields
  const getMissingFieldsCount = () => {
    let count = 0;
    if (!accidentDate) count++;
    if (!accidentType) count++;
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
          {/* Time and Location Section */}
          <SubSection title="Time and Location">
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
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Day</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time of day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Afternoon">Afternoon</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              

              
              <FormField
                control={form.control}
                name="vehicleLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Main Road">Main Road</SelectItem>
                        <SelectItem value="Minor Road">Minor Road</SelectItem>
                        <SelectItem value="Motorway">Motorway</SelectItem>
                        <SelectItem value="Roundabout">Roundabout</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
          
          {/* Vehicle Details Section */}
          <SubSection title="Vehicle Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Bus">Bus</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="claimantPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claimant's Position</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select claimant position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Driver">Driver</SelectItem>
                        <SelectItem value="Front Passenger">Front Passenger</SelectItem>
                        <SelectItem value="Rear Passenger">Rear Passenger</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="speed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speed</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select speed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Slow">Slow</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="thirdPartyVehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Third Party Vehicle</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select third party vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Bus">Bus</SelectItem>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SubSection>
          
          {/* Collision Details Section */}
          <SubSection title="Collision Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              
              <FormField
                control={form.control}
                name="impactLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rear">Rear</SelectItem>
                        <SelectItem value="Front">Front</SelectItem>
                        <SelectItem value="Left Side">Left Side</SelectItem>
                        <SelectItem value="Right Side">Right Side</SelectItem>
                        <SelectItem value="Multiple">Multiple</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleMovement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Movement</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle movement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Stationary">Stationary</SelectItem>
                        <SelectItem value="Moving">Moving</SelectItem>
                        <SelectItem value="Parked">Parked</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="damageSeverity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Damage Severity</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select damage severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mildly Damaged">Mildly Damaged</SelectItem>
                        <SelectItem value="Moderately Damaged">Moderately Damaged</SelectItem>
                        <SelectItem value="Severely Damaged">Severely Damaged</SelectItem>
                        <SelectItem value="Written Off">Written Off</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="collisionImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claimant Movement During Collision</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Forward/Backward">Forward/Backward (Rear Collision)</SelectItem>
                        <SelectItem value="Backward/Forward">Backward/Forward (Front Collision)</SelectItem>
                        <SelectItem value="Sideways">Sideways (Side Collision)</SelectItem>
                        <SelectItem value="Multiple Directions">Multiple Directions</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <FormField
                control={form.control}
                name="seatBeltWorn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-[#0E7C7B] focus:ring-[#0E7C7B]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Seat Belt Worn</FormLabel>
                      <FormDescription className="text-xs">
                        The claimant was wearing a seat belt
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="headRestFitted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-[#0E7C7B] focus:ring-[#0E7C7B]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Head Rest Fitted</FormLabel>
                      <FormDescription className="text-xs">
                        The vehicle was fitted with a head rest
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="airBagDeployed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-[#0E7C7B] focus:ring-[#0E7C7B]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Air Bags Deployed</FormLabel>
                      <FormDescription className="text-xs">
                        The vehicle air bags deployed during the collision
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-4">
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
            
            {/* Accident Summary */}
            <div className="mt-6 border border-gray-200 rounded-md p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2 text-[#4A5568]">Auto-Generated Accident Summary</h4>
              <p className="text-sm text-gray-600 mb-3">
                {form.watch("accidentDate") ? `On ${formatDateToUK(form.watch("accidentDate"))}, ` : "On [DATE], "}
                claimant was {form.watch("claimantPosition")?.toLowerCase() || "[POSITION]"} of the {form.watch("vehicleType")?.toLowerCase() || "[VEHICLE TYPE]"} when 
                {form.watch("thirdPartyVehicle") ? ` an other ${form.watch("thirdPartyVehicle")?.toLowerCase()}` : " another vehicle"} hit 
                claimant's {form.watch("vehicleType")?.toLowerCase() || "vehicle"} in the {form.watch("impactLocation")?.toLowerCase() || "[LOCATION]"} when it was 
                {form.watch("vehicleMovement")?.toLowerCase() === "stationary" ? " stationary" : form.watch("vehicleMovement")?.toLowerCase() === "moving" ? " moving" : form.watch("vehicleMovement")?.toLowerCase() === "parked" ? " parked" : " [MOVEMENT]"}, 
                as a result of this claimant was jolted {form.watch("collisionImpact")?.toLowerCase() || "forward and backwards"}. 
                Due to the accident claimant's vehicle was {form.watch("damageSeverity")?.toLowerCase() || "[DAMAGE]"}. 
                Claimant was {form.watch("seatBeltWorn") ? "wearing seat belt" : "not wearing seat belt"}, 
                head rest were {form.watch("headRestFitted") ? "fitted" : "not fitted"}, 
                air bags did {form.watch("airBagDeployed") ? "" : "not"} deploy.
              </p>
            </div>

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