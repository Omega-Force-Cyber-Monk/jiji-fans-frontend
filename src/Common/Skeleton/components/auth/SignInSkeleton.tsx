import React from "react";

const SignInSkeleton = () => {
  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto animate-pulse">
      {/* Heading */}
      <div className="h-8 bg-skeleton-bg rounded-md w-32 mx-auto mb-8"></div>

      {/* Dev Auto-Fill (simulated) */}
      <div className="mb-6 flex justify-center gap-2">
        <div className="h-7 bg-skeleton-bg rounded-md w-16"></div>
        <div className="h-7 bg-skeleton-bg rounded-md w-16"></div>
        <div className="h-7 bg-skeleton-bg rounded-md w-16"></div>
      </div>

      <div className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <div className="h-5 bg-skeleton-bg rounded-md w-20"></div>
          <div className="h-11 bg-skeleton-bg rounded-md w-full"></div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="h-5 bg-skeleton-bg rounded-md w-20"></div>
          <div className="h-11 bg-skeleton-bg rounded-md w-full"></div>
        </div>

        {/* Remember Me & Forget Password */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-skeleton-bg rounded-sm"></div>
            <div className="h-4 bg-skeleton-bg rounded-md w-24"></div>
          </div>
          <div className="h-4 bg-skeleton-bg rounded-md w-28"></div>
        </div>

        {/* Submit Button */}
        <div className="h-12 bg-skeleton-bg rounded-md w-full"></div>
      </div>

      {/* Footer link */}
      <div className="h-4 bg-skeleton-bg rounded-md w-48 mx-auto mt-10"></div>
    </div>
  );
};

export default SignInSkeleton;
