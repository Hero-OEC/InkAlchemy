import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { Navbar } from "@/components/navbar";
import { SearchComponent } from "@/components/search-component";
import SerpentineTimeline from "@/components/serpentine-timeline";
import { Button } from "@/components/button-variations";
import { Plus, Calendar } from "lucide-react";
import type { Project, Event, Character, Location, Relationship } from "@shared/schema";

export default function Timeline() {
  const { projectId } = useParams();
  const [currentPath, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { navigateWithReferrer } = useNavigation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: [`/api/projects/${projectId}/events`],
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
  });

  // Set page title
  useEffect(() => {
    if (project?.name) {
      document.title = `Timeline - ${project.name} | StoryForge`;
    } else {
      document.title = "Timeline | StoryForge";
    }
  }, [project?.name]);

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleEventClick = (event: Event) => {
    navigateWithReferrer(`/projects/${projectId}/events/${event.id}`, currentPath);
  };

  const handleEventEdit = (event: Event) => {
    setLocation(`/projects/${projectId}/events/${event.id}/edit`);
  };

  const handleCreateEvent = () => {
    setLocation(`/projects/${projectId}/timeline/new-event`);
  };

  // Define search filters - only populate when data is loaded
  const searchFilters = useMemo(() => {
    if (locationsLoading || charactersLoading) {
      return [];
    }
    
    return [
      {
        key: "stage",
        label: "Writing Stage",
        options: [
          { value: "planning", label: "Planning" },
          { value: "writing", label: "Writing" },
          { value: "first-draft", label: "First Draft" },
          { value: "editing", label: "Editing" },
          { value: "complete", label: "Complete" }
        ]
      },
      {
        key: "type",
        label: "Event Type",
        options: [
          { value: "battle", label: "Battle" },
          { value: "meeting", label: "Meeting" },
          { value: "discovery", label: "Discovery" },
          { value: "journey", label: "Journey" },
          { value: "celebration", label: "Celebration" },
          { value: "tragedy", label: "Tragedy" },
          { value: "ritual", label: "Ritual" },
          { value: "political", label: "Political" },
          { value: "personal", label: "Personal" },
          { value: "magical", label: "Magical" },
          { value: "other", label: "Other" }
        ]
      },
      {
        key: "locationId",
        label: "Location",
        options: locations.map(location => ({
          value: location.id.toString(),
          label: location.name
        }))
      },
      {
        key: "characterId",
        label: "Character",
        options: characters.map(character => ({
          value: character.id.toString(),
          label: character.name
        }))
      }
    ];
  }, [locations, characters, locationsLoading, charactersLoading]);

  // Process events with relationships to add character and location data
  const processedEvents = events.map(event => {
    const eventRelationships = relationships.filter(rel => 
      rel.sourceType === 'event' && rel.sourceId === event.id
    );
    
    const eventCharacters = eventRelationships
      .filter(rel => rel.targetType === 'character')
      .map(rel => characters.find(char => char.id === rel.targetId))
      .filter(Boolean) as Character[];
    
    const eventLocation = event.locationId 
      ? locations.find(loc => loc.id === event.locationId)
      : undefined;

    return {
      ...event,
      characters: eventCharacters,
      location: eventLocation
    };
  });

  // Filter events based on search and filters
  const filteredEvents = processedEvents.filter((event) => {
    // Text search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(searchLower);
      const matchesDescription = event.description?.toLowerCase().includes(searchLower);
      const matchesLocation = event.location?.name.toLowerCase().includes(searchLower);
      const matchesCharacters = event.characters.some(char => 
        char.name.toLowerCase().includes(searchLower)
      );
      
      if (!matchesTitle && !matchesDescription && !matchesLocation && !matchesCharacters) {
        return false;
      }
    }

    // Filter by writing stage
    if (activeFilters.stage && event.stage !== activeFilters.stage) {
      return false;
    }

    // Filter by event type
    if (activeFilters.type && event.type !== activeFilters.type) {
      return false;
    }

    // Filter by location
    if (activeFilters.locationId && event.locationId?.toString() !== activeFilters.locationId) {
      return false;
    }

    // Filter by character
    if (activeFilters.characterId) {
      const hasCharacter = event.characters.some(char => 
        char.id.toString() === activeFilters.characterId
      );
      if (!hasCharacter) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="timeline"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brand-900 mb-2">Timeline</h1>
            <p className="text-brand-700">
              Track the chronological events in your story world
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <SearchComponent
              placeholder="Search events..."
              onSearch={setSearchQuery}
              onFilterChange={setActiveFilters}
              filters={searchFilters}
              showFilters={true}
            />
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleCreateEvent}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Timeline Content */}
        {events.length === 0 ? (
          <div className="p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-brand-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-900 mb-2">No events yet</h3>
              <p className="text-brand-600 mb-6">
                Start building your story timeline by adding your first event
              </p>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleCreateEvent}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create First Event
              </Button>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-brand-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-900 mb-2">No Results Found</h3>
              <p className="text-brand-600 mb-6">
                No events match your search criteria. Try adjusting your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <SerpentineTimeline
              events={filteredEvents}
              characters={characters}
              locations={locations}
              onEventClick={handleEventClick}
              onEventEdit={handleEventEdit}
            />
          </div>
        )}
      </main>
    </div>
  );
}