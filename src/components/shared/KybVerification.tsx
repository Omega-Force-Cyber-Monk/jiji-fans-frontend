import React, { useEffect } from "react";
import snsWebSdk from "@sumsub/websdk";
import { useStartKycMutation } from "@/redux/features/kyc/userKYC/userKyc.api";

interface KybVerificationProps {
  userEmail: string;
  token: string;
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
}

const KybVerification: React.FC<KybVerificationProps> = ({
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
        console.log("[KYB SDK] Step completed:", payload);
      })
      .on("idCheck.onApplicantStatusChanged", (payload) => {
        console.log("[KYB SDK] Applicant status changed:", payload);
        if (payload.reviewStatus === "completed" && payload.reviewResult?.reviewAnswer === "GREEN") {
          if (onSuccess) onSuccess();
        }
      })
      .on("idCheck.onError", (error) => {
        console.error("[KYB SDK] SDK Error:", error);
        if (onFailure) onFailure(error);
      })
      .build();

    snsWebSdkInstance.launch("#sumsub-kyb-container");

    return () => {
      snsWebSdkInstance.destroy();
    };
  }, [token, userEmail, onSuccess, onFailure, startKyc]);

  return (
    <div className="w-full space-y-4 p-0 m-0">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-primary-text">Corporate Business Verification</h3>
        <p className="text-sm text-secondary-text">Provide your corporate credentials to verify your business identity.</p>
      </div>
      <div id="sumsub-kyb-container" className="w-full rounded-md border border-border-primary" style={{ minHeight: "650px" }} />
    </div>
  );
};

export default KybVerification;
