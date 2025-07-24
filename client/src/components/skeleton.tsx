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

// Timeline Event Bubble Skeleton - matches SerpentineTimeline circular bubbles
export function TimelineEventBubbleSkeleton({ position, side }: { position: { x: number; y: number }; side: "left" | "right" }) {
  return (
    <>
      {/* Event Bubble */}
      <div
        className="absolute w-8 h-8 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <Skeleton className="w-full h-full rounded-full" />
      </div>
      
      {/* Event Info Card */}
      <div
        className="absolute bg-brand-100 rounded-lg px-3 py-2 text-xs border border-brand-200 shadow-sm z-10 transform -translate-x-1/2"
        style={{
          left: position.x,
          top: position.y + 35,
          width: "140px"
        }}
      >
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-3 w-3/4 mx-auto" />
      </div>
    </>
  );
}

// Serpentine Timeline Skeleton - matches actual timeline structure
export function SerpentineTimelineSkeleton() {
  // Generate skeleton positions for events along a serpentine path
  const skeletonEvents = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    position: {
      x: 100 + (index * 80) + Math.sin(index * 0.8) * 40,
      y: 100 + Math.sin(index * 0.5) * 50
    },
    side: (Math.floor(index / 3) % 2 === 0 ? "left" : "right") as "left" | "right"
  }));

  return (
    <div className="relative bg-brand-100 rounded-lg border border-brand-200" style={{ minHeight: "400px" }}>
      {/* Serpentine Path Skeleton */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="animate-pulse" stopColor="rgb(var(--brand-300))" />
            <stop offset="50%" className="animate-pulse" stopColor="rgb(var(--brand-400))" />
            <stop offset="100%" className="animate-pulse" stopColor="rgb(var(--brand-300))" />
          </linearGradient>
        </defs>
        <path
          d="M 80 100 Q 200 50 320 100 T 560 100 T 800 100 T 1040 100"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          fill="none"
          className="opacity-60"
        />
      </svg>

      {/* Event Bubbles */}
      {skeletonEvents.map((event) => (
        <TimelineEventBubbleSkeleton
          key={event.id}
          position={event.position}
          side={event.side}
        />
      ))}
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