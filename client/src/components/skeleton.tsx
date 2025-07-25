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



// Serpentine Timeline Skeleton - responsive design that matches actual timeline
export function SerpentineTimelineSkeleton() {
  return (
    <div className="bg-brand-100 rounded-lg border border-brand-200 p-8">
      <div className="relative w-full" style={{ minHeight: "300px" }}>
        {/* Responsive Grid Layout for Event Skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 items-center">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex flex-col items-center space-y-3">
              {/* Event Bubble Skeleton */}
              <div className="relative">
                <Skeleton className="w-8 h-8 rounded-full" />
                {/* Connection line to next event */}
                {index < 7 && (
                  <div className="absolute top-4 left-4 w-16 h-px hidden sm:block">
                    <Skeleton className="w-full h-px" />
                  </div>
                )}
              </div>
              
              {/* Event Info Card Skeleton */}
              <div className="bg-brand-50 rounded-lg px-3 py-2 border border-brand-200 w-28">
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-2 w-3/4 mx-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Path Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-4xl">
            <Skeleton className="h-1 w-full rounded-full opacity-30" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Timeline Legend Skeleton
export function TimelineLegendSkeleton() {
  return (
    <div className="bg-brand-100 rounded-lg border border-brand-200">
      <div className="px-6 py-3 flex items-center justify-center gap-6 flex-wrap">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
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

// Characters Page Section Header Skeleton
export function CharactersSectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Skeleton className="h-11 w-24 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Race Card Skeleton - matches MiniCard structure
export function RaceCardSkeleton() {
  return (
    <div className="bg-brand-100 rounded-lg border border-brand-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="w-6 h-6 flex-shrink-0" />
      </div>
    </div>
  );
}

// Character Card Skeleton - matches CharacterCard structure
export function CharacterCardSkeleton() {
  return (
    <div className="bg-brand-100 rounded-xl border border-brand-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image Area */}
      <div className="h-48 bg-brand-200">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Content Area */}
      <div className="p-6">
        {/* Character Name and Type */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-3/4 mb-1" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="w-6 h-6 ml-2" />
        </div>

        {/* Description */}
        <div className="mb-4">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-4/5 mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// Races Grid Skeleton
export function RacesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <RaceCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Characters Grid Skeleton
export function CharactersGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <CharacterCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Location Page Header Skeleton
export function LocationPageHeaderSkeleton() {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <Skeleton className="h-12 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

// Content Card Skeleton - matches ContentCard structure used for locations
export function ContentCardSkeleton() {
  return (
    <div className="bg-brand-100 rounded-xl border border-brand-200 shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header with icon and title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="w-6 h-6 ml-2" />
      </div>

      {/* Description */}
      <div className="mb-4">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-4/5 mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Locations Grid Skeleton
export function LocationsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <ContentCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Magic Systems Page Header Skeleton
export function MagicSystemsPageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Skeleton className="h-12 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-44" />
      </div>
    </div>
  );
}

// Magic Systems Grid Skeleton
export function MagicSystemsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ContentCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Lore Page Header Skeleton
export function LorePageHeaderSkeleton() {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <Skeleton className="h-12 w-20 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

// Lore Grid Skeleton
export function LoreGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <ContentCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Notes Page Header Skeleton
export function NotesPageHeaderSkeleton() {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <Skeleton className="h-12 w-24 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

// Notes Grid Skeleton
export function NotesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <ContentCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Event Details Header Skeleton
export function EventDetailsHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-8 w-64 mb-2" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-3">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// Event Details Content Skeleton
export function EventDetailsContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Main Content Skeleton */}
      <div className="lg:col-span-2">
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-8">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <div className="space-y-6">
        {/* Location Section Skeleton */}
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-8">
          <Skeleton className="h-5 w-20 mb-4" />
          <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-200">
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Characters Section Skeleton */}
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-8">
          <Skeleton className="h-5 w-36 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-200">
                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-2/3 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Race Details Header Skeleton
export function RaceDetailsHeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}

// Race Details Content Skeleton
export function RaceDetailsContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Main Content - Description Skeleton */}
      <div className="lg:col-span-2">
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-8">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <div className="space-y-8">
        {/* Homeland Section Skeleton */}
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-6">
          <Skeleton className="h-5 w-20 mb-4" />
          <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-200">
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Physical Characteristics Section Skeleton */}
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Abilities & Powers Section Skeleton */}
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Characters Section Skeleton */}
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-6">
          <Skeleton className="h-5 w-44 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-200">
                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-2/3 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Character Details Header Skeleton
export function CharacterDetailsHeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}

// Character Details Tab Navigation Skeleton
export function CharacterDetailsTabsSkeleton() {
  return (
    <div className="border-b border-brand-200 mb-6">
      <nav className="flex space-x-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2 py-2 px-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </nav>
    </div>
  );
}

// Character Details Content Skeleton
export function CharacterDetailsContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Tab System Skeleton */}
      <div className="lg:col-span-2">
        {/* Tab Navigation Skeleton */}
        <CharacterDetailsTabsSkeleton />

        {/* Tab Content Skeleton */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Character Info Skeleton */}
      <div className="space-y-6">
        {/* Character Profile Card Skeleton */}
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-18" />
            </div>
          </div>
        </div>

        {/* Additional Info Card Skeleton */}
        <div className="bg-brand-100 rounded-xl border border-brand-200 p-6">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Location Details Header Skeleton
export function LocationDetailsHeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}

