import React from "react";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useParams } from "wouter";

interface HeaderProps {
  caseNumber?: string;
  onSave: () => Promise<void>;
}

export function Header({ caseNumber, onSave }: HeaderProps) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  
  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave();
      toast({
        title: "Case saved",
        description: "Your case has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving case:", error);
      toast({
        title: "Error saving case",
        description: "There was an error saving your case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <FileText className="h-8 w-8 text-[#0E7C7B]" />
        <h1 className="ml-2 text-xl font-semibold text-[#0E7C7B]">Medical-Legal Report Generator</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline"
          className="bg-gray-100 hover:bg-gray-200 text-[#4A5568]"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-1" />
          Save Case
        </Button>
      </div>
    </header>
  );
}
