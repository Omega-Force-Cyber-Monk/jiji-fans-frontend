import React from "react";
import { cn } from "@/utils/cn";

interface MetricsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, icon, trend, isLoading }) => {
  return (
    <div className="bg-secondary-bg rounded-lg border border-border-primary p-6 flex flex-col justify-between transition-all hover:border-brand-primary duration-300 shadow-sm relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors duration-500" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <p className="text-base font-medium text-muted-text">{label}</p>
        {icon && (
          <div className="text-brand-primary bg-brand-primary/10 p-2.5 rounded-md">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between relative z-10">
        {isLoading ? (
          <div className="h-9 w-24 bg-border-primary/20 rounded-md animate-pulse" />
        ) : (
          <p className="text-3xl font-semibold text-primary-text">{value}</p>
        )}
        {isLoading ? (
          trend && <div className="h-6 w-16 bg-border-primary/20 rounded-md animate-pulse" />
        ) : (
          trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium rounded-md px-2.5 py-1 backdrop-blur-sm",
              trend.isPositive ? "text-success bg-success/10 border border-success/20" : "text-error bg-error/10 border border-error/20"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MetricsCard;
