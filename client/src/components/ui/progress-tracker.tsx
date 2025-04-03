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
    <Card className={cn("p-5 shadow-md", className)}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Case Completion</h3>
            <p className="text-sm text-muted-foreground mt-1">Track your documentation progress</p>
          </div>
          <motion.div 
            className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 border-2 border-primary relative"
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-primary font-bold text-lg">{progress}%</span>
            <svg className="absolute inset-0" width="56" height="56" viewBox="0 0 56 56">
              <motion.circle
                cx="28"
                cy="28"
                r="25"
                fill="none"
                stroke="rgba(14, 124, 123, 0.15)"
                strokeWidth="3"
              />
              <motion.circle
                cx="28"
                cy="28"
                r="25"
                fill="none"
                stroke="#0E7C7B"
                strokeWidth="3"
                strokeDasharray="157"  // 2 * PI * r
                initial={{ strokeDashoffset: 157 }}
                animate={{ strokeDashoffset: 157 - (157 * progress / 100) }}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
          </motion.div>
        </div>
        
        {/* Animated progress bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
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
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center py-2 px-3 bg-primary/5 rounded-md border border-primary/20 text-sm"
          >
            <span className="text-muted-foreground">Next: </span>
            <div className="flex items-center ml-2 text-primary font-semibold">
              {(() => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                const nextSection = sections[currentIndex + 1] || sections[0];
                return (
                  <>
                    {nextSection.name}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
        
        {/* Section completion indicators */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-2"
          variants={staggerChildren(0.05)}
          initial="hidden"
          animate="visible"
        >
          {sections.map((section, index) => {
            const isComplete = section.getCompletionStatus(caseData);
            const isActive = section.id === activeSection;
            
            return (
              <motion.div
                key={section.id}
                variants={scaleInVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex flex-col gap-2 p-3 rounded-lg cursor-pointer shadow-sm transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30" 
                    : "bg-white hover:bg-gray-50 border border-gray-100",
                  isComplete ? "ring-1 ring-primary/30" : ""
                )}
                onClick={() => onSectionClick?.(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium",
                      isComplete 
                        ? "bg-primary text-white" 
                        : isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-gray-100 text-gray-500"
                    )}>
                      {index + 1}
                    </span>
                    <span className={cn(
                      "font-medium", 
                      isComplete ? "text-primary" : isActive ? "text-gray-800" : "text-gray-600"
                    )}>
                      {section.name}
                    </span>
                  </div>
                  
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
                    ) : isActive ? (
                      <motion.div 
                        key="pulse"
                        className="h-3 w-3 rounded-full bg-primary"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    ) : null}
                  </AnimatePresence>
                </div>
                
                <div className={cn(
                  "h-1 w-full rounded-full overflow-hidden bg-gray-100",
                  isActive && !isComplete ? "bg-primary/20" : ""
                )}>
                  {isComplete && (
                    <motion.div 
                      className="h-full bg-primary" 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Card>
  );
}