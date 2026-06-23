import { ClockIcon, XCircleIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { TChannelStatus } from "@/redux/features/channel/channel.api";

interface StatusBannerProps {
  status: TChannelStatus;
}

const StatusBanner = ({ status }: StatusBannerProps) => {
  if (status === "APPROVED") return null;

  const config = {
    PENDING: {
      icon: <ClockIcon className="w-5 h-5" />,
      title: "Channel Under Review",
      description: "Your channel is currently being reviewed. This usually takes 24-48 hours.",
      bg: "bg-warning/10",
      border: "border-warning/20",
      text: "text-warning",
    },
    REJECTED: {
      icon: <XCircleIcon className="w-5 h-5" />,
      title: "Channel Rejected",
      description: "Your channel application was not approved. Check your email for details.",
      bg: "bg-error/10",
      border: "border-error/20",
      text: "text-error",
    },
    SUSPENDED: {
      icon: <ShieldExclamationIcon className="w-5 h-5" />,
      title: "Channel Suspended",
      description: "Access has been restricted. Please contact support to resolve this issue.",
      bg: "bg-muted-text/10",
      border: "border-muted-text/20",
      text: "text-muted-text",
    },
  };

  const active = config[status as keyof typeof config] || config.PENDING;

  return (
    <div className={`p-4 rounded-lg border ${active.bg} ${active.border} flex items-start gap-4 transition-all duration-300 mb-6`}>
      <div className={`shrink-0 ${active.text}`}>{active.icon}</div>
      <div className="space-y-1">
        <h6 className={`text-sm font-semibold ${active.text}`}>{active.title}</h6>
        <p className="text-xs text-secondary-text leading-relaxed">{active.description}</p>
      </div>
    </div>
  );
};

export default StatusBanner;
