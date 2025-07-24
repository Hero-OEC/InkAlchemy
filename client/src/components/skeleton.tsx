import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-brand-200",
        className
      )}
    />
  );
}

// Project Card Skeleton - matches ContentCard structure
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-brand-200 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header with icon and title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      {/* Description */}
      <div className="mb-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Footer with timestamps */}
      <div className="flex justify-between items-center text-sm pt-4 border-t border-brand-100">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Projects Grid Skeleton
export function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Welcome Page Header Skeleton
export function WelcomeHeaderSkeleton() {
  return (
    <div className="text-center mb-16">
      <Skeleton className="h-12 w-96 mx-auto mb-6" />
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </div>
    </div>
  );
}

// Projects Section Header Skeleton
export function ProjectsSectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-44" />
      </div>
    </div>
  );
}