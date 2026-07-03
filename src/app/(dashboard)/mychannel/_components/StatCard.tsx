import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatCard = ({ label, value, icon }: StatCardProps) => {
  const getTheme = (lbl: string) => {
    const l = lbl.toLowerCase();
    if (l.includes("member") || l.includes("subscriber") || l.includes("user")) {
      return {
        bg: "from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20",
        border: "hover:border-blue-500/30 ",
        iconBg: "bg-blue-500/10 text-blue-500 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white",
      };
    }
    if (l.includes("approved")) {
      return {
        bg: "from-green-500/10 to-lime-500/10 hover:from-green-500/20 hover:to-lime-500/20",
        border: "hover:border-green-500/30 ",
        iconBg: "bg-green-500/10 text-green-500 group-hover:bg-gradient-to-br group-hover:from-green-500 group-hover:to-lime-500 group-hover:text-white",
      };
    }
    if (l.includes("video") || l.includes("upload") || l.includes("content")) {
      return {
        bg: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
        border: "hover:border-emerald-500/30 ",
        iconBg: "bg-emerald-500/10 text-emerald-500 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white",
      };
    }
    // Default / Points
    return {
      bg: "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20",
      border: "hover:border-amber-500/30 ",
      iconBg: "bg-amber-500/10 text-amber-500 group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white",
    };
  };

  const theme = getTheme(label);

  return (
    <div className={`bg-secondary-bg/40 backdrop-blur-md border border-border-primary rounded-xl p-6 flex items-center gap-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-default bg-gradient-to-br  ${theme.border}`}>
      {icon && (
        <div className={`p-3.5 rounded-xl transition-all duration-200 shrink-0 ${theme.iconBg} shadow-sm group-hover:scale-110`}>
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-secondary-text uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-bold text-primary-text tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
