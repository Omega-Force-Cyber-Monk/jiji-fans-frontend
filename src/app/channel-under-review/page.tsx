"use client";

import { ArrowRightIcon, ClockIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { logout } from "@/redux/features/auth/authSlice";

export default function ChannelUnderReview() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Clear all auth tokens and redux state
    dispatch(logout());
    
    // Redirect to sign-in page
    window.location.href = "/sign-in";
  };

  const handleGoHome = () => {
    router.push("/overview");
  };

  const handleContactSupport = () => {
    // Open email client with pre-filled subject
    window.location.href = "mailto:support@yourdomain.com?subject=Channel Review Inquiry";
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <ClockIcon className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-4">
          Channel Under Review
        </h1>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-4">
            Your channel is currently under review by our administration team. 
            This process typically takes 24-48 hours.
          </p>
          <p className="text-gray-500 text-sm lg:text-base">
            You'll receive a notification once the review is complete. 
            Thank you for your patience!
          </p>
        </div>

        {/* Status Indicator */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-blue-900 font-medium">Review In Progress</p>
              <p className="text-blue-700 text-sm">
                Your channel is in the queue and will be reviewed soon.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Go Home Button */}
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            <HomeIcon className="w-5 h-5" />
            Browse Content
          </button>

          {/* Contact Support Button */}
          <button
            onClick={handleContactSupport}
            className="inline-flex items-center justify-center gap-2 border-2 border-blue-500 hover:border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            Contact Support
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-lg hover:shadow-xl"
          >
            Sign Out
            <ArrowRightIcon className="w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm text-center">
            <strong>Note:</strong> While your channel is under review, you can still update your 
            channel information. Changes will be reflected once approved.
          </p>
        </div>
      </div>
    </main>
  );
}
