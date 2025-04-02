import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  isComplete?: boolean;
  missingFields?: number;
  className?: string;
}

export function FormSection({
  title,
  children,
  isComplete = false,
  missingFields = 0,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("mb-3", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-sm font-semibold text-[#4A5568]">{title}</h2>
        <div className="flex items-center">
          {isComplete ? (
            <>
              <span className="text-xs text-[#48BB78] mr-1">All fields complete</span>
              <CheckCircle className="h-3 w-3 text-[#48BB78]" />
            </>
          ) : (
            <>
              <span className="text-xs text-yellow-600 mr-1">
                {missingFields ? `${missingFields} fields missing` : "Section incomplete"}
              </span>
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
            </>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

interface SubSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SubSection({ title, children, className }: SubSectionProps) {
  return (
    <Card className={cn("mb-3 shadow-sm", className)}>
      {title && (
        <CardHeader className="pb-1 pt-2 px-3 card-header">
          <CardTitle className="text-sm font-medium text-[#4A5568] card-title">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(!title ? "pt-3" : undefined, "py-2 px-3 card-content")}>{children}</CardContent>
    </Card>
  );
}
