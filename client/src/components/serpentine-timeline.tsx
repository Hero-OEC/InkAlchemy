import { useState, useMemo, useRef, useEffect } from "react";
import { Calendar, Crown, MapPin, Sword, Shield, Users, Zap, Heart, Skull, Eye, Settings } from "lucide-react";
import { Event, Character, Location } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TimelineEvent extends Event {
  characters?: Character[];
  location?: Location;
}

interface SerpentineTimelineProps {
  events: TimelineEvent[];
  characters: Character[];
  locations: Location[];
  onEventClick?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
}

interface FilterState {
  characters: string[];
  locations: string[];
}

interface EventBubbleProps {
  event: TimelineEvent;
  multiCount?: number;
  position: { x: number; y: number };
  side: "left" | "right";
  onEventClick?: (event: Event) => void;
}

interface TimelinePosition {
  x: number;
  y: number;
  side: "left" | "right";
}

// Writing stage color configurations using existing color system
const STAGE_COLORS = {
  planning: {
    bg: "bg-background",
    border: "border-border",
    icon: "text-muted-foreground"
  },
  writing: {
    bg: "bg-muted", 
    border: "border-border",
    icon: "text-foreground"
  },
  "first-draft": {
    bg: "bg-secondary",
    border: "border-border", 
    icon: "text-secondary-foreground"
  },
  editing: {
    bg: "bg-primary",
    border: "border-primary",
    icon: "text-primary-foreground"
  },
  complete: {
    bg: "bg-accent-foreground",
    border: "border-accent-foreground",
    icon: "text-background"
  }
};

// Event type icons
const EVENT_TYPE_ICONS = {
  battle: Sword,
  meeting: Users,
  discovery: Eye,
  political: Crown,
  personal: Heart,
  death: Skull,
  travel: MapPin,
  magic: Zap,
  other: Calendar
};

function EventBubble({ event, multiCount, position, side, onEventClick }: EventBubbleProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  const stageConfig = STAGE_COLORS[event.stage as keyof typeof STAGE_COLORS] || STAGE_COLORS.planning;
  const IconComponent = EVENT_TYPE_ICONS[event.type as keyof typeof EVENT_TYPE_ICONS] || Calendar;

  useEffect(() => {
    if (showPopup && bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      const timelineContainer = bubbleRef.current.closest('[style*="width: 1000px"]');
      const containerRect = timelineContainer?.getBoundingClientRect();
      
      let newX = rect.right + 10;
      let newY = rect.top - 50;
      
      // Check if popup would go off screen and adjust
      if (containerRect) {
        if (newX + 320 > containerRect.right) {
          newX = rect.left - 330;
        }
        if (newX < containerRect.left) {
          newX = containerRect.left + 10;
        }
      }
      
      setPopupPosition({ x: newX, y: newY });
    }
  }, [showPopup, side]);

  const truncateDescription = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <>
      <div
        ref={bubbleRef}
        className={cn(
          "absolute w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 z-10",
          stageConfig.bg,
          stageConfig.border
        )}
        style={{
          left: position.x - 24,
          top: position.y - 24
        }}
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
        onClick={() => onEventClick?.(event)}
      >
        {multiCount ? (
          <span className={cn("text-sm font-bold", stageConfig.icon)}>
            {multiCount}
          </span>
        ) : (
          <IconComponent className={cn("w-5 h-5", stageConfig.icon)} />
        )}
      </div>

      {/* Event Info Card positioned below bubble */}
      <div
        className={cn(
          "absolute bg-card rounded-lg px-3 py-2 text-xs text-card-foreground border border-border shadow-sm z-5",
          "transform -translate-x-1/2"
        )}
        style={{
          left: position.x,
          top: position.y + 35,
          width: "140px"
        }}
      >
        <div className="font-semibold truncate text-center">{event.title}</div>
        <div className="text-muted-foreground text-xs mt-1 text-center">
          Year {event.year}, Month {event.month}, Day {event.day}
        </div>
      </div>

      {/* Detailed Popup on Hover */}
      {showPopup && (
        <div
          className="fixed bg-popover rounded-lg shadow-xl border border-border p-4 z-50 max-w-xs"
          style={{
            left: popupPosition.x,
            top: popupPosition.y
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("p-1.5 rounded-lg", stageConfig.bg, stageConfig.border)}>
              <IconComponent className={cn("w-4 h-4", stageConfig.icon)} />
            </div>
            <div>
              <h4 className="font-semibold text-popover-foreground text-sm">{event.title}</h4>
              <div className="text-xs text-muted-foreground capitalize">{event.type} • {event.stage}</div>
            </div>
          </div>
          
          {event.description && (
            <p className="text-sm text-popover-foreground mb-3">
              {truncateDescription(event.description)}
            </p>
          )}

          {event.characters && event.characters.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium text-popover-foreground mb-1">Characters:</div>
              <div className="flex flex-wrap gap-1">
                {event.characters.slice(0, 3).map((char) => (
                  <span key={char.id} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">
                    {char.name}
                  </span>
                ))}
                {event.characters.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{event.characters.length - 3} more</span>
                )}
              </div>
            </div>
          )}

          {event.location && (
            <div className="mb-2">
              <div className="text-xs font-medium text-popover-foreground mb-1">Location:</div>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">
                {event.location.name}
              </span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Year {event.year}, Month {event.month}, Day {event.day}
          </div>
        </div>
      )}
    </>
  );
}

