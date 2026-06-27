import Container from "@/components/Container";

export default function LoadingSkeleton() {
  return (
    <div className="bg-primary-bg min-h-screen text-primary-text animate-pulse">
      {/* Header Skeleton */}
      <Container
        className="bg-gradient-to-b from-brand-primary/10 via-secondary-bg/30 to-primary-bg pt-28 pb-14 border-b border-border-primary text-center"
        mClassName="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4"
      >
        <div className="h-10 bg-secondary-bg border border-border-primary rounded-lg w-64 mx-auto"></div>
        <div className="h-4 bg-secondary-bg border border-border-primary rounded-md w-96 mx-auto mt-2"></div>
      </Container>

      {/* Content Skeleton */}
      <Container mClassName="max-w-4xl mx-auto py-10 md:py-14 space-y-8">
        <div className="space-y-4">
          <div className="h-6 bg-secondary-bg border border-border-primary rounded w-48"></div>
          <div className="space-y-3">
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-full"></div>
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-full"></div>
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-3/4"></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 bg-secondary-bg border border-border-primary rounded w-64"></div>
          <div className="space-y-3">
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-full"></div>
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-5/6"></div>
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-2/3"></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 bg-secondary-bg border border-border-primary rounded w-56"></div>
          <div className="space-y-3">
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-full"></div>
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-full"></div>
            <div className="h-4 bg-secondary-bg border border-border-primary rounded w-4/5"></div>
          </div>
        </div>
      </Container>
    </div>
  );
}
