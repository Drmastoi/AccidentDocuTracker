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
    <section className={cn("mb-8", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#4A5568]">{title}</h2>
        <div className="flex items-center">
          {isComplete ? (
            <>
              <span className="text-sm text-[#48BB78] mr-2">All fields complete</span>
              <CheckCircle className="h-5 w-5 text-[#48BB78]" />
            </>
          ) : (
            <>
              <span className="text-sm text-yellow-600 mr-2">
                {missingFields ? `${missingFields} fields missing` : "Section incomplete"}
              </span>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
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
    <Card className={cn("mb-6", className)}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-[#4A5568]">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={!title ? "pt-6" : undefined}>{children}</CardContent>
    </Card>
  );
}
