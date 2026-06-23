import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import React from "react";

const Default = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full pb-10">
      <div className="p-8 rounded-lg flex flex-col items-center text-center">
        <div className="mb-4 bg-blue-100 dark:bg-blue-950/30 p-4 rounded-full">
          <ChatBubbleLeftRightIcon className="text-blue-500 dark:text-blue-400 size-12" />
        </div>
        <h2 className="text-2xl font-semibold text-primary-text mb-2">
          Please select a conversation
        </h2>
        <p className="text-secondary-text mb-4">
          Choose a chat from the sidebar to start messaging
        </p>
      </div>
    </div>
  );
};

export default Default;