// Location Details Tab Navigation Skeleton
export function LocationDetailsTabsSkeleton() {
  return (
    <div className="border-b border-brand-200 mb-6">
      <nav className="flex space-x-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2 py-4 px-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </nav>
    </div>
  );
}

// Location Details Content Skeleton
export function LocationDetailsContentSkeleton() {
  return (
    <div>
      {/* Tab Navigation Skeleton */}
      <LocationDetailsTabsSkeleton />

      {/* Tab Content Skeleton */}
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Magic System Details Header Skeleton
export function MagicSystemDetailsHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>
      
      <div className="flex gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Magic System Details Tab Navigation Skeleton
export function MagicSystemDetailsTabsSkeleton() {
  return (
    <div className="border-b border-brand-200 mb-6">
      <nav className="flex space-x-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2 py-2 px-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </nav>
    </div>
  );
}

// Magic System Details Content Skeleton
export function MagicSystemDetailsContentSkeleton() {
  return (
    <div>
      {/* Tab Navigation Skeleton */}
      <MagicSystemDetailsTabsSkeleton />

      {/* Tab Content Skeleton */}
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Spell Details Header Skeleton
export function SpellDetailsHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// Spell Details Content Skeleton
export function SpellDetailsContentSkeleton() {
  return (
    <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
      <Skeleton className="h-6 w-24 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// Lore Details Header Skeleton
export function LoreDetailsHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// Lore Details Content Skeleton
export function LoreDetailsContentSkeleton() {
  return (
    <div>
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
      
      {/* Metadata Skeleton */}
      <div className="mt-6 text-center">
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

// Note Details Header Skeleton
export function NoteDetailsHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// Note Details Content Skeleton
export function NoteDetailsContentSkeleton() {
  return (
    <div>
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
      
      {/* Metadata Skeleton */}
      <div className="mt-6 text-center">
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

// Event Form Header Skeleton
export function EventFormHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Event Form Content Skeleton
export function EventFormContentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Title Input Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        
        {/* Status and Type Badges Row */}
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Area - Description */}
        <div className="lg:col-span-2">
          <div className="bg-brand-100 border border-brand-200 rounded-xl p-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Locations Section */}
          <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>

          {/* Characters Section */}
          <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Race Form Header Skeleton
export function RaceFormHeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

// Race Form Content Skeleton
export function RaceFormContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Main Content Area - Left side (2/3) */}
      <div className="lg:col-span-2">
        {/* Basic Information Container */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-8 mb-8">
          <Skeleton className="h-6 w-40 mb-6" />
          
          <div className="space-y-6">
            {/* Race Name */}
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>

        {/* Content Container - Description */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>

      {/* Sidebar - Right side (1/3) */}
      <div className="space-y-8">
        {/* Homeland Section */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <Skeleton className="h-5 w-20 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>

        {/* Physical Characteristics */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Abilities & Powers */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <Skeleton className="h-5 w-28 mb-4" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Characters Section */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="text-center py-6">
            <Skeleton className="w-6 h-6 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto mb-3" />
            <Skeleton className="h-8 w-32 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Character Form Header Skeleton
export function CharacterFormHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-44 mb-2" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

// Character Form Content Skeleton
export function CharacterFormContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Tabbed Content (2/3) */}
      <div className="lg:col-span-2">
        {/* Tab Navigation Skeleton */}
        <div className="border-b border-brand-200">
          <nav className="-mb-px flex space-x-8">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-32" />
          </nav>
        </div>

        {/* Tab Content Skeleton */}
        <div className="space-y-6 mt-6">
          {/* Basic Information Section */}
          <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Character Profile (1/3) */}
      <div className="space-y-6">
        {/* Character Image */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <Skeleton className="h-5 w-28 mb-4" />
          <Skeleton className="w-full h-48 rounded-lg mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Race Section */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <Skeleton className="h-5 w-12 mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Physical & Role Details */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-8 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Equipment & Combat */}
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <Skeleton className="h-5 w-36 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Location Form Header Skeleton
export function LocationFormHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <div className="flex items-center gap-3 mt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Location Form Content Skeleton
export function LocationFormContentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Basic Information Container */}
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
        <Skeleton className="h-6 w-36 mb-6" />
        
        <div className="space-y-6">
          {/* Location Name */}
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
          
          {/* Location Type */}
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
        <Skeleton className="h-6 w-20 mb-6" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

// Magic System Form Header Skeleton
export function MagicSystemFormHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="flex items-center gap-3 mt-2">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

// Magic System Form Content Skeleton
export function MagicSystemFormContentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Tab Navigation Skeleton */}
      <div className="border-b border-brand-200">
        <nav className="-mb-px flex space-x-8">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-36" />
        </nav>
      </div>

      {/* Tab Content Skeleton */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>

          {/* System Properties Section */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Spell Form Header Skeleton
export function SpellFormHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-36 mb-2" />
          <div className="flex items-center gap-3 mt-2">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Spell Form Content Skeleton
export function SpellFormContentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Form Container */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lore Form Header Skeleton
export function LoreFormHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Lore Form Content Skeleton
export function LoreFormContentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Form Container */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>

          {/* Category Field */}
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>

          {/* Content Section */}
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Note Form Header Skeleton
export function NoteFormHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// Note Form Content Skeleton
export function NoteFormContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Basic Information Container */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
        <Skeleton className="h-6 w-36 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Note Title */}
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
          {/* Category */}
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        
        {/* Color Selection */}
        <div className="mt-6">
          <Skeleton className="h-4 w-20 mb-4" />
          <div className="flex gap-3">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
        <Skeleton className="h-6 w-20 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

