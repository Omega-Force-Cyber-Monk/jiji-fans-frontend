"use client";

import { ArrowRightIcon, ExclamationTriangleIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { logout } from "@/redux/features/auth/authSlice";

export default function ChannelSuspended() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Clear all auth tokens and redux state
    dispatch(logout());
    
    // Redirect to sign-in page
    window.location.href = "/sign-in";
  };

  const handleContactSupport = () => {
    // Open email client with pre-filled subject
    window.location.href = "mailto:support@yourdomain.com?subject=Channel Suspension Inquiry";
  };

  const handleGoHome = () => {
    router.push("/overview");
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-orange-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-4">
          Channel Suspended
        </h1>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-4">
            Your channel has been suspended by administration. You currently cannot access 
            channel features, upload content, or manage your channel.
          </p>
          <p className="text-gray-500 text-sm lg:text-base">
            If you believe this is an error or would like to appeal this decision, 
            please contact our support team for assistance.
          </p>
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
            Go Home
          </button>

          {/* Contact Support Button */}
          <button
            onClick={handleContactSupport}
            className="inline-flex items-center justify-center gap-2 border-2 border-orange-500 hover:border-orange-600 bg-orange-50 hover:bg-orange-100 text-orange-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
            Contact Support
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-lg hover:shadow-xl"
          >
            Sign Out
            <ArrowRightIcon className="w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm text-center">
            <strong>Note:</strong> Your channel content and subscriber data remain securely stored 
            during suspension. Once your channel is reinstated, you'll have full access again.
          </p>
        </div>
      </div>
    </main>
  );
}
