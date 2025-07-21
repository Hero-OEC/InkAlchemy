import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button-variations";
import { MiniCard } from "@/components/mini-card";
import SerpentineTimeline from "@/components/serpentine-timeline";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Users, Landmark, Crown } from "lucide-react";
import type { Project, Location, Character, Event, Relationship } from "@shared/schema";
import { Building2, Trees, Castle, Mountain, Home, Globe } from "lucide-react";

// Location type icons
const LOCATION_TYPE_ICONS = {
  settlement: Building2,
  city: Building2,
  village: Home,
  town: Building2,
  natural: Trees,
  forest: Trees,
  mountain: Mountain,
  river: Globe,
  lake: Globe,
  ocean: Globe,
  building: Landmark,
  fortress: Castle,
  castle: Castle,
  temple: Landmark,
  academy: Landmark,
  tower: Castle,
  dungeon: Castle,
  other: Globe,
};

export default function LocationDetails() {
  const { projectId, locationId } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Redirect if this is the create route
  useEffect(() => {
    if (locationId === "new") {
      setLocation(`/projects/${projectId}/locations/new`);
    }
  }, [locationId, projectId, setLocation]);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: location } = useQuery<Location>({
    queryKey: [`/api/locations/${locationId}`],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: [`/api/projects/${projectId}/events`],
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: [`/api/projects/${projectId}/relationships`],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [`/api/projects/${projectId}/locations`],
  });

  const handleNavigation = (page: string) => {
    setLocation(`/projects/${projectId}/${page}`);
  };

  const handleBack = () => {
    setLocation(`/projects/${projectId}/locations`);
  };

  const handleEdit = () => {
    setLocation(`/projects/${projectId}/locations/${locationId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setLocation(`/projects/${projectId}/locations`);
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const handleCharacterClick = (character: Character) => {
    setLocation(`/projects/${projectId}/characters/${character.id}`);
  };

  const handleEventClick = (event: Event) => {
    setLocation(`/projects/${projectId}/events/${event.id}`);
  };

  if (!location) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          hasActiveProject={true} 
          currentPage="locations"
          projectName={project?.name}
          onNavigate={handleNavigation}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-600">Location not found</p>
        </div>
      </div>
    );
  }

  const locationType = location.type || "other";
  const IconComponent = LOCATION_TYPE_ICONS[locationType as keyof typeof LOCATION_TYPE_ICONS] || Globe;

  // Filter related data
  const relatedEvents = events.filter(event => event.locationId === location.id);
  const relatedCharacters = characters.filter(character => 
    character.background?.toLowerCase().includes(location.name.toLowerCase()) ||
    character.description?.toLowerCase().includes(location.name.toLowerCase())
  );

  // Process events for the timeline component
  const processedEvents = relatedEvents.map(event => {
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

  const tabs = [
    { id: "overview", label: "Overview", icon: MapPin },
    { id: "geography", label: "Geography", icon: Mountain },
    { id: "politics", label: "Politics", icon: Crown },
    { id: "characters", label: "Characters", icon: Users },
    { id: "timeline", label: "Timeline", icon: Calendar },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hasActiveProject={true} 
        currentPage="locations"
        projectName={project?.name}
        onNavigate={handleNavigation}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Locations
          </Button>
        </div>

        {/* Location Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-200">
                <IconComponent size={24} className="text-brand-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-950">{location.name}</h1>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-200 text-brand-700 capitalize">
                    {locationType}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
                <Edit size={16} />
                Edit Location
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2">
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-brand-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300'
                  }`}
                >
                  <TabIcon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-3">Description</h3>
                  <div className="prose prose-brand max-w-none">
                    <p className="text-brand-700 leading-relaxed">
                      {location.description || "No description available"}
                    </p>
                  </div>
                </div>
                
                {location.culture && (
                  <div>
                    <h3 className="text-lg font-semibold text-brand-900 mb-3">Culture & Significance</h3>
                    <div className="prose prose-brand max-w-none">
                      <p className="text-brand-700 leading-relaxed">
                        {location.culture}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "geography" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-3">Geography & Environment</h3>
                <div className="prose prose-brand max-w-none">
                  <p className="text-brand-700 leading-relaxed">
                    {location.geography || "No geographical information available"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "politics" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-3">Political Structure</h3>
                <div className="prose prose-brand max-w-none">
                  <p className="text-brand-700 leading-relaxed">
                    {location.politics || "No political information available"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Timeline: Events at {location.name}</h3>
                {processedEvents.length > 0 ? (
                  <div className="bg-brand-50 rounded-lg p-4">
                    <SerpentineTimeline
                      events={processedEvents}
                      characters={characters}
                      locations={locations}
                      onEventClick={handleEventClick}
                      onEventEdit={(event) => setLocation(`/projects/${projectId}/events/${event.id}/edit`)}
                      eventsPerRow={3}
                      maxWidth="800px"
                      responsive={false}
                      showFilters={false}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-brand-400 mx-auto mb-4" />
                    <p className="text-brand-600">No events recorded at this location</p>
                    <p className="text-sm text-brand-500 mt-2">
                      Create events and set their location to see them here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "characters" && (
              <div>
                <h3 className="text-lg font-semibold text-brand-900 mb-4">Related Characters</h3>
                {relatedCharacters.length > 0 ? (
                  <div className="space-y-3">
                    {relatedCharacters.map((character) => (
                      <MiniCard
                        key={character.id}
                        icon={Users}
                        title={character.name}
                        badge={character.type || "character"}
                        badgeVariant="type"
                        onClick={() => handleCharacterClick(character)}
                        variant="editable"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-brand-600 italic">No characters directly connected to this location</p>
                )}
              </div>
            )}
        </div>
      </main>

      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Location"
        description={`Are you sure you want to delete "${location?.name}"? This action cannot be undone and will remove all associated events and data.`}
        itemName={location?.name || "this location"}
      />
    </div>
  );
}