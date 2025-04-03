import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { calculateCompletionPercentage, sections, SectionId } from "@/lib/sections";
import { Case } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { progressVariants, checkVariants, staggerChildren, scaleInVariants } from "@/lib/animation";

interface ProgressTrackerProps {
  caseData: Case | null | undefined;
  activeSection: SectionId;
  onSectionClick?: (sectionId: SectionId) => void;
  className?: string;
}

export function ProgressTracker({
  caseData,
  activeSection,
  onSectionClick,
  className
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState(0);
  
  // Animate progress when it changes
  useEffect(() => {
    if (caseData) {
      const completionPercentage = calculateCompletionPercentage(caseData);
      
      // Set initial value
      if (progress === 0 && completionPercentage > 0) {
        setProgress(completionPercentage);
      }
      
      // Animate to new value if it's different
      if (progress !== completionPercentage) {
        const timer = setTimeout(() => {
          setProgress(completionPercentage);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [caseData, progress]);

  if (!caseData) return null;

  // Add a tooltip showing the percentage when hovering
  return (
    <div className={cn("relative w-full cursor-pointer", className)}>
      <div 
        className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
        onClick={() => onSectionClick?.(activeSection)}
        title={`${progress}% complete`}
      >
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      
      {/* Active section indicator */}
      {progress > 0 && progress < 100 && (
        <motion.div 
          className="absolute -bottom-1 h-2 w-2 rounded-full bg-primary shadow-sm"
          style={{ left: `${progress}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      )}
    </div>
  );
}