function TimelineLegend() {
  const stages = [
    { key: "planning", label: "Planning", color: STAGE_COLORS.planning },
    { key: "writing", label: "Writing", color: STAGE_COLORS.writing },
    { key: "first-draft", label: "First Draft", color: STAGE_COLORS["first-draft"] },
    { key: "editing", label: "Editing", color: STAGE_COLORS.editing },
    { key: "complete", label: "Complete", color: STAGE_COLORS.complete },
  ];

  return (
    <div className="bg-secondary rounded-lg p-4 border border-border mb-6">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {stages.map((stage) => (
          <div key={stage.key} className="flex items-center gap-2">
            <div className={cn(
              "w-4 h-4 rounded-full border-2",
              stage.color.bg,
              stage.color.border
            )} />
            <span className="text-sm font-medium text-secondary-foreground">{stage.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-accent border-2 border-accent-foreground flex items-center justify-center">
            <span className="text-xs font-bold text-accent-foreground">3</span>
          </div>
          <span className="text-sm font-medium text-secondary-foreground">Multiple Events</span>
        </div>
      </div>
    </div>
  );
}

export function SerpentineTimeline({ 
  events, 
  characters, 
  locations, 
  onEventClick, 
  onEventEdit 
}: SerpentineTimelineProps) {
  const [filters, setFilters] = useState<FilterState>({
    characters: [],
    locations: []
  });

  // Sort and group events by date
  const groupedEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const characterMatch = filters.characters.length === 0 || 
        filters.characters.some(charId => 
          event.characters?.some(char => char.id.toString() === charId)
        );
      
      const locationMatch = filters.locations.length === 0 || 
        filters.locations.includes(event.location?.id.toString() || "");
      
      return characterMatch && locationMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });

    // Group by exact date
    const grouped = new Map<string, TimelineEvent[]>();
    sorted.forEach((event) => {
      const dateKey = `${event.year}-${event.month}-${event.day}`;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    return Array.from(grouped.entries()).map(([dateKey, events]) => ({
      dateKey,
      events,
      isMultiple: events.length > 1
    }));
  }, [events, filters]);

  // Calculate serpentine positions
  const timelinePositions = useMemo(() => {
    const positions: (TimelinePosition & { 
      events: TimelineEvent[]; 
      isMultiple: boolean; 
      dateKey: string 
    })[] = [];
    
    const containerWidth = 1000;
    const margin = 80; // Margin from edges
    const usableWidth = containerWidth - (margin * 2);
    const eventsPerRow = 4; // Events per serpentine row
    const verticalSpacing = 150; // Vertical spacing between rows
    const startY = 80; // Starting Y position

    groupedEvents.forEach((group, index) => {
      const rowIndex = Math.floor(index / eventsPerRow);
      const positionInRow = index % eventsPerRow;
      
      const isEvenRow = rowIndex % 2 === 0;
      const y = startY + (rowIndex * verticalSpacing);
      
      let x: number;
      let side: "left" | "right";
      
      if (isEvenRow) {
        // Left to right
        x = margin + (positionInRow * (usableWidth / (eventsPerRow - 1)));
        side = positionInRow < eventsPerRow / 2 ? "left" : "right";
      } else {
        // Right to left
        x = margin + usableWidth - (positionInRow * (usableWidth / (eventsPerRow - 1)));
        side = positionInRow < eventsPerRow / 2 ? "right" : "left";
      }

      positions.push({
        x,
        y,
        side,
        events: group.events,
        isMultiple: group.isMultiple,
        dateKey: group.dateKey
      });
    });

    return positions;
  }, [groupedEvents]);

  const handleCharacterFilterChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      characters: value ? [value] : []
    }));
  };

  const handleLocationFilterChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      locations: value ? [value] : []
    }));
  };

  return (
    <div className="w-full">
      {/* Filter Section */}
      <div className="bg-secondary rounded-lg p-4 border border-border mb-4">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-secondary-foreground">Characters:</span>
            <select
              className="bg-background border border-border rounded px-3 py-1 text-sm text-foreground min-w-40"
              value={filters.characters[0] || ""}
              onChange={(e) => handleCharacterFilterChange(e.target.value)}
            >
              <option value="">Filter by character...</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id.toString()}>
                  {char.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-secondary-foreground">Locations:</span>
            <select
              className="bg-background border border-border rounded px-3 py-1 text-sm text-foreground min-w-40"
              value={filters.locations[0] || ""}
              onChange={(e) => handleLocationFilterChange(e.target.value)}
            >
              <option value="">Filter by location...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id.toString()}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <TimelineLegend />

      {/* Timeline Container */}
      <div className="relative w-full bg-background rounded-lg border border-border overflow-x-auto">
        <div 
          className="relative mx-auto"
          style={{ 
            width: "1000px", 
            height: `${Math.ceil(groupedEvents.length / 4) * 150 + 160}px`,
            minHeight: "400px"
          }}
        >
          {/* Dynamic Serpentine Path */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <path
              d={(() => {
                if (groupedEvents.length === 0) return "";
                
                const margin = 80;
                const usableWidth = 1000 - (margin * 2);
                const eventsPerRow = 4;
                const verticalSpacing = 150;
                const startY = 80;
                
                let pathCommands = [];
                const totalRows = Math.ceil(groupedEvents.length / eventsPerRow);
                
                for (let row = 0; row < totalRows; row++) {
                  const y = startY + (row * verticalSpacing);
                  const isEvenRow = row % 2 === 0;
                  
                  if (row === 0) {
                    // Start of the path
                    pathCommands.push(`M ${margin} ${y}`);
                  }
                  
                  if (isEvenRow) {
                    // Left to right
                    pathCommands.push(`L ${margin + usableWidth} ${y}`);
                    
                    // Add curve to next row if not last row
                    if (row < totalRows - 1) {
                      const nextY = y + verticalSpacing;
                      pathCommands.push(`Q ${margin + usableWidth + 40} ${y + verticalSpacing/2} ${margin + usableWidth} ${nextY}`);
                    }
                  } else {
                    // Right to left
                    pathCommands.push(`L ${margin} ${y}`);
                    
                    // Add curve to next row if not last row
                    if (row < totalRows - 1) {
                      const nextY = y + verticalSpacing;
                      pathCommands.push(`Q ${margin - 40} ${y + verticalSpacing/2} ${margin} ${nextY}`);
                    }
                  }
                }
                
                return pathCommands.join(' ');
              })()}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>

          {/* Event Bubbles */}
          {timelinePositions.map((position, index) => (
            <EventBubble
              key={position.dateKey}
              event={position.events[0]}
              multiCount={position.isMultiple ? position.events.length : undefined}
              position={{ x: position.x, y: position.y }}
              side={position.side}
              onEventClick={onEventClick}
            />
          ))}

          {/* No Events Message */}
          {groupedEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-lg font-medium">No events to display</p>
                <p className="text-sm">Try adjusting your filters or add some events to your timeline</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SerpentineTimeline;