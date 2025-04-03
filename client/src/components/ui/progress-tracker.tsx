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

  return (
    <Card className={cn("p-2 shadow-sm border border-gray-100", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <motion.div 
            className="relative h-6 w-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="absolute inset-0" width="24" height="24" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="2"
              />
              <motion.circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="#0E7C7B"
                strokeWidth="2"
                strokeDasharray="62.8"  // 2 * PI * r
                initial={{ strokeDashoffset: 62.8 }}
                animate={{ strokeDashoffset: 62.8 - (62.8 * progress / 100) }}
                strokeLinecap="round"
                transform="rotate(-90 12 12)"
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
          </motion.div>
          <span className="text-xs font-medium text-gray-800">{progress}%</span>
        </div>
        
        {/* Horizontal line */}
        <div className="h-px flex-grow mx-2 bg-gray-100"></div>
        
        {/* Compact section indicators */}
        <motion.div 
          className="flex gap-1"
          variants={staggerChildren(0.03)}
          initial="hidden"
          animate="visible"
        >
          {sections.map((section, index) => {
            const isComplete = section.getCompletionStatus(caseData);
            const isActive = section.id === activeSection;
            
            // Get the first letter of each word in section name
            const acronym = section.name
              .split(/\s+/)
              .map(word => word[0])
              .join('')
              .toUpperCase();
            
            return (
              <motion.div
                key={section.id}
                variants={scaleInVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex items-center justify-center h-6 w-6 rounded-full cursor-pointer transition-all duration-200",
                  isComplete 
                    ? "bg-primary text-white" 
                    : isActive
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200",
                )}
                title={section.name}
                onClick={() => onSectionClick?.(section.id)}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : (
                  <span className="text-xs font-medium">{acronym}</span>
                )}
                
                {isActive && !isComplete && (
                  <motion.div 
                    className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Card>
  );
}