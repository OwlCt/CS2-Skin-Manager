"use client";

import React from "react";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  Breadcrumb as ShadBreadcrumb,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

interface AppBreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

interface AppBreadcrumbItemProps {
  children: React.ReactNode;
  isCurrent?: boolean;
}

// Simple breadcrumb item component
export const AppBreadcrumbItem: React.FC<AppBreadcrumbItemProps> = ({ children, isCurrent = false }) => (
  <BreadcrumbItem 
    className={isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}
  >
    {children}
  </BreadcrumbItem>
);

// Simple separator component
const Separator = () => (
  <BreadcrumbSeparator>
    <ChevronRight className="w-4 h-4" />
  </BreadcrumbSeparator>
);

// Main breadcrumb component
const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ 
  children, 
  className = "mb-6" 
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      <ShadBreadcrumb>
        <BreadcrumbList>
          {childrenArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < childrenArray.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </ShadBreadcrumb>
    </div>
  );
};

export default AppBreadcrumb;
