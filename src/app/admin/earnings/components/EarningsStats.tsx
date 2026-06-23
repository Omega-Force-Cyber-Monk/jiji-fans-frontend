import React from "react";
import { formatTwoDigits } from "@/lib/helpers/getTwoDisit";
import MetricsCard from "@/components/dashboard/MetricsCard";
import { CurrencyDollarIcon, BanknotesIcon, UsersIcon } from "@heroicons/react/24/outline";

interface EarningsStatsProps {
  totalEarnings: number;
  totalWithdrawalsAmount: number;
  totalUsers: number;
}

const EarningsStats = ({
  totalEarnings,
  totalWithdrawalsAmount,
  totalUsers,
}: EarningsStatsProps) => {
  const status = [
    {
      label: "Total Earnings",
      value: `$${formatTwoDigits({ num: totalEarnings })}`,
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
    },
    {
      label: "Withdrawal Amount",
      value: `$${formatTwoDigits({
        num: totalWithdrawalsAmount,
      })}`,
      icon: <BanknotesIcon className="w-6 h-6" />,
    },
    {
      label: "Total Users",
      value: `${formatTwoDigits({ num: totalUsers })}`,
      icon: <UsersIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {status.map((item, index) => (
        <MetricsCard 
          key={index}
          label={item.label}
          value={item.value}
          icon={item.icon}
        />
      ))}
    </div>
  );
};

export default EarningsStats;
