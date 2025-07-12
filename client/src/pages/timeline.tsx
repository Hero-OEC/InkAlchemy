import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Event, Character, Location, Relationship } from "@shared/schema";
import SerpentineTimeline from "../components/serpentine-timeline";
import { Calendar, Plus } from "lucide-react";
import { useState } from "react";

interface TimelineEvent extends Event {
  characters?: Character[];
  location?: Location;
}

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>();
  const projectId = id || "1"; // Default to project 1 for demo
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch events for the project
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/projects", projectId, "events"]
  });

  // Fetch characters for the project (for filtering)
  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ["/api/projects", projectId, "characters"]
  });

  // Fetch locations for the project (for filtering and event details)
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/projects", projectId, "locations"]
  });

  // Fetch relationships to connect characters to events
  const { data: relationships = [], isLoading: relationshipsLoading } = useQuery<Relationship[]>({
    queryKey: ["/api/projects", projectId, "relationships"]
  });

  // Create enriched events with related data
  const enrichedEvents: TimelineEvent[] = events.map(event => {
    const location = event.locationId ? locations.find(loc => loc.id === event.locationId) : undefined;
    
    // Find characters related to this event through relationships
    const eventCharacterRelationships = relationships.filter(rel => 
      rel.fromElementType === "event" && 
      rel.fromElementId === event.id && 
      rel.toElementType === "character"
    );
    
    const relatedCharacters = eventCharacterRelationships
      .map(rel => characters.find(char => char.id === rel.toElementId))
      .filter((char): char is Character => char !== undefined);

    // Debug logging
    console.log(`Event ${event.id} (${event.title}):`, {
      locationId: event.locationId,
      location: location?.name,
      relationshipCount: eventCharacterRelationships.length,
      characterNames: relatedCharacters.map(c => c.name)
    });

    return {
      ...event,
      location,
      characters: relatedCharacters
    };
  });

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    // Future: Navigate to event edit form or show detailed modal
    console.log("Event clicked:", event);
  };

  const handleEventEdit = (event: Event) => {
    // Future: Open event edit form
    console.log("Edit event:", event);
  };

  if (eventsLoading || charactersLoading || locationsLoading || relationshipsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-brand-200 rounded w-64 mb-6"></div>
          <div className="h-40 bg-brand-100 rounded mb-4"></div>
          <div className="h-80 bg-brand-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-200 rounded-lg">
            <Calendar className="w-6 h-6 text-brand-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-950">Timeline</h1>
            <p className="text-brand-600">Visualize your story's chronological flow</p>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Event Count Summary */}
      <div className="bg-brand-50 rounded-lg p-4 border border-brand-200 mb-6">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-brand-800">Total Events:</span>
            <span className="bg-brand-200 px-2 py-1 rounded text-brand-900 font-medium">
              {events.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-brand-800">Time Span:</span>
            <span className="bg-brand-200 px-2 py-1 rounded text-brand-900 font-medium">
              {events.length > 0 ? `Year ${Math.min(...events.map(e => e.year))} - Year ${Math.max(...events.map(e => e.year))}` : "No events"}
            </span>
          </div>
        </div>
      </div>

      {/* Serpentine Timeline */}
      <SerpentineTimeline
        events={enrichedEvents}
        characters={characters}
        locations={locations}
        onEventClick={handleEventClick}
        onEventEdit={handleEventEdit}
      />

      {/* Selected Event Details (Future enhancement) */}
      {selectedEvent && (
        <div className="mt-6 bg-white border border-brand-200 rounded-lg p-4">
          <h3 className="font-semibold text-brand-950 mb-2">Selected Event: {selectedEvent.title}</h3>
          <p className="text-brand-700">{selectedEvent.description}</p>
          <div className="mt-2 text-sm text-brand-600">
            Year {selectedEvent.year}, Month {selectedEvent.month}, Day {selectedEvent.day}
          </div>
        </div>
      )}
    </div>
  );
}