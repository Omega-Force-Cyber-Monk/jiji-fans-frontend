import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatCard = ({ label, value, icon }: StatCardProps) => {
  return (
    <div className="bg-primary-bg border border-border-primary rounded-lg p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300 group">
      {icon && (
        <div className="p-3 bg-secondary-bg rounded-md text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-secondary-text uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-semibold text-primary-text mt-0.5">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
