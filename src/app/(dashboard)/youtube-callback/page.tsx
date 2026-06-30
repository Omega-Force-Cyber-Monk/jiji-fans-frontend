"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useYoutubeCallbackMutation } from "@/redux/features/youtube/youtube.api";
import { Spin, Result, Button } from "antd";
import { successAlert, errorAlert, TResError } from "@/lib/alerts";
import SectionContainer from "@/components/ui/SectionContainer";

const YouTubeCallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [youtubeCallback, { isLoading, isError, error }] = useYoutubeCallbackMutation();
  const calledRef = useRef(false);

  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (calledRef.current) return;

    if (errorParam) {
      calledRef.current = true;
      return;
    }

    if (code) {
      calledRef.current = true;
      const handleCallback = async () => {
        try {
          await youtubeCallback({ code }).unwrap();
          successAlert({ text: "YouTube channel connected successfully!" });
          router.push("/upload-content");
        } catch (err) {
          console.error("YouTube callback failed:", err);
          errorAlert({ error: err as TResError });
        }
      };
      handleCallback();
    }
  }, [code, errorParam, youtubeCallback, router]);

  return (
    <SectionContainer className="flex items-center justify-center min-h-[60vh] mt-6">
      <div className="w-full max-w-md bg-secondary-bg p-8 rounded-lg border border-border-primary text-center">
        {isLoading && (
          <div className="space-y-6">
            <Spin size="large" />
            <h2 className="text-xl font-semibold text-primary-text">
              Connecting your YouTube channel...
            </h2>
            <p className="text-sm text-muted-text">
              Please wait while we establish a secure connection with Google.
            </p>
          </div>
        )}

        {isError && (
          <Result
            status="error"
            title="Connection Failed"
            subTitle={
              (error as any)?.data?.message ||
              "An error occurred while connecting your YouTube channel. Please try again."
            }
            extra={[
              <Button
                type="primary"
                key="retry"
                onClick={() => router.push("/upload-content")}
              >
                Back to Upload Content
              </Button>,
            ]}
          />
        )}

        {errorParam && (
          <Result
            status="warning"
            title="Authorization Cancelled"
            subTitle="You cancelled the Google authorization flow or access was denied."
            extra={[
              <Button
                type="primary"
                key="back"
                onClick={() => router.push("/upload-content")}
              >
                Back to Upload Content
              </Button>,
            ]}
          />
        )}

        {!code && !errorParam && !isLoading && !isError && (
          <Result
            status="info"
            title="Invalid Callback"
            subTitle="No authorization code was found in the URL."
            extra={[
              <Button
                type="primary"
                key="back"
                onClick={() => router.push("/upload-content")}
              >
                Back to Upload Content
              </Button>,
            ]}
          />
        )}
      </div>
    </SectionContainer>
  );
};

export default YouTubeCallbackPage;
