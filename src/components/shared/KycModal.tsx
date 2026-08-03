"use client";

import React from "react";
import GlobalModal from "@/components/GlobalModal";

interface KycModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
}

const KycModal = ({ isOpen, setIsOpen, onConfirm, onCancel }: KycModalProps) => {
  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) onCancel();
  };

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm();
  };

  return (
    <GlobalModal
      isModalOpen={isOpen}
      setIsModalOpen={setIsOpen}
      onClose={handleCancel}
      maxWidth="480px"
    >
      <div className="space-y-6 relative overflow-hidden rounded-xl bg-secondary-bg text-primary-text">
        {/* Header/Icon */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-orange-500"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-primary-text">
            Complete Your KYC Verification
          </h3>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-center">
          <p className="text-secondary-text text-sm leading-relaxed">
            You are now a <strong className="text-primary-text">Creator</strong>.<br />
            You have access to all creator features, but to enable <strong className="text-primary-text">withdrawals</strong> you must complete your KYC / KYB verification.
          </p>

          {/* Warning box */}
          <div className="bg-orange-500/10 dark:bg-orange-500/5 border border-orange-500/25 dark:border-orange-500/15 rounded-xl p-3.5 flex items-start gap-3 text-left">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-orange-500 shrink-0 mt-0.5"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed font-medium">
              Verification is reviewed within <strong>1–3 business days</strong>. You'll be notified by email once approved.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-10 py-2.5 bg-secondary-bg hover:bg-secondary-bg/80 text-secondary-text border border-border-primary hover:border-brand-primary font-semibold rounded-full text-sm transition-all duration-200 cursor-pointer active:scale-95 text-center"
          >
            Later
          </button>
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-sm transition-all duration-200 cursor-pointer active:scale-95 text-center"
          >
            Verify Now →
          </button>
        </div>
      </div>
    </GlobalModal>
  );
};

export default KycModal;
