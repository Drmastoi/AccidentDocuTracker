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
    <Card className={cn("p-4", className)}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Case Completion Progress</h3>
          <span className="text-sm font-medium">
            {progress}% Complete
          </span>
        </div>
        
        {/* Animated progress bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
          <motion.div 
            className="h-full bg-primary"
            initial="initial"
            animate="animate"
            custom={progress}
            variants={progressVariants}
          />
        </div>
        
        {/* Next section indicator */}
        {progress < 100 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center text-sm text-muted-foreground"
          >
            <span>Next section: </span>
            <div className="flex items-center ml-1 text-primary font-medium">
              {(() => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                const nextSection = sections[currentIndex + 1] || sections[0];
                return (
                  <>
                    {nextSection.name}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
        
        {/* Section completion indicators */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-2"
          variants={staggerChildren(0.05)}
          initial="hidden"
          animate="visible"
        >
          {sections.map((section) => {
            const isComplete = section.getCompletionStatus(caseData);
            const isActive = section.id === activeSection;
            
            return (
              <motion.div
                key={section.id}
                variants={scaleInVariants}
                whileHover={{ scale: 1.03, backgroundColor: "rgba(var(--primary-rgb), 0.08)" }}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md cursor-pointer border",
                  isActive ? "bg-primary/10 border-primary/30" : "hover:bg-muted border-transparent",
                  isComplete ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => onSectionClick?.(section.id)}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="check"
                      initial="initial"
                      animate="animate"
                      exit={{ scale: 0, opacity: 0 }}
                      variants={checkVariants}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="circle"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Circle className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="text-sm truncate">{section.name}</span>
                {isActive && !isComplete && (
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-primary ml-auto"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
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