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

// Dashboard Header Skeleton
export function DashboardHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-12 w-96 mb-2" />
      <Skeleton className="h-6 w-80" />
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-brand-100 rounded-lg p-6 border border-brand-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex-shrink-0 ml-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Stats Grid Skeleton
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <StatsCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Edit History Item Skeleton
export function EditHistoryItemSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg">
      <Skeleton className="flex-shrink-0 w-8 h-8 rounded-lg" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="w-1 h-1 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-4 w-full" />
      </div>
      
      <div className="flex-shrink-0 text-right">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// Edit History Section Skeleton
export function EditHistorySkeleton() {
  return (
    <div className="bg-brand-100 rounded-lg border border-brand-200 shadow-sm">
      <div className="px-6 py-4 border-b border-brand-200">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-64 mt-1" />
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <EditHistoryItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Timeline Page Header Skeleton
export function TimelineHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

// Timeline Event Skeleton - matches SerpentineTimeline event structure
export function TimelineEventSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-brand-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Event Header */}
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4 mb-1" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Event Description */}
      <div className="mb-3">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Event Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Timeline Grid Skeleton - matches SerpentineTimeline responsive layout
export function TimelineGridSkeleton() {
  return (
    <div className="relative">
      {/* Timeline Path Skeleton */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="skeleton-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" className="fill-brand-200 animate-pulse" />
            </pattern>
          </defs>
          <path
            d="M 100 50 Q 200 100 300 50 T 500 50 T 700 50 T 900 50"
            stroke="url(#skeleton-pattern)"
            strokeWidth="3"
            fill="none"
            className="opacity-50"
          />
        </svg>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {Array.from({ length: 8 }).map((_, index) => (
          <TimelineEventSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// Empty Timeline Skeleton
export function EmptyTimelineSkeleton() {
  return (
    <div className="text-center py-16">
      <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6" />
      <Skeleton className="h-6 w-48 mx-auto mb-2" />
      <Skeleton className="h-4 w-64 mx-auto mb-6" />
      <Skeleton className="h-10 w-40 mx-auto" />
    </div>
  );
}