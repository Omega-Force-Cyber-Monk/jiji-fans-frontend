"use client";

import { Button } from "antd";
import { ExclamationTriangleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface ChannelErrorStateProps {
  type: "unavailable" | "generic";
  onBack?: () => void;
  onRetry?: () => void;
}

const ChannelErrorState = ({ type, onBack, onRetry }: ChannelErrorStateProps) => {
  if (type === "unavailable") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
        <div className="bg-warning/10 p-6 rounded-lg animate-pulse">
          <ExclamationTriangleIcon className="w-16 h-16 text-warning" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-primary-text">
            Channel Unavailable
          </h1>
          <p className="text-secondary-text max-w-md mx-auto text-base">
            This channel has been suspended, removed, or the link is incorrect.
            Please check the URL or try again later.
          </p>
        </div>
        {onBack && (
          <Button
            type="primary"
            size="large"
            onClick={onBack}
            className="h-12 px-8 font-semibold flex items-center gap-2"
            icon={<ArrowLeftIcon className="w-5 h-5" />}
          >
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <p className="text-error font-medium text-base">
        Something went wrong while loading the channel.
      </p>
      {onRetry && (
        <Button onClick={onRetry}>Retry</Button>
      )}
    </div>
  );
};

export default ChannelErrorState;
