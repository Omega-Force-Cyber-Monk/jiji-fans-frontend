import { ClockIcon, XCircleIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { TChannelStatus } from "@/redux/features/channel/channel.api";

interface StatusBannerProps {
  status: TChannelStatus;
}

const StatusBanner = ({ status }: StatusBannerProps) => {
  if (status === "APPROVED") return null;

  const config = {
    PENDING: {
      icon: <ClockIcon className="w-6 h-6 animate-pulse" />,
      title: "Channel Under Review",
      description: "Your channel is currently being reviewed by our administrators. This usually takes 24-48 hours. Thank you for your patience!",
      bg: "bg-amber-500/5 backdrop-blur-md",
      border: "border-amber-500/20 border-l-4 border-l-amber-500",
      text: "text-amber-500",
      shadow: "shadow-lg shadow-amber-500/5",
    },
    REJECTED: {
      icon: <XCircleIcon className="w-6 h-6" />,
      title: "Channel Application Rejected",
      description: "Your channel application was not approved. Please check your registered email for details on why this decision was made and how to reapply.",
      bg: "bg-red-500/5 backdrop-blur-md",
      border: "border-red-500/20 border-l-4 border-l-red-500",
      text: "text-red-500",
      shadow: "shadow-lg shadow-red-500/5",
    },
    SUSPENDED: {
      icon: <ShieldExclamationIcon className="w-6 h-6" />,
      title: "Channel Access Suspended",
      description: "Your channel access has been restricted due to a violation of our community guidelines. Please reach out to customer support to appeal.",
      bg: "bg-neutral-500/5 backdrop-blur-md",
      border: "border-neutral-500/20 border-l-4 border-l-neutral-500",
      text: "text-neutral-400",
      shadow: "shadow-lg shadow-neutral-500/5",
    },
  };

  const active = config[status as keyof typeof config] || config.PENDING;

  return (
    <div className={`p-5 rounded-r-xl rounded-l-md border ${active.bg} ${active.border} ${active.shadow} flex items-start gap-4 transition-all duration-300 mb-6 animate-in fade-in slide-in-from-top-4 duration-500`}>
      <div className={`shrink-0 p-2 rounded-lg bg-secondary-bg/80 border border-border-primary/50${active.text}`}>{active.icon}</div>
      <div className="space-y-1 py-0.5">
        <h6 className={`text-base font-bold tracking-wide ${active.text}`}>{active.title}</h6>
        <p className="text-sm text-secondary-text leading-relaxed font-medium max-w-2xl">{active.description}</p>
      </div>
    </div>
  );
};

export default StatusBanner;
