export default function LoadingSkeleton() {
  return (
    <div className="mx-auto p-8 bg-white animate-pulse">
      {/* Section 1 Skeleton */}
      <section className="mb-8">
        <div className="h-8 bg-gray-300 rounded mb-6 w-48"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </section>

      {/* Section 2 Skeleton */}
      <section className="mb-8">
        <div className="h-8 bg-gray-300 rounded mb-6 w-80"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>

          {/* Bullet points skeleton */}
          <div className="pl-6 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-72"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-56"></div>
            </div>
          </div>

          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </section>

      {/* Section 3 Skeleton */}
      <section className="mb-8">
        <div className="h-8 bg-gray-300 rounded mb-6 w-56"></div>

        {/* Subsection 3.1 */}
        <div className="mb-6">
          <div className="h-6 bg-gray-300 rounded mb-4 w-44"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        {/* Subsection 3.2 */}
        <div className="mb-6">
          <div className="h-6 bg-gray-300 rounded mb-4 w-60"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>

            {/* More bullet points skeleton */}
            <div className="pl-6 space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
