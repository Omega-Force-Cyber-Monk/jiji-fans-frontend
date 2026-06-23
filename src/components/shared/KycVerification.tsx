import React, { useEffect } from "react";
import snsWebSdk from "@sumsub/websdk";
import { useStartKycMutation } from "@/redux/features/kyc/userKYC/userKyc.api";

interface KycVerificationProps {
  userEmail: string;
  token: string;
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
}

const KycVerification: React.FC<KycVerificationProps> = ({
  userEmail,
  token,
  onSuccess,
  onFailure,
}) => {
  const [startKyc] = useStartKycMutation();

  useEffect(() => {
    if (!token) return;

    const snsWebSdkInstance = snsWebSdk.init(
      token,
      async () => {
        const res = await startKyc().unwrap();
        return res?.data?.token || res?.token;
      }
    )
      .withConf({
        lang: "en",
        email: userEmail,
      })
      .on("idCheck.onStepCompleted", (payload) => {
        console.log("[KYC SDK] Step completed:", payload);
      })
      .on("idCheck.onApplicantStatusChanged", (payload) => {
        console.log("[KYC SDK] Applicant status changed:", payload);
        if (payload.reviewStatus === "completed" && payload.reviewResult?.reviewAnswer === "GREEN") {
          if (onSuccess) onSuccess();
        }
      })
      .on("idCheck.onError", (error) => {
        console.error("[KYC SDK] SDK Error:", error);
        if (onFailure) onFailure(error);
      })
      .build();

    snsWebSdkInstance.launch("#sumsub-sdk-container");

    return () => {
      snsWebSdkInstance.destroy();
    };
  }, [token, userEmail, onSuccess, onFailure, startKyc]);

  return (
    <div className="w-full space-y-4 p-0 m-0">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-primary-text">Automated Verification</h3>
        <p className="text-sm text-secondary-text">Complete the steps in the form below to verify your identity.</p>
      </div>
      <div id="sumsub-sdk-container" className="w-full rounded-md border border-border-primary" style={{ minHeight: "600px" }} />
    </div>
  );
};

export default KycVerification;
