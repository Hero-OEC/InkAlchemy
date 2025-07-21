import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import SerpentineTimeline from "@/components/serpentine-timeline";
import { Button } from "@/components/button-variations";
import { Plus, Calendar } from "lucide-react";
import type { Project, Event, Character, Location, Relationship } from "@shared/schema";

export default function Timeline() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: [`/api/projects/${projectId}/events`],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleEventClick = (event: Event) => {
    setLocation(`/projects/${projectId}/events/${event.id}`);
  };

  const handleEventEdit = (event: Event) => {
    setLocation(`/projects/${projectId}/events/${event.id}/edit`);
  };

  const handleCreateEvent = () => {
    setLocation(`/projects/${projectId}/timeline/new-event`);
  };

  // Process events with relationships to add character and location data
  const processedEvents = events.map(event => {
    const eventRelationships = relationships.filter(rel => 
      rel.fromElementType === 'event' && rel.fromElementId === event.id
    );
    
    const eventCharacters = eventRelationships
      .filter(rel => rel.toElementType === 'character')
      .map(rel => characters.find(char => char.id === rel.toElementId))
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

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar 
        hasActiveProject={true} 
        currentPage="timeline"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brand-900 mb-2">Timeline</h1>
            <p className="text-brand-700">
              Track the chronological events in your story world
            </p>
          </div>
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleCreateEvent}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        </div>

        {/* Timeline Content */}
        {events.length > 0 ? (
          <div className="p-6">
            <SerpentineTimeline
              events={processedEvents}
              characters={characters}
              locations={locations}
              onEventClick={handleEventClick}
              onEventEdit={handleEventEdit}
            />
          </div>
        ) : (
          <div className="p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-brand-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-900 mb-2">No events yet</h3>
              <p className="text-brand-600 mb-6">
                Start building your story timeline by adding your first event
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleCreateEvent}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create First Event
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}